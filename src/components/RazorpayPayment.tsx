// Path: .\src\components\RazorpayPayment.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface PaymentProps {
  amount: number;
  bookingDetails: any;
  onSuccess?: (response: any) => void;
  onFailure?: (error: any) => void;
}

// API response interfaces for /api/payment/order
interface CreateOrderSuccessResponse {
    orderId: string;
    status: number;
}
interface CreateOrderErrorResponse {
    message?: string; error?: string; status?: number;
}

// --- Define API response interfaces for /api/payment/verify ---
interface VerifyPaymentSuccessResponse {
    isOk: true;
    message: string;
    transactionId: string; // razorpayPaymentId
    orderId: string; // orderCreationId
}
interface VerifyPaymentErrorResponse {
    isOk: false;
    message: string;
    error?: string; // Optional detailed error
}
// Union type for verification response
type VerifyPaymentResponse = VerifyPaymentSuccessResponse | VerifyPaymentErrorResponse;
// --- End Verify API Interfaces ---


export default function RazorpayPayment({ amount, bookingDetails, onSuccess, onFailure }: PaymentProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // createOrderId function remains the same...
   const createOrderId = async (): Promise<string | null> => {
     setLoading(true); setError(null);
     try {
       const response = await fetch('/api/payment/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: amount, currency: 'INR', receipt: `booking_${bookingDetails?.id || Date.now()}` }) });
       const data: unknown = await response.json();
       if (!response.ok) { const errorData = data as CreateOrderErrorResponse; const message = errorData?.message || errorData?.error || `Failed order creation. Status: ${response.status}`; throw new Error(message); }
       const successData = data as CreateOrderSuccessResponse;
       if (!successData.orderId) { throw new Error("Order ID missing in response."); }
       return successData.orderId;
     } catch (err) { console.error('Error creating Razorpay order:', err); const message = err instanceof Error ? err.message : 'Could not initiate payment.'; setError(message); if (onFailure) onFailure(err); return null; }
     finally { setLoading(false); }
   };


  // Function to handle payment initialization
  const handlePayment = async () => {
    setError(null);
    if (!scriptLoaded) { setError('Payment gateway loading...'); return; }
    if (amount <= 0) { setError('Invalid amount.'); return; }

    try {
      const orderId = await createOrderId();
      if (!orderId) return;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'Reach Andaman',
        description: `Booking ID: ${bookingDetails?.id || 'N/A'}`,
        order_id: orderId,
        handler: async function (response: any) { // 'response' here is from Razorpay SDK
           setLoading(true);
           setError(null);
           console.log("Razorpay Success Response:", response);
          try {
            // Verify payment on server
            const verificationResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderCreationId: orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                bookingDetails: bookingDetails
              }),
            });

            // --- FIX: Assert type for verificationResult ---
            const verificationResult = await verificationResponse.json() as VerifyPaymentResponse; // Assert Union Type
            // --- End FIX ---

            console.log("Verification Result:", verificationResult);

            // Now TypeScript knows verificationResult has 'isOk'
            if (verificationResult.isOk) { // This check is now type-safe
               console.log("Payment Verified Successfully.");
              if (onSuccess) {
                 // Pass Razorpay's response and potentially verification details
                 onSuccess({ razorpay: response, verification: verificationResult });
              } else {
                  alert('Payment successful!');
              }
            } else {
              // verificationResult is VerifyPaymentErrorResponse here
              console.error("Payment Verification Failed:", verificationResult.message);
              const message = `Payment verification failed: ${verificationResult.message || 'Unknown reason'}`;
              setError(message);
              if (onFailure) { onFailure({ message: message, details: verificationResult }); }
              else { alert(message); }
            }
          } catch (verifyError) {
             console.error('Error during payment verification API call:', verifyError);
             const message = verifyError instanceof Error ? verifyError.message : 'Failed to verify payment.';
             setError(`Verification Error: ${message}`);
             if (onFailure) onFailure(verifyError);
          } finally {
              setLoading(false);
          }
        },
        prefill: {
          name: bookingDetails?.customerName || '',
          email: bookingDetails?.customerEmail || '',
          contact: bookingDetails?.customerPhone || '',
        },
        notes: {
          booking_id: bookingDetails?.id || 'N/A',
          package_name: bookingDetails?.packageName || 'N/A',
        },
        theme: { color: '#2563EB' },
      };

      if (!(window as any).Razorpay) { throw new Error("Razorpay SDK not loaded."); }
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        console.error('Razorpay Payment Failed Response:', response.error);
        const message = response.error?.description || response.error?.reason || 'Payment failed.';
        setError(`Payment Failed: ${message}`);
        if (onFailure) { onFailure(response.error); }
      });
      paymentObject.open();

    } catch (error) {
      console.error('Error initiating payment:', error);
      const message = error instanceof Error ? error.message : 'Could not initiate payment.';
      setError(message);
      if (onFailure && !loading) onFailure(error);
    }
  };

  // handleScriptLoad function remains the same...
   const handleScriptLoad = () => { console.log("Razorpay SDK loaded."); setScriptLoaded(true); };

  // --- JSX return remains the same ---
  return (
    <div className="space-y-3">
      <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" onLoad={handleScriptLoad} onError={(e) => { setError("Failed to load payment gateway."); }} />
      {error && ( <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200"> {error} </div> )}
      <button onClick={handlePayment} disabled={loading || !scriptLoaded || amount <= 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center">
        {loading ? ( <> <Loader2 className="animate-spin h-4 w-4 mr-2" /> Processing... </> ) : ( `Pay ₹${amount.toLocaleString('en-IN')}` )}
      </button>
      {!scriptLoaded && !error && ( <p className="text-xs text-center text-gray-500 mt-1">Initializing...</p> )}
    </div>
  );
}