// Path: .\src\app\bookings\confirmation\[id]\page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertTriangle, CheckCircle, MapPin } from 'lucide-react'; // Ensure all needed icons are imported
import { useFetch } from '@/hooks/useFetch';

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
  payment_details: string | null;
  special_requests: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  created_at: string;
  updated_at: string;
  package_name?: string; // Optional joined data
  vendor_name?: string;  // Optional joined data
  vendor_email?: string; // Optional joined data
  vendor_phone?: string; // Optional joined data
}
interface GetBookingApiResponse {
  success: boolean;
  data: BookingData | null;
  message?: string;
}
interface ParsedPaymentDetails {
    orderId?: string;
    paymentId?: string;
    signatureVerified?: boolean;
    // Add other fields if stored in JSON
}
// --- End Interfaces ---

// --- LoadingSpinner Component ---
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    {/* Ensure Loader2 is imported */}
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <span className="ml-2">Loading confirmation...</span>
  </div>
);
// --- End LoadingSpinner ---

// --- Main Component Logic ---
function ConfirmationContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const bookingId = params.id as string;
  const urlPaymentId = searchParams.get('paymentId'); // Get from URL query
  const apiUrl = bookingId ? `/api/bookings/${bookingId}` : null;

  // Fetch booking data
  const { data: apiResponse, error, status } = useFetch<GetBookingApiResponse>(apiUrl);
  const bookingDetails = apiResponse?.data;

  // --- Loading State ---
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  // --- Error State ---
  if (status === 'error') {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-10">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Confirmation</h2>
            <p className="text-gray-700 mb-6">{error?.message || 'Could not fetch booking details.'}</p>
            <Link href="/user/bookings" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
             Back to My Bookings
            </Link>
        </div>
     );
  }

  // --- Not Found State ---
  if (status === 'success' && !bookingDetails) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-10">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">Could not find details for booking ID: {bookingId}</p>
             <Link href="/user/bookings" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
             Back to My Bookings
            </Link>
        </div>
    );
  }

  // --- Guard Clause ---
  // This check ensures bookingDetails is not null/undefined below this point
  if (!bookingDetails) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-10">
            <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Data Error</h2>
            <p className="text-gray-600 mb-6">Could not display booking details. Please try refreshing.</p>
             <Link href="/user/bookings" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
             Back to My Bookings
            </Link>
        </div>
    );
  }

  // --- Process Data for Display ---
  let parsedPaymentDetails: ParsedPaymentDetails = {};
  if (bookingDetails.payment_details) {
       try {
           parsedPaymentDetails = JSON.parse(bookingDetails.payment_details);
       } catch (e) {
           console.error("Failed to parse payment details JSON:", bookingDetails.payment_details);
       }
   }
  const finalPaymentId = parsedPaymentDetails?.paymentId || urlPaymentId || 'N/A';

  const customerName = bookingDetails.guest_name || bookingDetails.user_id?.toString() || 'N/A';
  const customerEmail = bookingDetails.guest_email || 'N/A'; // TODO: Fetch user email if user_id exists
  const customerPhone = bookingDetails.guest_phone || 'N/A'; // TODO: Fetch user phone if user_id exists

  // Handlers
  const handleDownloadReceipt = () => {
     alert('Receipt download functionality to be implemented.');
  };
  const handleViewItinerary = () => {
     if (bookingDetails.package_id) {
       router.push(`/packages/${bookingDetails.package_id}`);
     } else {
       alert("Package details unavailable for this booking.");
     }
  };
  // --- End Data Processing ---

  // === Success State Render ===
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="px-6 py-8 border-b text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
              <p className="text-gray-600">
                  {bookingDetails.payment_status === 'paid'
                    ? 'Your booking is confirmed and payment was successful.'
                    : 'Your booking is confirmed. Payment status: ' + bookingDetails.payment_status
                  }
              </p>
            </div>

            <div className="p-6">
              {/* Booking Details */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Booking Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                   <div> <p className="text-gray-500 mb-1">Booking ID</p> <p className="font-medium break-words">{bookingDetails.id}</p> </div>
                   <div> <p className="text-gray-500 mb-1">Package</p> <p className="font-medium">{bookingDetails.package_name || `Package ID: ${bookingDetails.package_id || 'N/A'}`}</p> </div>
                   <div> <p className="text-gray-500 mb-1">Travel Dates</p> <p className="font-medium">{bookingDetails.start_date} to {bookingDetails.end_date}</p> </div>
                   <div> <p className="text-gray-500 mb-1">Guests</p> <p className="font-medium">{bookingDetails.total_people}</p> </div>
                    {bookingDetails.special_requests && (
                        <div className="md:col-span-2"> <p className="text-gray-500 mb-1">Special Requests</p> <p className="font-medium whitespace-pre-wrap">{bookingDetails.special_requests}</p> </div>
                    )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Payment Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                   <div> <p className="text-gray-500 mb-1">Total Amount</p> <p className="font-medium">₹{bookingDetails.total_amount.toLocaleString('en-IN')}</p> </div>
                   <div> <p className="text-gray-500 mb-1">Payment Status</p> <p className="font-medium capitalize">{bookingDetails.payment_status}</p> </div>
                   {bookingDetails.payment_status === 'paid' && (
                       <>
                           <div> <p className="text-gray-500 mb-1">Payment ID</p> <p className="font-medium break-words">{finalPaymentId}</p> </div>
                           <div> <p className="text-gray-500 mb-1">Payment Method</p> <p className="font-medium">Online (Razorpay)</p> </div>
                           {/* Add Payment Date if stored and parsed */}
                       </>
                   )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                 <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Your Information</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div> <p className="text-gray-500 mb-1">Name</p> <p className="font-medium">{customerName}</p> </div>
                      <div> <p className="text-gray-500 mb-1">Email</p> <p className="font-medium break-words">{customerEmail}</p> </div>
                      <div> <p className="text-gray-500 mb-1">Phone</p> <p className="font-medium">{customerPhone}</p> </div>
                 </div>
              </div>

              {/* Vendor Info Placeholder */}
              {/*
               <div className="mb-8">
                 <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Vendor Information</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"> ... Vendor details ... </div>
               </div>
               */}

              {/* Confirmation Message */}
              <div className="bg-blue-50 p-4 rounded-md mb-8">
                <p className="text-sm text-blue-700">
                  A confirmation email{customerEmail !== 'N/A' ? ` has been sent to ${customerEmail}` : ''} with all the details. Please check your inbox (and spam folder).
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  <button
                    onClick={handleDownloadReceipt}
                    disabled={bookingDetails.payment_status !== 'paid'}
                    className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-md flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  > Download Receipt </button>
                  <button
                    onClick={handleViewItinerary}
                    disabled={!bookingDetails.package_id}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  > View Package Details </button>
              </div>
            </div>
          </div>
          {/* Return Link */}
          <div className="mt-8 text-center">
             <Link href="/user/bookings" className="text-blue-600 hover:text-blue-800 font-medium"> View All My Bookings </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap the main content component with Suspense
export default function BookingConfirmationPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ConfirmationContent />
        </Suspense>
    );
}