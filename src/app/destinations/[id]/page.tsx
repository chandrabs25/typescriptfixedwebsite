// Path: .\src\app\destinations\[id]\page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, AlertTriangle, MapPin, Check, Info } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';

// --- Define Interfaces ---
interface DestinationData {
  id: number;
  name: string;
  description: string | null;
  permit_required: number;
  permit_details: string | null;
  coordinates: string | null;
  attractions: string | null;
  activities: string | null;
  images: string | null;
  bestTimeToVisit?: string;
  howToReach?: string;
}
interface GetDestinationApiResponse {
  success: boolean;
  data: DestinationData | null;
  message?: string;
}
// --- End Interfaces ---

// --- LoadingSpinner Component (FIXED) ---
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <span className="ml-2">Loading destination...</span>
  </div>
);
// --- End LoadingSpinner ---

// --- Main Component Logic ---
function DestinationDetailContent() {
  const params = useParams();
  const destinationId = params.id as string;
  const apiUrl = destinationId ? `/api/destinations/${destinationId}` : null;

  const { data: apiResponse, error, status } = useFetch<GetDestinationApiResponse>(apiUrl);
  const destination = apiResponse?.data;

  // Data Processing Logic
  const imageUrl = destination?.images?.split(',')[0]?.trim() || '/images/placeholder.jpg';
  let attractionsList: string[] = [];
  if (destination?.attractions) {
      try { attractionsList = JSON.parse(destination.attractions); }
      catch { attractionsList = destination.attractions.split(',').map(s => s.trim()).filter(s => s); }
  }
  let activitiesList: string[] = [];
  if (destination?.activities) {
      try { activitiesList = JSON.parse(destination.activities); }
      catch { activitiesList = destination.activities.split(',').map(s => s.trim()).filter(s => s); }
  }
  const bestTimeToVisitDisplay = destination?.bestTimeToVisit || "October to May";
  const howToReachDisplay = destination?.howToReach || "Varies (Ferry/Flight)";

  // === Loading State ===
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  // === Error State ===
  if (status === 'error') {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-10">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Destination</h2>
            <p className="text-gray-700 mb-6">{error?.message || 'Could not fetch destination details.'}</p>
            <Link href="/destinations" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
             Back to Destinations
            </Link>
        </div>
     );
  }

  // === Not Found State ===
  if (status === 'success' && !destination) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-10">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Destination Not Found</h2>
            <p className="text-gray-600 mb-6">The destination you are looking for (ID: {destinationId}) does not exist or is unavailable.</p>
             <Link href="/destinations" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
             Back to Destinations
            </Link>
        </div>
    );
  }

  // === Guard Clause ===
  if (!destination) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-10">
            <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Data Error</h2>
            <p className="text-gray-600 mb-6">Could not display booking details. Please try refreshing.</p>
             <Link href="/destinations" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
             Back to Destinations
            </Link>
        </div>
    );
  }

  // === Success State Render ===
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Image */}
      <div className="relative h-[50vh] w-full">
         <Image src={imageUrl} alt={destination.name} fill style={{ objectFit: 'cover' }} priority onError={(e)=>(e.currentTarget.src='/images/placeholder.jpg')} />
         <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center"> <h1 className="text-4xl md:text-6xl font-bold text-white text-center px-4">{destination.name}</h1> </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">About {destination.name}</h2>
          <p className="text-gray-700 mb-6 whitespace-pre-line"> {destination.description || 'No detailed description available.'} </p>

          {/* Highlights & Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             {/* Highlights */}
             {(attractionsList.length > 0) && (
                 <div>
                     <h3 className="text-xl font-semibold mb-2">Highlights / Attractions</h3>
                     <ul className="list-disc pl-5 space-y-1">
                       {attractionsList.map((item, index) => ( <li key={`att-${index}`} className="text-gray-700">{item}</li> ))}
                     </ul>
                 </div>
             )}
             {/* Activities */}
             {(activitiesList.length > 0) && (
                  <div>
                     <h3 className="text-xl font-semibold mb-2">Popular Activities</h3>
                     <ul className="list-disc pl-5 space-y-1">
                       {activitiesList.map((item, index) => ( <li key={`act-${index}`} className="text-gray-700">{item}</li> ))}
                     </ul>
                  </div>
             )}
          </div>

          {/* Permit Information */}
           {destination.permit_required === 1 && (
               <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                 <h3 className="text-lg font-semibold text-yellow-800 mb-1"> <Info size={18} className="inline mr-1 mb-0.5" /> Permit Required</h3>
                 <p className="text-yellow-700 text-sm"> {destination.permit_details || 'A permit is required to visit this area. Please arrange in advance.'} </p>
               </div>
           )}

          {/* Best Time & How to Reach */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div> <h3 className="text-xl font-semibold mb-2">Best Time to Visit</h3> <p className="text-gray-700">{bestTimeToVisitDisplay}</p> </div>
             <div> <h3 className="text-xl font-semibold mb-2">How to Reach</h3> <p className="text-gray-700">{howToReachDisplay}</p> </div>
          </div>
        </div>

        {/* Related Packages CTA */}
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Packages Including {destination.name}</h2>
            <p className="text-gray-700 mb-4">Explore our curated packages that feature visits to {destination.name}.</p>
            <div className="mt-4"> <Link href={`/packages?destination=${destinationId}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"> View Related Packages </Link> </div>
        </div>
      </div>
    </div>
  );
}

// Wrap the main content component with Suspense
export default function DestinationDetailPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <DestinationDetailContent />
        </Suspense>
    );
}