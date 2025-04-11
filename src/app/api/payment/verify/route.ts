// src/app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDatabase } from '@/lib/database'; // Ensure correct import

// Removed runtime = 'edge'

// Interface for request body
interface VerifyRequestBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  // --- Ensure bookingId is sent from frontend ---
  // It's best practice to associate the payment attempt directly
  // with your internal booking ID. Get this from order notes or hidden form field.
  bookingId: number;
}

// D1 Result Type (Helper)
interface D1UpdateResult {
    success: boolean;
    meta?: { changes?: number };
    error?: string; // D1 errors might appear here
}

// Booking Record structure (Helper)
interface BookingRecord {
    id: number;
    total_amount: number;
    payment_status: string;
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabase();

    // 1. Parse request body
    const body = await request.json() as VerifyRequestBody;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;

    // 2. Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || bookingId === undefined || bookingId === null) {
      return NextResponse.json(
        { success: false, message: 'Missing required payment verification details (order_id, payment_id, signature, bookingId)' },
        { status: 400 }
      );
    }
    if (typeof bookingId !== 'number' || isNaN(bookingId) || bookingId <= 0) {
         return NextResponse.json(
           { success: false, message: 'Invalid bookingId format.' },
           { status: 400 }
         );
    }

    // 3. Get Secret Key
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
        console.error("RAZORPAY_KEY_SECRET is not set.");
        return NextResponse.json(
            { success: false, message: 'Server configuration error: Payment secret missing.' },
            { status: 500 }
        );
    }

    // 4. Verify Signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = shasum.digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.warn(`Payment signature mismatch for order ${razorpay_order_id}.`);
      // Return 400 Bad Request for security reasons (invalid request)
      return NextResponse.json(
        { success: false, message: 'Payment verification failed: Invalid signature' },
        { status: 400 }
      );
    }

    // --- Signature is VALID ---

    // 5. Fetch Booking & Check Status (Recommended)
    const booking = await db
        .prepare('SELECT id, total_amount, payment_status FROM bookings WHERE id = ?')
        .bind(bookingId)
        .first<BookingRecord>();

    if (!booking) {
        console.error(`Payment verification attempt for non-existent booking ID: ${bookingId}`);
        // Even if signature is valid, if booking doesn't exist, it's an issue.
        return NextResponse.json({ success: false, message: 'Booking associated with this payment not found.' }, { status: 404 });
    }

    // If already paid, consider it a success but don't update DB again.
    if (booking.payment_status === 'paid') {
        console.log(`Payment for booking ${bookingId} already marked as paid.`);
         return NextResponse.json({
           success: true,
           message: 'Payment already verified successfully',
           data: { paymentId: razorpay_payment_id, bookingId }
         });
    }

    // 6. Update Booking Status in Database
    const paymentDetailsString = JSON.stringify({
        razorpayOrderId: razorpay_order_id, // Store Razorpay Order ID
        razorpayPaymentId: razorpay_payment_id, // Store Razorpay Payment ID
        signatureVerified: true,
        verifiedAt: new Date().toISOString()
    });

    const updateResult = await db
      .prepare(`
            UPDATE bookings
            SET payment_status = ?,
                payment_details = ?,
                status = ?, -- Also update booking status to confirmed
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
              AND payment_status != ? -- Optional: Prevent race conditions
        `)
      .bind('paid', paymentDetailsString, 'confirmed', bookingId, 'paid')
      .run() as D1UpdateResult;

    // Check if the update was successful and affected one row
    if (!updateResult.success || updateResult.meta?.changes !== 1) {
      console.error(`Failed to update booking status for ID ${bookingId}. D1 Result:`, updateResult);
      // This could happen if the status was already 'paid' due to a race condition,
      // or if there was a DB error.
      // Check if the booking *is* now paid, maybe another process updated it.
      const currentStatus = await db.prepare('SELECT payment_status FROM bookings WHERE id = ?').bind(bookingId).first<{ payment_status: string }>();
      if (currentStatus?.payment_status === 'paid') {
           console.log(`Booking ${bookingId} was likely updated by another process. Considering verification successful.`);
            return NextResponse.json({
               success: true,
               message: 'Payment verified (booking status already updated)',
               data: { paymentId: razorpay_payment_id, bookingId }
            });
      } else {
           // If it's still not 'paid', then the update truly failed.
           return NextResponse.json(
              { success: false, message: 'Failed to update booking status in database.' },
              { status: 500 }
           );
      }
    }

    // 7. TODO: Trigger post-payment actions (e.g., send detailed confirmation email, notify vendor)
    console.log(`Successfully verified payment and updated booking ${bookingId}. Trigger post-payment actions.`);
    // Example: await sendBookingConfirmationEmail(bookingId);
    // Example: await notifyVendor(bookingId);


    // 8. Return Success Response
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully and booking updated.',
      data: {
        paymentId: razorpay_payment_id, // Return payment ID
        bookingId: bookingId          // Return booking ID
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, message: 'Failed to verify payment due to an internal server error.', error: errorMessage },
      { status: 500 }
    );
  }
}

// --- Optional GET handler (can be removed) ---
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    message: 'Use POST to verify payments.',
  }, { status: 405 }); // Method Not Allowed
}