// Path: .\src\app\destinations\page.tsx
'use client';
export const dynamic = 'force-dynamic'
import React, { useState, useEffect, Suspense } from 'react'; // Import Suspense
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, AlertTriangle } from 'lucide-react'; // Import icons
import { useFetch } from '@/hooks/useFetch'; // Import useFetch

// --- Define Interfaces (consistent with API response) ---
interface Destination {
  id: number; // Island ID
  name: string;
  description: string | null;
  permit_required: number;
  permit_details: string | null;
  coordinates: string | null;
  attractions: string | null;
  activities: string | null;
  images: string | null; // Comma-separated URLs or single URL
  // Add derived/formatted fields if needed
  image_url?: string; // Derived from images
  location?: string; // Can add a default or fetch if needed
}

// Define the overall API response structure for GET /api/destinations
interface GetDestinationsApiResponse {
  success: boolean;
  data: Destination[]; // Expect an array of islands/destinations
  message?: string;
}
// --- End Interfaces ---


// --- LoadingSpinner Component ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <span className="ml-2 text-lg">Loading destinations...</span>
  </div>
);
// --- End LoadingSpinner ---


// --- DestinationCard Component ---
interface DestinationCardProps {
    destination: Destination;
}
const DestinationCard = ({ destination }: DestinationCardProps) => {
    const imageUrl = destination.images?.split(',')[0]?.trim() || '/images/placeholder.jpg';
    const locationDisplay = "Andaman Islands"; // Default location

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105">
            <div className="h-48 sm:h-56 w-full relative flex-shrink-0">
                <Image
                    src={imageUrl}
                    alt={destination.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onError={(e)=>(e.currentTarget.src='/images/placeholder.jpg')} // Fallback
                />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg md:text-xl font-semibold mb-1">{destination.name}</h2>
                <p className="text-xs text-gray-500 mb-2">{locationDisplay}</p>
                <p className="text-sm text-gray-700 mb-3 line-clamp-3 flex-grow">
                    {destination.description || 'Explore this beautiful destination.'}
                </p>
                <div className="mt-auto pt-3 border-t border-gray-100 text-right">
                    <Link
                        href={`/destinations/${destination.id}`} // Link uses the ID from the DB
                        className="inline-block bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                        Explore More
                    </Link>
                </div>
            </div>
        </div>
    );
};
// --- End DestinationCard Component ---


// --- Main Component Logic ---
function DestinationsContent() {
  // Fetch data using the hook
  const { data: apiResponse, error, status } = useFetch<GetDestinationsApiResponse>('/api/destinations');

  // Extract destinations, default to empty array
  const destinations = apiResponse?.data || [];

  return (
    <>
      {/* --- Hero Section (remains the same) --- */}
      <div className="relative bg-blue-900 h-64 md:h-80">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-700/70 z-10"></div>
        <div className="absolute inset-0 z-0">
          <Image src="/images/destinations-hero.jpg" alt="Panoramic view of Andaman Islands - Desktop" fill className="object-cover hidden md:block" priority />
          <Image src="/images/destinations-hero-mobile.jpg" alt="Beautiful Andaman beach - Mobile" fill className="object-cover block md:hidden" priority />
        </div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-2 md:mb-4"> Explore Andaman Destinations </h1>
          <p className="text-lg sm:text-xl text-white text-center max-w-2xl opacity-90"> Discover paradise islands with pristine beaches, vibrant coral reefs, and lush forests </p>
        </div>
      </div>

      {/* --- Destinations List --- */}
      <div className="container mx-auto px-4 py-10 md:py-16">
        {status === 'loading' ? (
          <LoadingSpinner />
        ) : status === 'error' ? (
            <div className="text-center py-10 px-4 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3"/>
                <p className="text-red-700 font-medium">Could not load destinations.</p>
                <p className="text-red-600 text-sm mt-1">{error?.message || "An unknown error occurred."}</p>
                {/* Optional: Add a retry button */}
            </div>
        ) : (
           destinations.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                 {destinations.map((destination) => (
                    <DestinationCard key={destination.id} destination={destination} />
                 ))}
               </div>
            ) : (
               <div className="text-center py-16 bg-white rounded-lg shadow">
                  <h2 className="text-xl md:text-2xl font-semibold mb-4">No Destinations Found</h2>
                  <p className="text-gray-600">Check back later or explore our packages!</p>
               </div>
            )
        )}
      </div>
    </>
  );
}

// Wrap the main content component with Suspense
export default function DestinationsPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <DestinationsContent />
        </Suspense>
    );
}