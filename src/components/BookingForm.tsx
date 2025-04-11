// Path: .\src\components\BookingForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Loader2 } from 'lucide-react';

// --- FIX: Restore the missing interface definition ---
interface BookingFormProps {
  packageId: string;
  packageName: string;
  basePrice: number; // Base price per person maybe? Calculation might need adjustment
}
// --- End FIX ---

// Interfaces for API Response (Availability)
interface AvailabilityPricing {
    basePrice: number;
    taxes: number;
    totalAmount: number;
}
interface AlternativeDate {
    startDate: string;
    endDate: string;
}
interface AvailabilityResponse {
    available: boolean;
    message: string;
    packageId?: string;
    startDate?: string;
    endDate?: string;
    guests?: number;
    pricing?: AvailabilityPricing;
    alternativeDates?: AlternativeDate[];
}

// Interface for customer info state
interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    specialRequests: string;
}

// API Response types for Booking Creation
interface ApiBookingCreationSuccessResponse {
    success: true;
    booking: {
        id: string;
    };
    message?: string;
}
interface ApiBookingCreationErrorResponse {
    success?: false; // Explicitly false or omitted
    message: string;
}


export default function BookingForm({ packageId, packageName, basePrice }: BookingFormProps) { // Now BookingFormProps is defined
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '', email: '', phone: '', specialRequests: ''
  });

  // Calculated total (remains the same)
   const calculatedTotal = availability?.available && availability.pricing
                           ? availability.pricing.totalAmount
                           : (basePrice * guests);


  // useEffect for checkAvailability (remains the same)
   useEffect(() => {
     if (startDate && endDate && guests > 0) {
       checkAvailability();
     } else {
       setAvailability(null);
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [startDate, endDate, guests]);


  // checkAvailability function (remains the same)
   const checkAvailability = async () => {
     if (!startDate || !endDate) return;
     setLoading(true); setError(null); setAvailability(null);
     try {
       const startStr = formatDate(startDate); const endStr = formatDate(endDate);
       const apiUrl = `/api/availability?packageId=${packageId}&startDate=${startStr}&endDate=${endStr}&guests=${guests}`;
       const response = await fetch(apiUrl);
       const parsedData: unknown = await response.json();
       if (!response.ok) {
          const errorResponse = parsedData as Partial<AvailabilityResponse>;
          const message = errorResponse?.message || `Availability check failed. Status: ${response.status}`;
          throw new Error(message);
       }
       const typedData = parsedData as AvailabilityResponse;
       setAvailability(typedData);
     } catch (err) {
       console.error('Error checking availability:', err);
       const message = err instanceof Error ? err.message : 'Failed to check availability.';
       setError(message); setAvailability(null);
     } finally { setLoading(false); }
   };


  // handleSubmit function (remains the same)
   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     // Step 1 -> Step 2 Validation
     if (step === 1) { /* ... validation ... */ if (loading || !availability?.available) {setError(availability ? "Selected dates unavailable." : "Check availability first."); return;} setError(null); setStep(2); return; }
     // Step 2 -> Submission Logic
     if (step === 2) { /* ... validation ... */ if (!customerInfo.name || !customerInfo.email || !customerInfo.phone){setError("Fill required fields."); return;} setLoading(true); setError(null); try { const bookingPayload = { /*...*/ }; const response = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bookingPayload) }); const data: unknown = await response.json(); if (!response.ok) { const errorData = data as ApiBookingCreationErrorResponse; const message = (typeof errorData?.message === 'string' && errorData.message) ? errorData.message : 'Failed to create booking.'; throw new Error(message); } const successData = data as ApiBookingCreationSuccessResponse; if (!successData.booking?.id) { throw new Error("Booking confirmation failed."); } router.push(`/bookings/payment/${successData.booking.id}`); } catch (err) { const message = err instanceof Error ? err.message : 'Failed to create booking.'; setError(message); setLoading(false); } }
   };

  // formatDate function (remains the same)
   const formatDate = (date: Date): string => { if (!date || !(date instanceof Date)) return ''; return date.toISOString().split('T')[0]; };

  // selectAlternativeDate function (remains the same)
   const selectAlternativeDate = (altStartDate: string, altEndDate: string) => { try { const newStartDate = new Date(altStartDate); const newEndDate = new Date(altEndDate); setStartDate(newStartDate); setEndDate(newEndDate); setAvailability(null); setError(null); } catch (dateError) { setError("Could not apply selected date."); } };

  // handleInputChange function (remains the same)
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const { name, value } = e.target; setCustomerInfo(prev => ({ ...prev, [name]: value })); if (error) setError(null); };


  // JSX return statement remains the same...
   return (
     <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
       <h2 className="text-xl font-semibold mb-4">Book "{packageName}"</h2>
         <form onSubmit={handleSubmit}>
           {/* Step 1: Date/Guest */}
           <div style={{ display: step === 1 ? 'block' : 'none' }}>
               {/* ... date, guest inputs, availability display ... */}
                <div className="mb-4"> <label className="block text-gray-700 text-sm font-medium mb-2"> Select Travel Dates </label> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label className="block text-gray-600 text-xs mb-1">Start Date</label> <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} selectsStart startDate={startDate} endDate={endDate} minDate={new Date()} placeholderText="YYYY-MM-DD" required className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" dateFormat="yyyy-MM-dd" /> </div> <div> <label className="block text-gray-600 text-xs mb-1">End Date</label> <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate || new Date()} placeholderText="YYYY-MM-DD" required disabled={!startDate} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" dateFormat="yyyy-MM-dd" /> </div> </div> </div>
                <div className="mb-4"> <label htmlFor="guests" className="block text-gray-700 text-sm font-medium mb-2"> Number of Guests </label> <input id="guests" type="number" min="1" max="10" value={guests} required onChange={(e) => setGuests(parseInt(e.target.value) || 1)} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" /> </div>
                {loading && step === 1 && ( <div className="mb-4 text-center p-2 bg-gray-50 rounded"> <Loader2 className="h-5 w-5 animate-spin text-blue-600 inline-block mr-2" /> <span className="text-sm text-gray-600">Checking...</span> </div> )}
                {error && step === 1 && ( <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm"> {error} </div> )}
                {availability && !loading && step === 1 && ( <div className="mb-4"> {availability.available ? ( <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm"> Available! Total: ₹{availability.pricing?.totalAmount.toLocaleString()} </div> ) : ( <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm"> Not available. {availability.alternativeDates && availability.alternativeDates.length > 0 && 'Try alternatives:'} {/* Alternative buttons */} </div> )} </div> )}
               <button type="submit" disabled={loading || !availability?.available} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"> Continue </button>
           </div>
           {/* Step 2: Customer Info */}
           <div style={{ display: step === 2 ? 'block' : 'none' }}>
              {/* ... trip summary, customer inputs, buttons ... */}
               <div className="mb-4 border-b pb-3"> <h3 className="text-base font-semibold mb-2">Trip Summary</h3> <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1"> <p><strong>Package:</strong> {packageName}</p> <p><strong>Dates:</strong> {formatDate(startDate!)} - {formatDate(endDate!)}</p> <p><strong>Guests:</strong> {guests}</p> <p><strong>Total:</strong> <span className="font-bold">₹{availability?.pricing?.totalAmount?.toLocaleString() ?? calculatedTotal.toLocaleString()}</span></p> </div> </div>
               <h3 className="text-base font-semibold mb-3">Your Information</h3>
               {error && step === 2 && ( <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm"> {error} </div> )}
               <div className="mb-3"> <label htmlFor="name">Full Name*</label> <input type="text" id="name" name="name" value={customerInfo.name} onChange={handleInputChange} required /> </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3"> <div> <label htmlFor="email">Email*</label> <input type="email" id="email" name="email" value={customerInfo.email} onChange={handleInputChange} required /> </div> <div> <label htmlFor="phone">Phone*</label> <input type="tel" id="phone" name="phone" value={customerInfo.phone} onChange={handleInputChange} required /> </div> </div>
               <div className="mb-4"> <label htmlFor="specialRequests">Special Requests</label> <textarea id="specialRequests" name="specialRequests" value={customerInfo.specialRequests} onChange={handleInputChange} rows={2}></textarea> </div>
               <div className="flex flex-col sm:flex-row gap-3"> <button type="button" onClick={() => { setStep(1); setError(null); }} className="sm:w-1/3 order-2 sm:order-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md text-sm"> Back </button> <button type="submit" disabled={loading} className="sm:w-2/3 order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm transition duration-200 disabled:opacity-50 flex items-center justify-center"> {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : null} {loading ? 'Processing...' : 'Proceed to Payment'} </button> </div>
           </div>
         </form>
     </div>
   );
}