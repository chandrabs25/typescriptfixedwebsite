// Path: .\src\app\packages\[id]\page.tsx
'use client';
export const dynamic = 'force-dynamic'
import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Clock, Users, Check, Info, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';

// --- Interfaces ---
interface ItineraryActivity {
    name: string;
    time: string;
    duration: string;
}
interface ItineraryDay {
    day: number;
    title: string;
    description: string;
    activities: ItineraryActivity[];
    meals: string[];
    accommodation: string;
}
interface PackageData {
  id: number;
  name: string;
  description: string | null;
  duration: string;
  base_price: number;
  max_people: number | null;
  created_by: number;
  is_active: number;
  itinerary: string | null; // JSON string?
  included_services: string | null; // JSON string or comma-separated?
  images: string | null;
  parsedItinerary?: {
      highlights?: string[];
      inclusions?: string[];
      exclusions?: string[];
      days?: ItineraryDay[];
  };
  // Add placeholders if needed by UI but not in DB
  bestTimeToVisit?: string;
  howToReach?: string;
}
interface GetPackageApiResponse {
  success: boolean;
  data: PackageData | null;
  message?: string;
}
// --- End Interfaces ---


// --- LoadingSpinner Component ---
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <span className="ml-2">Loading package details...</span>
  </div>
);
// --- End LoadingSpinner ---

// --- Main Component Logic ---
function ItineraryPageContent() {
  const params = useParams();
  const router = useRouter(); // Import and use router if needed
  const packageId = params.id as string;
  const [selectedDay, setSelectedDay] = useState(1);

  const apiUrl = packageId ? `/api/packages/${packageId}` : null;
  const { data: apiResponse, error, status } = useFetch<GetPackageApiResponse>(apiUrl);

  const [packageData, setPackageData] = useState<PackageData | null>(null);

  // --- Process fetched data ---
  useEffect(() => {
    if (status === 'success' && apiResponse?.data) {
      let processedData = { ...apiResponse.data };
      let parsedItinerary: PackageData['parsedItinerary'] = { days: [], highlights: [], inclusions: [], exclusions: [] };

      // Parse Itinerary JSON
      if (processedData.itinerary && typeof processedData.itinerary === 'string') {
        try {
          const parsed = JSON.parse(processedData.itinerary);
          parsedItinerary.highlights = Array.isArray(parsed.highlights) ? parsed.highlights : [];
          parsedItinerary.inclusions = Array.isArray(parsed.inclusions) ? parsed.inclusions : [];
          parsedItinerary.exclusions = Array.isArray(parsed.exclusions) ? parsed.exclusions : [];
          parsedItinerary.days = Array.isArray(parsed.days) ? parsed.days : [];
        } catch (e) { console.error(`Failed itinerary parse pkg ${processedData.id}:`, e); }
      }

      // Parse included_services
      if (processedData.included_services && typeof processedData.included_services === 'string' && !parsedItinerary.inclusions?.length) {
           try {
               const parsedServices = JSON.parse(processedData.included_services);
               if (Array.isArray(parsedServices)) parsedItinerary.inclusions = parsedServices;
           } catch (e) {
               parsedItinerary.inclusions = processedData.included_services.split(',').map(s => s.trim()).filter(s => s);
           }
       }

      processedData.parsedItinerary = parsedItinerary;
      // Add placeholder data if not present in DB/JSON
      processedData.bestTimeToVisit = processedData.bestTimeToVisit ?? "October to May";
      processedData.howToReach = processedData.howToReach ?? "Varies (Ferry/Flight)";

      setPackageData(processedData);
      setSelectedDay(1);
    } else if (status !== 'loading') {
      setPackageData(null);
    }
  }, [status, apiResponse]);
  // --- End Process fetched data ---

  // --- Loading/Error/Not Found States ---
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  // --- Error State (Corrected JSX) ---
  if (status === 'error') {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-10">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Package</h2>
            <p className="text-gray-700 mb-6">{error?.message || 'Could not fetch package details.'}</p>
            <Link href="/packages" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
             Back to Packages
            </Link>
        </div>
     );
  }

  // --- Not Found State (Corrected JSX) ---
  if (status === 'success' && !packageData) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-10">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Package Not Found</h2>
            <p className="text-gray-600 mb-6">The package you are looking for (ID: {packageId}) does not exist or is unavailable.</p>
             <Link href="/packages" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
             Back to Packages
            </Link>
        </div>
    );
  }

  // --- Guard Clause (Corrected JSX) ---
  if (!packageData) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-10">
              <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Data Error</h2>
              <p className="text-gray-600 mb-6">Could not display package details. Please try refreshing.</p>
               <Link href="/packages" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
               Back to Packages
              </Link>
          </div>
      );
  }
  // --- End Loading/Error States ---

  // Extract data for rendering safely
  const itineraryDays = packageData.parsedItinerary?.days || [];
  const highlights = packageData.parsedItinerary?.highlights || [];
  const inclusions = packageData.parsedItinerary?.inclusions || [];
  const exclusions = packageData.parsedItinerary?.exclusions || [];


  // === Success State ===
  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Header Part */}
          <div className="bg-blue-600 text-white p-4 md:p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{packageData.name}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm">
                  <div className="flex items-center"> <Clock size={16} className="mr-1" /> <span>{packageData.duration}</span> </div>
                  <div className="flex items-center"> <MapPin size={16} className="mr-1" /> <span>Andaman Islands</span> </div>
                  {packageData.max_people && ( <div className="flex items-center"> <Users size={16} className="mr-1" /> <span>Max {packageData.max_people} people</span> </div> )}
              </div>
          </div>

          <div className="p-4 md:p-6">
            <p className="text-gray-700 mb-6 text-sm md:text-base"> {packageData.description || 'Detailed description coming soon.'} </p>

            {/* Price, Highlights, Inclusions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              {/* Price Box */}
              <div className="border border-gray-200 rounded-lg p-4 order-1 md:order-1">
                  <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-blue-600">Price</h3>
                  <p className="text-xl md:text-2xl font-bold">₹{packageData.base_price.toLocaleString('en-IN')}</p>
                  <p className="text-xs md:text-sm text-gray-500">per person (starting)</p>
                  <Link href={`/packages/${packageData.id}/book`} className="mt-3 md:mt-4 block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md transition duration-300 text-sm md:text-base"> Book Now </Link>
              </div>
              {/* Highlights */}
              <div className="border border-gray-200 rounded-lg p-4 order-2 md:order-2">
                   <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-blue-600">Highlights</h3>
                   {highlights.length > 0 ? ( <ul className="space-y-1.5 md:space-y-2"> {highlights.slice(0, 4).map((highlight, index) => ( <li key={`hl-${index}`} className="flex items-start"> <Check size={14} className="mr-2 text-green-500 flex-shrink-0 mt-0.5 md:mt-1" /> <span className="text-xs md:text-sm">{highlight}</span> </li> ))} {highlights.length > 4 && ( <li className="text-xs md:text-sm text-blue-600 mt-1">+ {highlights.length - 4} more highlights</li> )} </ul> ) : ( <p className="text-xs md:text-sm text-gray-500 italic">Highlights not specified.</p> )}
              </div>
              {/* Inclusions */}
              <div className="border border-gray-200 rounded-lg p-4 order-3 md:order-3">
                   <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-blue-600">Inclusions</h3>
                    {inclusions.length > 0 ? ( <ul className="space-y-1.5 md:space-y-2"> {inclusions.slice(0, 4).map((inclusion, index) => ( <li key={`inc-${index}`} className="flex items-start"> <Check size={14} className="mr-2 text-green-500 flex-shrink-0 mt-0.5 md:mt-1" /> <span className="text-xs md:text-sm">{inclusion}</span> </li> ))} {inclusions.length > 4 && ( <li className="text-xs md:text-sm text-blue-600 mt-1">+ {inclusions.length - 4} more inclusions</li> )} </ul> ) : ( <p className="text-xs md:text-sm text-gray-500 italic">Inclusions not specified.</p> )}
              </div>
            </div>

            {/* Itinerary Section */}
            {itineraryDays.length > 0 ? (
                <>
                    <div className="mb-6 md:mb-8">
                      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Itinerary</h2>
                      <div className="flex overflow-x-auto pb-2 space-x-2 border-b border-gray-200 mb-4">
                          {itineraryDays.map((day) => ( <button key={day.day} onClick={() => setSelectedDay(day.day)} className={`px-3 py-2 rounded-t-md whitespace-nowrap text-sm transition-colors ${ selectedDay === day.day ? 'bg-blue-600 text-white font-medium' : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800' }`}> Day {day.day} <span className="hidden sm:inline">: {day.title}</span> </button> ))}
                      </div>
                    </div>
                    {/* Selected Day Details */}
                    {itineraryDays.map((day) => (
                      <div key={day.day} className={`${selectedDay === day.day ? 'block animate-fadeIn' : 'hidden'}`}>
                          <div className="border-l-4 border-blue-600 pl-3 md:pl-4 mb-5 md:mb-6"> <h3 className="text-lg md:text-xl font-semibold">Day {day.day}: {day.title}</h3> <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">{day.description}</p> </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-6">
                              {/* Activities */}
                              <div> <h4 className="font-semibold text-gray-700 mb-2 text-base">Activities</h4> {day.activities && day.activities.length > 0 ? ( <div className="space-y-3"> {day.activities.map((activity, index) => ( <div key={`act-${index}`} className="flex items-start"> <div className="w-16 sm:w-20 flex-shrink-0 text-xs sm:text-sm text-gray-500 pt-0.5">{activity.time || ''}</div> <div className="flex-1"> <div className="text-sm font-medium">{activity.name}</div> <div className="text-xs text-gray-500">{activity.duration || ''}</div> </div> </div> ))} </div> ) : ( <p className="text-sm text-gray-500 italic">No specific activities listed.</p> )} </div>
                              {/* Meals */}
                              <div> <h4 className="font-semibold text-gray-700 mb-2 text-base">Meals</h4> {day.meals && day.meals.length > 0 ? ( <div className="space-y-1"> {day.meals.map((meal, index) => ( <div key={`meal-${index}`} className="flex items-center"> <Check size={14} className="mr-1.5 text-green-500" /> <span className="text-sm">{meal}</span> </div> ))} </div> ) : ( <p className="text-sm text-gray-500 italic">Meals not specified.</p> )} </div>
                              {/* Accommodation */}
                              <div> <h4 className="font-semibold text-gray-700 mb-2 text-base">Accommodation</h4> {day.accommodation && day.accommodation !== 'N/A' ? ( <div className="text-sm"> <div className="flex items-start"> <MapPin size={14} className="mr-1.5 text-gray-500 flex-shrink-0 mt-0.5" /> <span>{day.accommodation}</span> </div> </div> ) : ( <p className="text-sm text-gray-500 italic">No accommodation/departure day.</p> )} </div>
                          </div>
                          {/* Next Day Button */}
                          {day.day < itineraryDays.length && ( <div className="flex justify-end mt-4"> <button onClick={() => setSelectedDay(day.day + 1)} className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"> Next Day <ArrowRight size={16} className="ml-1" /> </button> </div> )}
                      </div>
                    ))}
                </>
            ) : (
                 <div className="text-center py-8 text-gray-500 italic"> Detailed day-wise itinerary is not available for this package. </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
           <div className="p-4 md:p-6">
             <h2 className="text-xl md:text-2xl font-bold mb-4">Important Information</h2>
             {/* Exclusions */}
             {exclusions.length > 0 && ( <div className="mb-5 md:mb-6"> <h3 className="text-base md:text-lg font-semibold mb-2">Exclusions</h3> <ul className="space-y-1.5 md:space-y-2"> {exclusions.map((exclusion, index) => ( <li key={`excl-${index}`} className="flex items-start"> <Info size={14} className="mr-2 text-red-500 flex-shrink-0 mt-0.5 md:mt-1" /> <span className="text-sm md:text-base">{exclusion}</span> </li> ))} </ul> </div> )}
             {/* Placeholder Cancellation Policy & Notes */}
              <div className="mb-5 md:mb-6"> <h3 className="text-base md:text-lg font-semibold mb-2">Cancellation Policy</h3> <ul className="list-disc list-inside space-y-1 text-sm md:text-base text-gray-700"> <li>Policies vary. Check details during booking.</li> </ul> </div>
              <div> <h3 className="text-base md:text-lg font-semibold mb-2">Additional Notes</h3> <ul className="list-disc list-inside space-y-1 text-sm md:text-base text-gray-700"> <li>Itinerary subject to change due to weather/local conditions.</li> </ul> </div>
           </div>
        </div>

        {/* Booking CTA */}
        <div className="bg-blue-50 rounded-lg p-6 md:p-8 text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Ready to Explore Andaman?</h2>
            <p className="text-gray-600 mb-5 md:mb-6 max-w-2xl mx-auto text-sm md:text-base"> Book this package now to secure your spot. </p>
            <Link href={`/packages/${packageData.id}/book`} className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 md:py-3 md:px-8 rounded-md transition duration-300 text-sm md:text-base"> Book Now </Link>
        </div>
      </div>
    </div>
  );
}

// Wrap with Suspense
export default function PackageDetailPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ItineraryPageContent />
        </Suspense>
    );
}