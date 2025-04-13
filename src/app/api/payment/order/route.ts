// Path: src/app/api/payment/order/route.ts
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
// Comment out imports specific to the disabled logic
// import Razorpay from 'razorpay';
// import { getDatabase } from '@/lib/database';

// Keep this if other routes need it, but it's likely safe to comment if unused now
// export const dynamic = 'force-dynamic';

interface OrderRequestBody {
    bookingId: number;
    amount: number;
    currency?: string;
    receipt?: string;
}
interface OrderResponseData {
    orderId: string;
    razorpayKeyId: string;
    amount: number;
    currency: string;
    bookingId: number;
}

export async function GET(request: NextRequest) {
    return NextResponse.json({
        success: false,
        message: 'GET method not supported for payment order creation.',
    }, { status: 405 });
}

export async function POST(request: NextRequest) {
    console.warn("--- PAYMENT ORDER API DISABLED ---"); // Log that it's disabled

    // --- Temporarily commented out payment logic ---
    /*
    try {
        const db = getDatabase();
        const body = await request.json() as OrderRequestBody;
        const { bookingId, amount, currency = 'INR', receipt } = body;

        // --- Validation ---
        if (bookingId === undefined || bookingId === null || isNaN(Number(bookingId))) {
            return NextResponse.json({ success: false, message: 'Valid Booking ID is required' }, { status: 400 });
        }
        if (amount === undefined || amount === null || isNaN(Number(amount)) || amount <= 0) {
            return NextResponse.json({ success: false, message: 'Valid positive Amount is required' }, { status: 400 });
        }

        // --- Optional: Verify Booking and Amount from DB ---
        const booking = await db.prepare('SELECT id, total_amount, payment_status FROM bookings WHERE id = ?')
            .bind(bookingId)
            .first<{ id: number; total_amount: number; payment_status: string }>();

        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 });
        }
        if (booking.payment_status === 'paid') {
            return NextResponse.json({ success: false, message: 'This booking has already been paid.' }, { status: 409 });
        }
        if (Number(amount) !== booking.total_amount) {
            console.warn(`Amount mismatch for booking ${bookingId}. Frontend sent: ${amount}, DB expected: ${booking.total_amount}`);
            return NextResponse.json({ success: false, message: 'Payment amount does not match booking amount.' }, { status: 400 });
        }

        // --- Initialize Razorpay ---
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            console.error("Razorpay Key ID or Key Secret is missing from environment variables.");
            return NextResponse.json({ success: false, message: 'Server payment configuration error.' }, { status: 500 });
        }

        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

        // --- Create Razorpay Order ---
        const orderOptions = {
            amount: Math.round(amount * 100),
            currency: currency.toUpperCase(),
            receipt: receipt || `rcpt_booking_${bookingId}_${Date.now()}`,
            notes: { bookingId: bookingId.toString() }
        };

        let order: any;
        try {
            order = await razorpay.orders.create(orderOptions);
            if (!order || !order.id || order.amount === undefined) {
                throw new Error("Razorpay order creation returned an invalid response.");
            }
        } catch (razorpayError: any) {
            console.error('Error creating Razorpay order:', razorpayError);
            const errorMessage = razorpayError?.error?.description || razorpayError?.message || 'Failed to communicate with payment gateway.';
            return NextResponse.json({ success: false, message: `Payment order creation failed: ${errorMessage}` }, { status: 502 });
        }

        // --- Update Booking with Order ID ---
        try {
            const updateResult = await db.prepare('UPDATE bookings SET payment_details = json_set(COALESCE(payment_details, \'{}\'), \'$.razorpayOrderId\', ?) WHERE id = ?')
                .bind(order.id, bookingId).run();
            if (!updateResult.success) {
                console.error(`Failed to update booking ${bookingId} with Razorpay order ID ${order.id}.`);
            }
        } catch (dbError) {
            console.error(`Database error updating booking ${bookingId} with order ID:`, dbError);
        }

        const orderAmountAsNumber = Number(order.amount);
        if (isNaN(orderAmountAsNumber)) {
             return NextResponse.json({ success: false, message: 'Payment gateway returned invalid amount format.' }, { status: 502 });
        }

        const responseData: OrderResponseData = {
            orderId: order.id,
            razorpayKeyId: keyId,
            amount: orderAmountAsNumber,
            currency: order.currency,
            bookingId: bookingId
        };

        return NextResponse.json({ success: true, message: 'Payment order created successfully', data: responseData });

    } catch (error) {
        console.error('Error processing payment order request:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { success: false, message: 'Failed to create payment order due to an internal error.', error: errorMessage },
            { status: 500 }
        );
    }
    */

    // Return a "Not Implemented" response for now
    return NextResponse.json(
        { success: false, message: 'Payment order creation is temporarily disabled.' },
        { status: 501 } // 501 Not Implemented
    );
}