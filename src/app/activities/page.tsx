// Path: .\src\app\activities\page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react'; // Import React & Suspense
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, AlertTriangle } from 'lucide-react'; // Import icons
import { useFetch } from '@/hooks/useFetch'; // Import useFetch

// --- Define interfaces (consistent with API response) ---
interface Activity {
  id: number; // service id
  name: string; // service name
  description: string | null;
  type: string; // Should be 'activity' or similar
  provider_id: number;
  island_id: number;
  price: string; // Keep as string from DB, parse for display if needed
  availability: string | null;
  images: string | null; // Comma-separated or single URL
  amenities: string | null;
  cancellation_policy: string | null;
  island_name: string; // Joined from islands table
  // Add derived/formatted fields if needed
  image_url?: string;
  duration?: string; // Placeholder - needs to be added to API/DB if needed
  rating?: number;   // Placeholder - needs to be added via reviews/API
}

// Define the overall API response structure for GET /api/activities
interface GetActivitiesApiResponse {
  success: boolean;
  data: Activity[]; // Expect an array of activities
  message?: string;
}
// --- End Interfaces ---

// --- LoadingSpinner Component ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
    <span className="ml-2 text-lg">Loading activities...</span>
  </div>
);
// --- End LoadingSpinner ---

// --- ActivityCard Component ---
interface ActivityCardProps {
    activity: Activity;
}
const ActivityCard = ({ activity }: ActivityCardProps) => {
    // --- Process data for display ---
    const imageUrl = activity.images?.split(',')[0]?.trim() || '/images/placeholder.jpg';
    // Placeholder for duration (needs to be added to schema/API)
    const durationDisplay = activity.duration || 'Approx. 2-3 hours';
    // Parse price string to number for formatting
    const priceNum = parseFloat(activity.price);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105">
          {/* Image */}
          <div className="h-48 w-full relative flex-shrink-0">
            <Image
              src={imageUrl}
              alt={activity.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={(e)=>(e.currentTarget.src='/images/placeholder.jpg')} // Fallback
            />
          </div>
          {/* Content */}
          <div className="p-4 flex flex-col flex-grow">
            <h2 className="text-lg md:text-xl font-semibold mb-1 leading-tight">{activity.name}</h2>
            <p className="text-xs text-gray-500 mb-2">Location: {activity.island_name}</p>
            <p className="text-sm text-gray-700 mb-3 line-clamp-3 flex-grow">
                {activity.description || 'No description available.'}
            </p>
            <div className="flex justify-between items-center text-sm mb-3 mt-auto pt-3 border-t border-gray-100">
              <span className="text-green-700 font-semibold">
                  {!isNaN(priceNum) ? `₹${priceNum.toLocaleString('en-IN')}` : activity.price} {/* Format if number */}
              </span>
              <span className="text-gray-600">{durationDisplay}</span> {/* Use placeholder duration */}
            </div>
            <Link
              href={`/activities/${activity.id}`} // Link to activity detail page (needs creation)
              className="block w-full text-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              Learn More & Book
            </Link>
          </div>
        </div>
    );
};
// --- End ActivityCard Component ---


// --- Main Component Logic ---
function ActivitiesContent() {
  // Fetch data using the hook
  const { data: apiResponse, error, status } = useFetch<GetActivitiesApiResponse>('/api/activities');

  // Extract activities from the response, default to empty array
  const activities = apiResponse?.data || [];

  return (
    <>
      {/* --- Hero Section (remains the same) --- */}
      <div className="relative bg-green-900 h-64 md:h-80">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-green-700/70 z-10"></div>
        <div className="absolute inset-0 z-0">
          <Image src="/images/activities-hero.jpg" alt="Andaman Activities - Desktop" fill className="object-cover hidden md:block" priority />
          <Image src="/images/activities-hero-mobile.jpg" alt="Andaman Activities - Mobile" fill className="object-cover block md:hidden" priority />
        </div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-3 md:mb-4"> Exciting Andaman Activities </h1>
          <p className="text-lg sm:text-xl text-white text-center max-w-2xl opacity-90"> Experience thrilling adventures and create unforgettable memories </p>
        </div>
      </div>

      {/* --- Activities List --- */}
      <div className="container mx-auto px-4 py-10 md:py-16">
        {status === 'loading' ? (
          <LoadingSpinner />
        ) : status === 'error' ? (
          <div className="text-center py-10 px-4 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3"/>
            <p className="text-red-700 font-medium">Could not load activities.</p>
            <p className="text-red-600 text-sm mt-1">{error?.message || "An unknown error occurred."}</p>
            {/* Optional: Add a retry button */}
          </div>
        ) : (
          activities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {activities.map((activity) => (
                 <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
           ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <h2 className="text-xl md:text-2xl font-semibold mb-4">No Activities Found</h2>
              <p className="text-gray-600">Check back later or explore our travel packages!</p>
            </div>
           )
        )}
      </div>
    </>
  );
}

// Wrap the main content component with Suspense
export default function ActivitiesPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ActivitiesContent />
        </Suspense>
    );
}