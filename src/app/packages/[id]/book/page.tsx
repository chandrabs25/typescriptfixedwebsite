
'use client';

// Path: .\src\app\packages\[id]\book\page.tsx
/// <reference types="styled-jsx" />



import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Calendar, Users, CreditCard, Check, AlertTriangle, Clock, Loader2 } from 'lucide-react';
// Assuming LoadingState is exported/available from useFetch, if not, define it locally or remove its usage if not needed
import { useFetch, useSubmit, LoadingState } from '@/hooks/useFetch';
import { useAuth } from '@/hooks/useAuth';

// --- Interfaces ---
interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  adults: number;
  children: number;
  startDate: string;
  specialRequests: string;
}

interface PackageData {
  id: number;
  name: string;
  duration: string;
  base_price: number;
  max_people: number | null;
  description: string | null;
  images: string | null;
  is_active: number; // 0 or 1
}

interface User {
    id: number | string;
    first_name?: string;
    last_name?: string;
    email?: string;
    role_id?: number;
}

// Type for the data expected back from the API upon SUCCESSFUL booking creation
interface SubmissionSuccessData {
    id: number | string; // Expect booking ID back
    // Add other fields if API returns more on success
}

// Type for the data SENT TO the API to create a booking
interface BookingPayload {
  package_id: number;
  user_id?: number | string | null;
  total_people: number;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
  special_requests: string | null;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
}
// --- End Interfaces ---

// --- Loading Spinner Component (Example) ---
const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
    <div className="flex justify-center items-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        <span>{message}</span>
    </div>
);
// --- End Loading Spinner ---

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;

  // --- Early return for invalid packageId ---
  if (!packageId || typeof packageId !== 'string' || isNaN(parseInt(packageId))) {
      return (
        <div className="bg-gray-100 min-h-screen py-12 flex items-center justify-center">
          <div className="text-center p-6 bg-white shadow-md rounded-lg max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Invalid Package Request</h2>
            <p className="text-gray-600 mt-2 mb-4">The package ID provided in the URL is missing or invalid.</p>
            <Link href="/packages" className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-150">
              Browse Packages
            </Link>
          </div>
        </div>
      );
  }
  // --- End Early return ---

  const { user, isLoading: authLoading } = useAuth() as { user: User | null, isLoading: boolean };

  const { data: fetchedPackageData, error: packageError, status: packageStatus } =
    useFetch<PackageData>(`/api/packages/${packageId}`);
  const packageData = fetchedPackageData;

  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '', lastName: '', email: '', phone: '',
    adults: 1, children: 0, startDate: '', specialRequests: ''
  });
  const [error, setError] = useState(''); // Local form/validation errors

  // useEffect for user data
  useEffect(() => {
      if (user && !formData.firstName && !formData.lastName && !formData.email) {
          setFormData(prev => ({ ...prev, firstName: user.first_name || '', lastName: user.last_name || '', email: user.email || '' }));
      }
      if (!user && (formData.firstName || formData.lastName || formData.email)) {
          setFormData(prev => ({ ...prev, firstName: '', lastName: '', email: '' }));
      }
  }, [user, formData.firstName, formData.lastName, formData.email]);


  const [step, setStep] = useState(1);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const {
    submit,
    status: submissionStatus,
    error: submissionError,
    data: submissionData
  } = useSubmit<SubmissionSuccessData, BookingPayload>('/api/bookings');

  // useEffect for redirect
  useEffect(() => {
      const successData = submissionData as SubmissionSuccessData | null;
      if (submissionStatus === 'success' && successData?.id && router) {
          router.push(`/bookings/payment/${successData.id}`);
      } else if (submissionStatus === 'error') {
         console.error("Booking Submission Error:", submissionError);
      }
  }, [submissionStatus, submissionData, router, submissionError]);


  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
     const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); if (error) setError('');
  };
  const handleNumberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 })); if (error) setError('');
  };
  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTermsAgreed(e.target.checked); if (error) setError('');
  };

  // useCallback functions
  const calculateTotal = useCallback((): number => {
      if (!packageData) return 0;
      const adultTotal = formData.adults * packageData.base_price;
      const childTotal = (Number(formData.children) || 0) * (packageData.base_price * 0.7);
      const total = adultTotal + childTotal;
      return isNaN(total) ? 0 : total;
  }, [packageData, formData.adults, formData.children]);

  const calculateEndDate = useCallback((): string => {
      if (!formData.startDate || !packageData?.duration) return '';
      try {
          const startDateObj = new Date(formData.startDate + 'T00:00:00Z');
          const durationMatch = packageData.duration.match(/(\d+)\s*Day/i);
          const durationDays = durationMatch ? (parseInt(durationMatch[1], 10) - 1) : 4;
          if (isNaN(startDateObj.getTime()) || isNaN(durationDays) || durationDays < 0) return '';
          const endDateObj = new Date(startDateObj);
          endDateObj.setUTCDate(startDateObj.getUTCDate() + durationDays);
          return endDateObj.toISOString().split('T')[0];
      } catch { return ''; }
  }, [formData.startDate, packageData?.duration]);

  // handleSubmit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');

      if (step === 1) {
          if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.startDate || formData.adults < 1) { alert("Please fill required fields..."); return; }
          if (packageData && (formData.adults + formData.children > (packageData.max_people ?? Infinity))) { alert(`Max travelers: ${packageData.max_people}.`); return; }
          nextStep();
          return;
      }

      if (step === 2) {
          if (!termsAgreed) { setError("Please agree to terms."); return; }
          if (!packageData) { setError("Package data not loaded."); return; }
          const calculatedEndDate = calculateEndDate();
          if (!calculatedEndDate) { setError("Could not determine end date."); return; }

          const payload: BookingPayload = {
              package_id: parseInt(packageId, 10),
              user_id: user?.id || null,
              total_people: formData.adults + formData.children,
              start_date: formData.startDate,
              end_date: calculatedEndDate,
              total_amount: calculateTotal(),
              status: 'pending',
              special_requests: formData.specialRequests || null,
              guest_name: !user ? formData.firstName : null,
              guest_email: !user ? formData.email : null,
              guest_phone: !user ? formData.phone : null,
          };

          try {
              console.log("Submitting Booking Payload:", payload);
              // --- FIX: Add 'as any' assertion as a workaround ---
              // This tells TypeScript to ignore the type check for this specific call
              await (submit as any)(payload);
              // --- End FIX ---
          }
          catch (err) {
              console.error("Direct error during submit call (less likely):", err);
              // submissionError from the hook is the primary way to see API errors
              setError(`Submission failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
      }
  };

  // Step Navigation
  const nextStep = () => { if (step < 2) { setStep(step + 1); window.scrollTo(0, 0); } };
  const prevStep = () => { if (step > 1) { setStep(step - 1); setError(''); window.scrollTo(0, 0); } };

  // --- Initial Loading/Error States ---
  const initialLoading = authLoading || packageStatus === 'loading';
  const initialError = packageError;

  if (initialLoading) {
      return ( <div className="bg-gray-100 min-h-screen py-12 flex items-center justify-center"> <div className="text-center"> <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" /> <h2 className="text-xl font-semibold text-gray-700">Loading Booking Details...</h2> </div> </div> );
  }
  if (initialError) {
      return ( <div className="bg-gray-100 min-h-screen py-12"> <div className="container mx-auto px-4"> <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-3xl mx-auto" role="alert"> <strong className="font-bold mr-2">Error Loading Package!</strong> <span className="block sm:inline">{initialError?.message || "Failed to load package details."}</span> <div className="mt-4"> <Link href="/packages" className="text-blue-600 hover:underline font-medium"> Return to Packages </Link> </div> </div> </div> </div> );
  }
  if (packageStatus === 'success' && (!packageData || packageData.is_active !== 1)) {
      return ( <div className="bg-gray-100 min-h-screen py-12"> <div className="container mx-auto px-4"> <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative max-w-3xl mx-auto" role="alert"> <strong className="font-bold mr-2">Package Not Available</strong> <span className="block sm:inline">{!packageData ? "The requested package could not be found." : "This package is currently not available."}</span> <div className="mt-4"> <Link href="/packages" className="text-blue-600 hover:underline font-medium"> Browse Available Packages </Link> </div> </div> </div> </div> );
  }
  if (!packageData) { // Guard clause after loading/error checks
       return ( <div className="bg-gray-100 min-h-screen py-12 flex items-center justify-center"> <div className="text-center"> <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" /> <h2 className="text-xl font-semibold text-gray-700">Could Not Load Package Data</h2> <p className="text-gray-600 mt-2">Please try refreshing the page or go back.</p> </div> </div> );
   }
  // --- End Initial Loading/Error States ---

  // --- Main Component Render ---
  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Book Your Adventure</h1>
              <p className="text-lg text-gray-600">Securely book the "{packageData.name}" package.</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
              <div className="w-full max-w-lg">
                  <div className="flex items-center justify-between">
                       <div className={`step-item ${step >= 1 ? 'active' : ''}`}> <div className="step-circle">1</div> <span className="step-label">Details</span> </div>
                       <div className={`step-connector ${step >= 2 ? 'active' : ''}`}></div>
                       <div className={`step-item ${step >= 2 ? 'active' : ''}`}> <div className="step-circle">2</div> <span className="step-label">Review & Confirm</span> </div>
                  </div>
               </div>
          </div>

          {/* Error Display */}
          {submissionStatus === 'error' && (
              <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-3xl mx-auto" role="alert">
                  <p className="font-bold">Booking Error</p>
                  <p>{submissionError?.message || "An unexpected API error occurred."}</p>
              </div>
          )}
          {error && ( // Local validation error
              <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-3xl mx-auto" role="alert"><p>{error}</p></div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area (Form Steps) */}
              <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                      {/* STEP 1: Details */}
                      <div data-step-active={step === 1} className={step === 1 ? 'p-6 md:p-8 animate-fade-in' : 'hidden'}>
                           <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">1. Traveler & Trip Details</h2>
                           <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} noValidate>
                               {/* Input Fields */}
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                   <div><label htmlFor="firstName">First Name<span className="text-red-500">*</span></label><input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required /></div>
                                   <div><label htmlFor="lastName">Last Name<span className="text-red-500">*</span></label><input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required /></div>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                   <div><label htmlFor="email">Email<span className="text-red-500">*</span></label><input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required /></div>
                                   <div><label htmlFor="phone">Phone<span className="text-red-500">*</span></label><input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required /></div>
                               </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                                    <div><label htmlFor="adults">Adults<span className="text-red-500">*</span></label><select id="adults" name="adults" value={formData.adults} onChange={handleNumberChange} required> {[...Array(Math.min(packageData.max_people ?? 10, 10))].map((_, i) => ( <option key={`adult-${i + 1}`} value={i + 1}>{i + 1}</option> ))} </select></div>
                                    <div><label htmlFor="children">Children</label><select id="children" name="children" value={formData.children} onChange={handleNumberChange}> {[...Array(Math.max(0, (packageData.max_people ?? 10) - formData.adults + 1))].map((_, i) => ( <option key={`child-${i}`} value={i}>{i}</option> ))} </select></div>
                                    <div><label htmlFor="startDate">Start Date<span className="text-red-500">*</span></label><input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} required min={new Date().toISOString().split('T')[0]} /></div>
                                </div>
                                {(formData.adults + formData.children > (packageData.max_people ?? Infinity)) && <p className="text-xs text-red-600 my-2">Total travelers exceed package limit ({packageData.max_people}).</p> }
                               <div className="mb-6"><label htmlFor="specialRequests">Special Requests</label><textarea id="specialRequests" name="specialRequests" value={formData.specialRequests} onChange={handleInputChange} rows={3}></textarea></div>
                               {/* Step 1 Button */}
                                <div className="flex justify-end pt-4 border-t">
                                    <button type="submit" disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.startDate || formData.adults < 1 || (formData.adults + formData.children > (packageData.max_people ?? Infinity))} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-150 ease-in-out disabled:opacity-50">
                                        Review Booking →
                                    </button>
                                </div>
                           </form>
                       </div>
                      {/* STEP 2: Review & Confirm */}
                      <div data-step-active={step === 2} className={step === 2 ? 'p-6 md:p-8 animate-fade-in' : 'hidden'}>
                          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">2. Review & Confirm Booking</h2>
                          <div className="space-y-5">
                              {/* Package & Dates Summary */}
                               <div className="border border-gray-200 rounded-md p-4">
                                   <h3 className="font-semibold text-lg text-gray-700 mb-3 flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-600" /> Package & Dates</h3>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                       <div><p className="text-gray-500">Package:</p><p className="font-medium">{packageData.name}</p></div>
                                       <div><p className="text-gray-500">Duration:</p><p className="font-medium">{packageData.duration}</p></div>
                                       <div><p className="text-gray-500">Start:</p><p className="font-medium">{formData.startDate ? formatDate(formData.startDate) : 'N/A'}</p></div>
                                       <div><p className="text-gray-500">End (Approx.):</p><p className="font-medium">{calculateEndDate() ? formatDate(calculateEndDate()) : 'N/A'}</p></div>
                                   </div>
                               </div>
                              {/* Traveler Info Summary */}
                               <div className="border border-gray-200 rounded-md p-4">
                                   <h3 className="font-semibold text-lg text-gray-700 mb-3 flex items-center"><Users className="w-5 h-5 mr-2 text-blue-600" /> Traveler Information</h3>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div><p className="text-gray-500">Name:</p><p className="font-medium">{formData.firstName} {formData.lastName}</p></div>
                                        <div><p className="text-gray-500">Email:</p><p className="font-medium break-words">{formData.email}</p></div>
                                        <div><p className="text-gray-500">Phone:</p><p className="font-medium">{formData.phone}</p></div>
                                        <div><p className="text-gray-500">Travelers:</p><p className="font-medium">{formData.adults} Adult{formData.adults !== 1 ? 's' : ''}{formData.children > 0 ? `, ${formData.children} Child${formData.children !== 1 ? 'ren' : ''}` : ''}</p></div>
                                   </div>
                               </div>
                              {/* Special Requests Summary */}
                              {formData.specialRequests && ( <div className="border border-gray-200 rounded-md p-4"> <h3 className="font-semibold text-lg text-gray-700 mb-2">Special Requests</h3> <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.specialRequests}</p> </div> )}
                              {/* Price Breakdown Summary */}
                               <div className="border border-gray-200 rounded-md p-4">
                                   <h3 className="font-semibold text-lg text-gray-700 mb-3 flex items-center"><CreditCard className="w-5 h-5 mr-2 text-blue-600" /> Price Breakdown</h3>
                                   <div className="space-y-2 text-sm">
                                       <div className="flex justify-between"><p>Adults ({formData.adults} × ₹{packageData.base_price.toLocaleString('en-IN')})</p><p>₹{(formData.adults * packageData.base_price).toLocaleString('en-IN')}</p></div>
                                       {formData.children > 0 && ( <div className="flex justify-between"><p>Children ({formData.children} × ₹{(packageData.base_price * 0.7).toLocaleString('en-IN', { maximumFractionDigits: 0 })}) <span className="text-xs">(70% Price)</span></p><p>₹{(formData.children * packageData.base_price * 0.7).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p></div> )}
                                    </div>
                                   <div className="flex justify-between font-bold text-base pt-3 mt-2 border-t border-gray-200">
                                       <p>Total Amount</p>
                                       <p>₹{calculateTotal().toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                                   </div>
                               </div>
                              {/* Terms Agreement */}
                              <div className="mt-6">
                                  <div className="flex items-start">
                                      <div className="flex items-center h-5"> <input id="terms" name="terms" type="checkbox" checked={termsAgreed} onChange={handleTermsChange} required className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"/> </div>
                                      <div className="ml-3 text-sm"> <label htmlFor="terms" className="font-medium text-gray-700"> I agree to the <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms</Link> and <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy</Link>. <span className="text-red-500">*</span> </label> </div>
                                  </div>
                              </div>
                          </div>
                          {/* Action Buttons for Step 2 */}
                          <form onSubmit={handleSubmit}>
                              <div className="flex justify-between mt-8 pt-4 border-t">
                                  <button type="button" onClick={prevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md transition duration-150 ease-in-out"> ← Back to Details </button>
                                  <button type="submit" disabled={submissionStatus === 'loading' || !termsAgreed} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-8 rounded-md flex items-center justify-center transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed min-w-[180px]">
                                      {submissionStatus === 'loading' ? ( <> <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"/> Processing... </> ) : ( 'Confirm & Proceed to Payment' )}
                                  </button>
                              </div>
                          </form>
                      </div>
                  </div> {/* End bg-white */}
              </div> {/* End lg:col-span-2 */}

              {/* Sidebar */}
              <div className="lg:col-span-1">
                  <div className="sticky top-6">
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                           <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white"> <h3 className="font-semibold text-xl">Package Summary</h3> </div>
                           <div className="p-5 space-y-4">
                               {packageData.images && ( <img src={packageData.images.split(',')[0]} alt={`Image for ${packageData.name}`} className="rounded-md object-cover w-full h-40 mb-3" onError={(e)=>(e.currentTarget.style.display='none')}/> )}
                               <h4 className="font-semibold text-lg text-gray-800">{packageData.name}</h4>
                               <p className="text-sm text-gray-600 line-clamp-3">{packageData.description}</p>
                               <div className="space-y-3 text-sm pt-3 border-t border-gray-100">
                                   <div className="flex items-center text-gray-700"> <Calendar className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0"/> <span className="font-medium mr-1">Duration:</span> <span className="text-gray-600">{packageData.duration}</span> </div>
                                   <div className="flex items-center text-gray-700"> <Users className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0"/> <span className="font-medium mr-1">Travelers:</span> <span className="text-gray-600">{formData.adults} Adult{formData.adults!==1?'s':''}{formData.children > 0 ? `, ${formData.children} Child${formData.children!==1?'ren':''}` : ''}</span> </div>
                                   {formData.startDate && ( <div className="flex items-center text-gray-700"> <Calendar className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0"/> <span className="font-medium mr-1">Start Date:</span> <span className="text-gray-600">{formatDate(formData.startDate)}</span> </div> )}
                               </div>
                               <div className="border-t border-gray-100 pt-4 mt-4">
                                   <h5 className="font-semibold text-md text-gray-700 mb-2">Price Details</h5>
                                   <div className="space-y-1 text-sm mb-3">
                                       <div className="flex justify-between"> <span className="text-gray-600">Adults ({formData.adults})</span> <span className="text-gray-700">₹{(formData.adults * packageData.base_price).toLocaleString('en-IN')}</span> </div>
                                       {formData.children > 0 && ( <div className="flex justify-between"> <span className="text-gray-600">Children ({formData.children})</span> <span className="text-gray-700">₹{(formData.children * packageData.base_price * 0.7).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span> </div> )}
                                   </div>
                                   <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200"> <span>Total</span> <span>₹{calculateTotal().toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span> </div>
                               </div>
                               <div className="text-xs text-gray-500 pt-4 border-t border-gray-100 space-y-1">
                                   <p className="flex items-center"> <Check className="h-3 w-3 text-green-500 mr-1.5 flex-shrink-0"/> Instant Confirmation (Subject to availability) </p>
                                   <p className="flex items-center"> <Check className="h-3 w-3 text-green-500 mr-1.5 flex-shrink-0"/> Secure Payment Processing </p>
                                   <p className="flex items-center"> <AlertTriangle className="h-3 w-3 text-yellow-600 mr-1.5 flex-shrink-0"/> Review cancellation policy before booking. </p>
                               </div>
                           </div>
                      </div>
                  </div>
              </div>
          </div> {/* End Grid */}
      </div> {/* End Container */}
       <StepStyles /> {/* Render styles */}
    </div> /* End bg-gray-100 */
  );
}

// Helper function to format date
function formatDate(dateString: string): string {
    try { return new Date(dateString + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }); }
    catch { return 'Invalid Date'; }
}

// CSS Styles Component
const StepStyles = () => ( <style jsx global>{`
    /* ... CSS rules ... */
    .step-item { display: flex; flex-direction: column; align-items: center; transition: color 0.3s ease; color: #9ca3af; /* gray-400 */ }
    .step-item.active { color: #2563eb; /* blue-600 */ }
    .step-circle { width: 2.5rem; height: 2.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #e5e7eb; /* gray-200 */ color: #6b7280; /* gray-500 */ font-weight: bold; margin-bottom: 0.5rem; transition: background-color 0.3s ease, color 0.3s ease; border: 1px solid transparent; }
    .step-item.active .step-circle { background-color: #2563eb; /* blue-600 */ color: white; border-color: #1d4ed8; }
    .step-label { font-size: 0.875rem; text-align: center; }
    .step-connector { flex: 1; height: 2px; background-color: #e5e7eb; /* gray-200 */ margin: 0 0.5rem; transform: translateY(calc(-1.25rem - 0.25rem)); transition: background-color 0.3s ease; }
    .step-connector.active { background-color: #2563eb; /* blue-600 */ }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="number"], select, textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4); }
    label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-medium; color: #374151; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    input[type="checkbox"] { height: 1rem; width: 1rem; border-radius: 0.25rem; border-color: #d1d5db; }
    label span.text-red-500 { color: #ef4444; margin-left: 0.125rem;}
    /* Added explicit display for step content */
    [data-step-active="false"] { display: none; }
    [data-step-active="true"] { display: block; }
`}</style> );