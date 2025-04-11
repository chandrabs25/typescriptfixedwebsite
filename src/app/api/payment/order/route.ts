// Path: src/app/api/payment/order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
// --- FIX: Import getDatabase instead of db ---
import { getDatabase } from '@/lib/database';
// --- End of FIX ---
const dynamic = 'force-dynamic'
// Removed runtime = 'edge' to allow Node.js dependencies like Razorpay

// Define interface for request body
interface OrderRequestBody {
  bookingId: number;
  amount: number; // Amount in major currency unit (e.g., Rupees)
  currency?: string;
  receipt?: string;
}

// Define interface for successful response data
interface OrderResponseData {
    orderId: string;
    razorpayKeyId: string; // Send key ID to frontend
    amount: number; // Amount in paise (Ensure this is a number)
    currency: string;
    bookingId: number; // Echo back booking ID
}

// GET handler (optional, can be removed if not used)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false, // Indicate GET is not the primary method
    message: 'Payment Order API endpoint. Use POST to create an order.',
  }, { status: 405 }); // Method Not Allowed
}

// POST handler to create a Razorpay order
export async function POST(request: NextRequest) {
  try {
    // --- Get database instance ---
    const db = getDatabase();

    // Parse request body
    const body = await request.json() as OrderRequestBody;
    const { bookingId, amount, currency = 'INR', receipt } = body; // Default receipt generated below if not provided

    // --- Validation ---
    if (bookingId === undefined || bookingId === null || isNaN(Number(bookingId))) {
      return NextResponse.json({ success: false, message: 'Valid Booking ID is required' }, { status: 400 });
    }
    if (amount === undefined || amount === null || isNaN(Number(amount)) || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Valid positive Amount is required' }, { status: 400 });
    }
    // --- End Validation ---

    // --- Optional: Verify Booking and Amount from DB ---
    const booking = await db.prepare('SELECT id, total_amount, payment_status FROM bookings WHERE id = ?')
        .bind(bookingId)
        .first<{ id: number; total_amount: number; payment_status: string }>();

    if (!booking) {
        return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 });
    }
    if (booking.payment_status === 'paid') {
         return NextResponse.json({ success: false, message: 'This booking has already been paid.' }, { status: 409 }); // Conflict
    }
    if (Number(amount) !== booking.total_amount) {
         console.warn(`Amount mismatch for booking ${bookingId}. Frontend sent: ${amount}, DB expected: ${booking.total_amount}`);
         return NextResponse.json({ success: false, message: 'Payment amount does not match booking amount.' }, { status: 400 });
    }
    // --- End Optional Verification ---


    // --- Initialize Razorpay ---
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        console.error("Razorpay Key ID or Key Secret is missing from environment variables.");
        return NextResponse.json({ success: false, message: 'Server payment configuration error.' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    // --- Create Razorpay Order ---
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise (smallest currency unit) and ensure integer
      currency: currency.toUpperCase(), // Ensure uppercase currency code
      receipt: receipt || `rcpt_booking_${bookingId}_${Date.now()}`, // Generate unique receipt ID if not provided
      notes: {
        bookingId: bookingId.toString() // Store booking ID in notes
      }
    };

    let order; // Define order outside try block to access in finally or later
    try {
        // Explicitly type the expected structure from Razorpay if possible, or use 'any' cautiously
        const razorpayOrderResponse: any = await razorpay.orders.create(orderOptions);
        order = razorpayOrderResponse; // Assign the response

        if (!order || !order.id || order.amount === undefined || order.amount === null) { // Check amount existence
            console.error("Razorpay order response missing ID or amount:", order);
            throw new Error("Razorpay order creation returned an invalid response.");
        }
    } catch (razorpayError: any) { // Catch specific Razorpay errors
        console.error('Error creating Razorpay order:', razorpayError);
        const errorMessage = razorpayError?.error?.description || razorpayError?.message || 'Failed to communicate with payment gateway.';
        // Return 502 Bad Gateway if it's a communication issue with Razorpay
        return NextResponse.json({ success: false, message: `Payment order creation failed: ${errorMessage}` }, { status: 502 });
    }


    // --- Update Booking with Order ID (Optional but Recommended) ---
    try {
        const updateResult = await db.prepare(
            'UPDATE bookings SET payment_details = json_set(COALESCE(payment_details, \'{}\'), \'$.razorpayOrderId\', ?) WHERE id = ?'
            )
           .bind(order.id, bookingId)
           .run();
        if (!updateResult.success) {
            console.error(`Failed to update booking ${bookingId} with Razorpay order ID ${order.id}. D1 Result:`, updateResult);
        }
    } catch (dbError) {
        console.error(`Database error updating booking ${bookingId} with order ID:`, dbError);
    }
    // --- End Update Booking ---


    // --- FIX: Ensure amount is a number before assigning ---
    const orderAmountAsNumber = Number(order.amount);
    if (isNaN(orderAmountAsNumber)) {
        console.error(`Failed to parse Razorpay order amount (${order.amount}) as number for order ID ${order.id}`);
        // Decide how to handle - maybe return an error or use 0? Returning error is safer.
        return NextResponse.json({ success: false, message: 'Payment gateway returned invalid amount format.' }, { status: 502 });
    }
    // --- End of FIX ---


    // Return necessary order details to the frontend
    const responseData: OrderResponseData = {
        orderId: order.id,
        razorpayKeyId: keyId,
        amount: orderAmountAsNumber, // Use the parsed number
        currency: order.currency,
        bookingId: bookingId
    };

    return NextResponse.json({
      success: true,
      message: 'Payment order created successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error processing payment order request:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, message: 'Failed to create payment order due to an internal error.', error: errorMessage },
      { status: 500 }
    );
  }
}