// Path: .\src\app\bookings\payment\[id]\page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RazorpayPayment from '@/components/RazorpayPayment';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react'; // Corrected import
import { useFetch } from '@/hooks/useFetch';
import Link from 'next/link';

// --- Interfaces ---
interface BookingData {
  id: number | string;
  user_id: number | null;
  package_id: number | null;
  total_people: number;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  payment_status: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  package_name?: string;
}
interface GetBookingApiResponse {
  success: boolean;
  data: BookingData | null;
  message?: string;
}
interface PaymentPageState {
    bookingId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    packageName: string;
    startDate: string;
    endDate: string;
    guests: number;
}
interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayErrorResponse {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
}
// --- End Interfaces ---

// --- LoadingSpinner Component (Corrected JSX) ---
const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      {/* Make sure Loader2 is imported */}
      <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);
// --- End LoadingSpinner ---

// --- Main Component Logic ---
function PaymentPageContent() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [paymentPageState, setPaymentPageState] = useState<PaymentPageState | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const apiUrl = bookingId ? `/api/bookings/${bookingId}` : null;
  const { data: apiResponse, error: fetchError, status: fetchStatus } = useFetch<GetBookingApiResponse>(apiUrl);

  // Effect to process fetched data
  useEffect(() => {
    if (fetchStatus === 'success' && apiResponse?.data) {
      const booking = apiResponse.data;
      // Validation
      if (booking.payment_status === 'paid') { router.replace(`/bookings/confirmation/${booking.id}?status=already_paid`); return; }
      if (booking.status === 'cancelled') { setPaymentError("This booking is cancelled."); setPaymentPageState(null); return; }
      // Derive state
      const customerName = booking.guest_name || booking.user_id?.toString() || 'Customer';
      const customerEmail = booking.guest_email || 'N/A';
      const customerPhone = booking.guest_phone || 'N/A';
      setPaymentPageState({
        bookingId: booking.id.toString(),
        amount: booking.total_amount,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        packageName: booking.package_name || `Package ID: ${booking.package_id}`,
        startDate: booking.start_date,
        endDate: booking.end_date,
        guests: booking.total_people,
      });
      setPaymentError(null);
    } else if (fetchStatus === 'success' && !apiResponse?.data) {
      setPaymentError(`Booking with ID ${bookingId} not found.`);
      setPaymentPageState(null);
    } else if (fetchStatus === 'error') {
      setPaymentError(fetchError?.message || 'Failed to load booking details.');
      setPaymentPageState(null);
    }
  }, [fetchStatus, apiResponse, bookingId, fetchError, router]);

  // Handlers
  const handlePaymentSuccess = (response: RazorpaySuccessResponse) => {
    console.log("Payment Successful (Client):", response);
    setPaymentStatus('success');
    router.push(`/bookings/confirmation/${bookingId}?paymentId=${response.razorpay_payment_id}`);
  };
  const handlePaymentFailure = (error: RazorpayErrorResponse) => {
    console.error('Payment Failed (Client):', error);
    setPaymentStatus('failed');
    setPaymentError(`Payment Failed: ${error.description || error.reason || 'Unknown Razorpay error'}`);
  };

  // Render Logic
  if (fetchStatus === 'loading') {
    return <LoadingSpinner message="Loading booking details..." />;
  }

  if (fetchError || paymentError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded shadow-md max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-4">Cannot Proceed with Payment</h2>
          <p className="text-gray-600 mb-4">{fetchError?.message || paymentError || 'An error occurred.'}</p>
          <Link href="/user/bookings" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  if (fetchStatus === 'success' && !paymentPageState) {
    // Handle the case where fetch succeeded but data processing is pending or resulted in null state
    return <LoadingSpinner message="Processing booking data..." />;
  }

  // Ready State
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">Complete Your Payment</h1>
          </div>
          {/* Content */}
          <div className="p-6">
            {paymentStatus === 'idle' && paymentPageState && (
              <>
                {/* Booking Summary */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
                  <div className="border rounded-md p-4 bg-gray-50 text-sm space-y-2">
                    <div className="flex justify-between"><span className="text-gray-600">Booking ID:</span> <span className="font-medium">{paymentPageState.bookingId}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Package:</span> <span className="font-medium">{paymentPageState.packageName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Dates:</span> <span className="font-medium">{paymentPageState.startDate} to {paymentPageState.endDate}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Guests:</span> <span className="font-medium">{paymentPageState.guests}</span></div>
                    <hr className="my-2"/>
                    <div className="flex justify-between pt-1">
                      <span className="text-gray-800 font-semibold">Amount Due:</span>
                      <span className="text-xl font-bold text-blue-700">₹{paymentPageState.amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Display */}
                <div className="mb-6">
                   <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                   <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                       <div className="flex items-center">
                           <div className="h-8 w-auto mr-3"> <img src="/razorpay-logo.png" alt="Razorpay" className="h-full w-auto object-contain" /> </div>
                           <div> <p className="font-medium">Razorpay Secure Checkout</p> <p className="text-sm text-gray-500">Supports Cards, UPI, Net Banking & Wallets</p> </div>
                       </div>
                   </div>
                 </div>

                {/* Razorpay Component */}
                <RazorpayPayment
                  amount={paymentPageState.amount}
                  bookingDetails={{
                    id: paymentPageState.bookingId,
                    customerName: paymentPageState.customerName,
                    customerEmail: paymentPageState.customerEmail,
                    customerPhone: paymentPageState.customerPhone,
                    packageName: paymentPageState.packageName,
                    type: 'Package',
                  }}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                />

                <p className="text-sm text-gray-500 mt-4 text-center">
                  You will be redirected to Razorpay's secure payment page.
                </p>
              </>
            )}
            {/* Success Message */}
            {paymentStatus === 'success' && (
              <div className="text-center py-8 flex flex-col items-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Processing...</h2>
                <p className="text-gray-600">Verifying payment and updating booking status.</p>
                <p className="text-gray-600">Redirecting shortly...</p>
                <Loader2 className="animate-spin h-6 w-6 text-blue-600 mt-4" />
              </div>
            )}
            {/* Failure message handled by the main error block */}
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap with Suspense
export default function PaymentPageWrapper() {
    return (
        <Suspense fallback={<LoadingSpinner message="Loading payment page..." />}>
            <PaymentPageContent />
        </Suspense>
    );
}