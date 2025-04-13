// Path: .\src\app\search-results\page.tsx
'use client';
export const dynamic = 'force-dynamic'
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, AlertTriangle, Search as SearchIcon } from 'lucide-react'; // Added SearchIcon
import { useFetch } from '@/hooks/useFetch';

// --- Interfaces (Keep as they are) ---
interface SearchResult {
  id: string | number; name: string; description: string | null; image_url?: string; // Make optional
  price?: number; location?: string; duration?: string; category?: string; island_name?: string; // Added island_name if API provides
}
interface ApiSearchData {
  destinations: SearchResult[]; packages: SearchResult[]; activities: SearchResult[]; vendors?: SearchResult[];
}
interface ApiSearchResponse {
  success: boolean; data?: ApiSearchData; message?: string;
}
function isApiSearchSuccessResponse(response: any): response is ApiSearchResponse & { success: true; data: ApiSearchData } {
    // Type guard remains useful for complex validation if needed, though useFetch helps
    return response && response.success === true && typeof response.data === 'object' && response.data !== null && Array.isArray(response.data.destinations) && Array.isArray(response.data.packages) && Array.isArray(response.data.activities);
}
// --- End Interfaces ---

// --- Loading Spinner Component (Keep as is) ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <span className="ml-2 text-lg">Loading search results...</span>
  </div>
);

// --- SearchResultsDisplay Component (Keep as is, but make image_url optional) ---
interface SearchResultsDisplayProps {
    results: ApiSearchData;
}
const SearchResultsDisplay = ({ results }: SearchResultsDisplayProps) => {
    const hasAnyResults = results.destinations.length > 0 || results.packages.length > 0 || results.activities.length > 0;

    if (!hasAnyResults) {
        return null; // Let the parent handle the "No results" message
    }

    // Helper to get image URL
    const getImageUrl = (item: SearchResult): string => {
        // Prioritize image_url if present, fallback for different structures if needed
        return item.image_url || '/images/placeholder.jpg';
    };

    return (
        <div className="space-y-12">
          {/* Destinations Section */}
          {results.destinations.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Destinations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {results.destinations.map((item) => (
                   <div key={`dest-${item.id}`} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                     <div className="h-48 relative"> <Image src={getImageUrl(item)} alt={item.name} fill className="object-cover" onError={(e)=>(e.currentTarget.src='/images/placeholder.jpg')} /> </div>
                     <div className="p-6 flex flex-col flex-grow"> <h3 className="text-xl font-semibold mb-2">{item.name}</h3> <p className="text-gray-600 mb-2 text-sm">{item.location || 'Andaman Islands'}</p> <p className="text-gray-700 mb-4 line-clamp-3 flex-grow">{item.description || 'Discover this location.'}</p> <Link href={`/destinations/${item.id}`} className="inline-block self-start mt-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"> Explore </Link> </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
          {/* Packages Section */}
          {results.packages.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Travel Packages</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {results.packages.map((item) => (
                   <div key={`pkg-${item.id}`} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                     <div className="h-48 relative"> <Image src={getImageUrl(item)} alt={item.name} fill className="object-cover" onError={(e)=>(e.currentTarget.src='/images/placeholder.jpg')} /> </div>
                     <div className="p-6 flex flex-col flex-grow"> <h3 className="text-xl font-semibold mb-2">{item.name}</h3> <p className="text-gray-600 mb-2 text-sm">{item.duration}</p> <p className="text-gray-700 mb-3 line-clamp-3 flex-grow">{item.description || 'Check out this package.'}</p> <p className="text-lg font-bold text-blue-600 mb-4">₹{item.price?.toLocaleString('en-IN')}</p> <Link href={`/packages/${item.id}`} className="inline-block self-start mt-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"> View Details </Link> </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
          {/* Activities Section */}
          {results.activities.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Activities</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {results.activities.map((item) => (
                   <div key={`act-${item.id}`} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                     <div className="h-48 relative"> <Image src={getImageUrl(item)} alt={item.name} fill className="object-cover" onError={(e)=>(e.currentTarget.src='/images/placeholder.jpg')} /> </div>
                     <div className="p-6 flex flex-col flex-grow"> <h3 className="text-xl font-semibold mb-2">{item.name}</h3> <p className="text-gray-600 mb-2 text-sm">{item.duration || 'Approx 2-3 hours'}</p> <p className="text-gray-600 mb-2 text-sm">Location: {item.island_name || item.location || 'Andaman'}</p> <p className="text-gray-700 mb-3 line-clamp-3 flex-grow">{item.description || 'Enjoy this activity.'}</p> <p className="text-lg font-bold text-blue-600 mb-4">₹{item.price?.toLocaleString('en-IN')}</p> <Link href={`/activities/${item.id}`} className="inline-block self-start mt-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"> Book Now </Link> </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
    );
}

// --- Main SearchResults Component ---
function SearchResults() {
  const searchParams = useSearchParams();
  // Extract search parameters
  const query = searchParams.get('q') || '';
  const destination = searchParams.get('destination') || '';
  const startDate = searchParams.get('startDate') || ''; // Get dates if used in search
  const endDate = searchParams.get('endDate') || '';
  const travelers = searchParams.get('travelers') || '';

  // Construct API URL
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (destination) params.set('destination', destination);
  if (startDate) params.set('startDate', startDate); // Pass date/traveler info if API uses them
  if (endDate) params.set('endDate', endDate);
  if (travelers) params.set('travelers', travelers);
  const apiUrl = `/api/search?${params.toString()}`;

  // Fetch data
  const { data: apiResponse, error, status } = useFetch<ApiSearchResponse>(apiUrl); // Use ApiSearchResponse

  // Extract results safely
  const results: ApiSearchData = apiResponse?.data || { destinations: [], packages: [], activities: [] };
  const hasResults = results.destinations.length > 0 ||
                    results.packages.length > 0 ||
                    results.activities.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 min-h-[60vh]"> {/* Added min height */}
      {/* Search Summary */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
         <h1 className="text-2xl font-bold mb-3">Search Results</h1>
         {!(query || destination || startDate || travelers) ? (
             <p className="text-gray-600 text-sm">Showing all results. Use the search bar on the homepage to refine.</p>
         ) : (
             <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-gray-600">Filters:</span>
                {query && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1"><SearchIcon size={14}/> "{query}"</span>}
                {destination && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">Destination: {destination}</span>}
                {startDate && <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">Dates: {startDate}{endDate ? ` to ${endDate}`: ''}</span>}
                {travelers && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">Travelers: {travelers}</span>}
            </div>
         )}
      </div>

      {/* Loading State */}
      {status === 'loading' && <LoadingSpinner />}

      {/* Error State - Show message, don't show sample data */}
      {status === 'error' && (
          <div className="text-center py-10 px-4 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3"/>
              <p className="text-red-700 font-medium">Search Failed</p>
              <p className="text-red-600 text-sm mt-1">{error?.message || "An unknown error occurred."}</p>
              <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">Go back home</Link>
          </div>
      )}

      {/* No Results State */}
      {status === 'success' && !hasResults && (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">No results found</h2>
          <p className="text-gray-600 mb-6">We couldn't find anything matching your search. Try different keywords or filters.</p>
          <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"> Back to Home </Link>
        </div>
      )}

      {/* Success State with Results */}
      {status === 'success' && hasResults && (
         <SearchResultsDisplay results={results} />
      )}
    </div>
  );
}

// --- Main Export ---
export default function SearchResultsPageWrapper() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchResults />
    </Suspense>
  );
}