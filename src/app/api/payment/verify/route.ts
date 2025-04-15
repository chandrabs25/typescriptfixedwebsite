// src/app/api/payment/verify/route.ts
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
// Comment out imports specific to the disabled logic
// import crypto from 'crypto';
// import { getDatabase } from '@/lib/database';

// Keep this if other routes need it, but it's likely safe to comment if unused now
// export const dynamic = 'force-dynamic';

interface VerifyRequestBody {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    bookingId: number;
}

interface D1UpdateResult {
    success: boolean;
    meta?: { changes?: number };
    error?: string;
}

interface BookingRecord {
    id: number;
    total_amount: number;
    payment_status: string;
}

export async function POST(request: NextRequest) {
    console.warn("--- PAYMENT VERIFY API DISABLED ---"); // Log that it's disabled

    // --- Temporarily commented out payment verification logic ---
    /*
    try {
        const db = getDatabase();
        const body = await request.json() as VerifyRequestBody;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;

        // --- Validation ---
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || bookingId === undefined || bookingId === null) {
            return NextResponse.json({ success: false, message: 'Missing required payment verification details' }, { status: 400 });
        }
         if (typeof bookingId !== 'number' || isNaN(bookingId) || bookingId <= 0) {
            return NextResponse.json({ success: false, message: 'Invalid bookingId format.' }, { status: 400 });
         }

        // --- Get Secret Key ---
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            console.error("RAZORPAY_KEY_SECRET is not set.");
            return NextResponse.json({ success: false, message: 'Server configuration error: Payment secret missing.' }, { status: 500 });
        }

        // --- Verify Signature ---
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generated_signature = shasum.digest('hex');

        if (generated_signature !== razorpay_signature) {
            console.warn(`Payment signature mismatch for order ${razorpay_order_id}.`);
            return NextResponse.json({ success: false, message: 'Payment verification failed: Invalid signature' }, { status: 400 });
        }

        // --- Fetch Booking & Check Status ---
        const booking = await db.prepare('SELECT id, total_amount, payment_status FROM bookings WHERE id = ?')
            .bind(bookingId).first<BookingRecord>();

        if (!booking) {
            console.error(`Payment verification attempt for non-existent booking ID: ${bookingId}`);
            return NextResponse.json({ success: false, message: 'Booking associated with this payment not found.' }, { status: 404 });
        }
        if (booking.payment_status === 'paid') {
            console.log(`Payment for booking ${bookingId} already marked as paid.`);
            return NextResponse.json({ success: true, message: 'Payment already verified successfully', data: { paymentId: razorpay_payment_id, bookingId } });
        }

        // --- Update Booking Status in Database ---
        const paymentDetailsString = JSON.stringify({
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            signatureVerified: true,
            verifiedAt: new Date().toISOString()
        });

        const updateResult = await db.prepare(`UPDATE bookings SET payment_status = ?, payment_details = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND payment_status != ?`)
            .bind('paid', paymentDetailsString, 'confirmed', bookingId, 'paid').run() as D1UpdateResult;

        if (!updateResult.success || updateResult.meta?.changes !== 1) {
            console.error(`Failed to update booking status for ID ${bookingId}. D1 Result:`, updateResult);
            const currentStatus = await db.prepare('SELECT payment_status FROM bookings WHERE id = ?').bind(bookingId).first<{ payment_status: string }>();
            if (currentStatus?.payment_status === 'paid') {
                console.log(`Booking ${bookingId} was likely updated by another process. Considering verification successful.`);
                return NextResponse.json({ success: true, message: 'Payment verified (booking status already updated)', data: { paymentId: razorpay_payment_id, bookingId } });
            } else {
                return NextResponse.json({ success: false, message: 'Failed to update booking status in database.' }, { status: 500 });
            }
        }

        // --- TODO: Trigger post-payment actions ---
        console.log(`Successfully verified payment and updated booking ${bookingId}. Trigger post-payment actions.`);

        return NextResponse.json({ success: true, message: 'Payment verified successfully and booking updated.', data: { paymentId: razorpay_payment_id, bookingId: bookingId } });

    } catch (error) {
        console.error('Error verifying payment:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { success: false, message: 'Failed to verify payment due to an internal server error.', error: errorMessage },
            { status: 500 }
        );
    }
    */

    // Return a "Not Implemented" response for now
    return NextResponse.json(
        { success: false, message: 'Payment verification is temporarily disabled.' },
        { status: 501 } // 501 Not Implemented
    );
}

export async function GET(request: NextRequest) {
    return NextResponse.json({
        success: false,
        message: 'Use POST to verify payments.',
    }, { status: 405 });
}