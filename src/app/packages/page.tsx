// Path: .\src\app\packages\page.tsx
'use client';
export const dynamic = 'force-dynamic'
import React, { useState, useEffect, Suspense } from 'react'; // Import Suspense
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Star, ArrowRight, Filter, X, Loader2, AlertTriangle } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch'; // Import the useFetch hook

// --- Define interfaces (consistent with API response) ---
interface Package {
  id: number;
  name: string;
  description: string | null;
  duration: string;
  base_price: number; // API uses base_price
  max_people: number | null;
  created_by: number;
  is_active: number;
  itinerary: string | null;
  included_services: string | null;
  images: string | null; // Assuming images is a comma-separated string or URL
  // --- Add derived/formatted fields needed by the UI ---
  image_url?: string; // Use the first image from 'images'
  destinations?: string[]; // Derive from itinerary/description if needed, or add to API
  rating?: number; // Needs to come from reviews/API if required
  activities?: string[]; // Needs to come from services/API if required
}

interface PaginationInfo {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

interface GetPackagesApiResponse {
    packages: Package[];
    pagination: PaginationInfo;
}

interface FiltersState {
  destination: string; // Note: API doesn't support destination filter directly yet
  duration: string;
  priceRange: string;
  activities: string[]; // Note: API doesn't support activity filter directly yet
}
// --- End Interfaces ---

// --- LoadingSpinner Component Definition ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <span className="ml-2 text-lg">Loading packages...</span>
  </div>
);
// --- End LoadingSpinner Definition ---

// --- Extracted Package Card Component ---
interface PackageCardProps {
    pkg: Package;
}
const PackageCard = ({ pkg }: PackageCardProps) => {
    // --- Process data for display ---
    // Basic image handling (assuming comma-separated URLs or single URL)
    const imageUrl = pkg.images?.split(',')[0]?.trim() || '/images/placeholder.jpg';
    // Placeholder for destinations and activities - these need proper data from API
    const destinationsDisplay = ['Port Blair', 'Havelock']; // Placeholder
    const activitiesDisplay = ['Sightseeing', 'Beach']; // Placeholder
    const ratingDisplay = 4.5 + Math.random() * 0.4; // Mock rating for now

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform duration-300 hover:shadow-lg hover:scale-[1.02]">
            <div className="h-48 w-full relative flex-shrink-0">
                <Image
                   src={imageUrl}
                   alt={pkg.name}
                   fill
                   className="object-cover"
                   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                   onError={(e)=>(e.currentTarget.src='/images/placeholder.jpg')} // Fallback image on error
                />
               <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs sm:text-sm font-semibold text-blue-700">
                 ₹{pkg.base_price.toLocaleString('en-IN')} {/* Use base_price */}
               </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
               <div className="flex justify-between items-start mb-1">
                 <h3 className="text-base sm:text-lg font-semibold leading-tight flex-1 mr-2">{pkg.name}</h3>
                 <div className="flex items-center text-yellow-500 flex-shrink-0 ml-2">
                     <Star size={14} fill="currentColor" />
                     {/* Use mock rating for now */}
                     <span className="ml-1 text-xs font-medium">{ratingDisplay.toFixed(1)}</span>
                 </div>
               </div>
               <div className="flex items-center text-gray-500 text-xs mb-2">
                   <Clock size={12} className="mr-1" /> <span>{pkg.duration}</span>
               </div>
               <div className="flex items-start mb-3 text-xs text-gray-500">
                   <MapPin size={14} className="mr-1 mt-0.5 flex-shrink-0" />
                   {/* Use placeholder destinations */}
                   <span>{destinationsDisplay.join(' • ')}</span>
               </div>
               <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
                   {pkg.description || 'No description available.'}
               </p>
               <div className="flex flex-wrap gap-1.5 mb-3">
                 {/* Use placeholder activities */}
                 {activitiesDisplay.slice(0, 3).map((activity, index) => (
                    <span key={index} className="bg-blue-50 text-blue-700 text-[11px] px-1.5 py-0.5 rounded-full"> {activity} </span>
                 ))}
                 {activitiesDisplay.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 text-[11px] px-1.5 py-0.5 rounded-full"> +{activitiesDisplay.length - 3} more </span>
                 )}
               </div>
               <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                  <span className="text-gray-600 text-xs"> Starting from <span className="font-semibold text-blue-600 text-sm">₹{pkg.base_price.toLocaleString('en-IN')}</span> </span>
                  <Link href={`/packages/${pkg.id}`} className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm">
                      View Details <ArrowRight size={14} className="ml-1" />
                  </Link>
               </div>
            </div>
       </div>
    );
};
// --- End Package Card Component ---

// --- Main Component Logic ---
function PackagesContent() {
  const searchParams = useSearchParams(); // Get search params
  const [filters, setFilters] = useState<FiltersState>({
    destination: searchParams.get('destination') || '', // Initialize from URL
    duration: searchParams.get('duration') || '',
    priceRange: searchParams.get('priceRange') || '',
    activities: searchParams.get('activities')?.split(',') || [] // Initialize from URL
  });

  const [allPackages, setAllPackages] = useState<Package[]>([]); // Store all fetched packages
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch packages data
  // Adjust the expected type for useFetch based on your API structure
  const { data: apiResponse, error, status: fetchStatus } =
    useFetch<GetPackagesApiResponse>('/api/packages'); // Fetch from the API

  // Update allPackages when data is fetched successfully
  useEffect(() => {
    if (fetchStatus === 'success' && apiResponse?.packages) {
      setAllPackages(apiResponse.packages);
    } else if (fetchStatus === 'error') {
      setAllPackages([]); // Clear packages on error
    }
    // Don't reset filteredPackages here, let the filter effect handle it
  }, [fetchStatus, apiResponse]);

  // --- Handlers (similar to before, operate on 'allPackages') ---
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleActivityToggle = (activity: string) => {
        setFilters((prev) => {
            const current = [...prev.activities];
            if (current.includes(activity)) {
                return { ...prev, activities: current.filter(a => a !== activity) };
            } else {
                return { ...prev, activities: [...current, activity] };
            }
        });
    };

    // Apply filters whenever 'filters' or 'allPackages' change
    useEffect(() => {
        let tempFiltered = [...allPackages];

        // --- Apply Filters (adjust as API filtering capabilities improve) ---
        // Note: Destination and Activity filters are frontend-only for now
        if (filters.destination) {
          // Simple frontend filter (replace with API param later)
          tempFiltered = tempFiltered.filter(pkg =>
              (pkg.name + (pkg.description || '')).toLowerCase().includes(filters.destination.toLowerCase())
          );
        }
        if (filters.duration) {
          // Use API 'duration' format (e.g., "5 Days / 4 Nights") or adapt API
          const durationDays = parseInt(filters.duration);
          if (!isNaN(durationDays)) {
             tempFiltered = tempFiltered.filter(pkg => {
                 const pkgDaysMatch = pkg.duration.match(/^(\d+)\s*Days/i);
                 const pkgDays = pkgDaysMatch ? parseInt(pkgDaysMatch[1]) : 0;
                 return filters.duration.includes('+') ? pkgDays >= durationDays : pkgDays === durationDays;
             });
          }
        }
        if (filters.priceRange) {
            const range = filters.priceRange.split('-').map(Number);
            const min = range[0];
            const max = range.length > 1 ? range[1] : Infinity;
            if (!isNaN(min)) {
                tempFiltered = tempFiltered.filter(pkg => pkg.base_price >= min && pkg.base_price <= max);
            } else { // Handle cases like "30000" (meaning 30000+)
                 const singleVal = Number(filters.priceRange);
                 if (!isNaN(singleVal)) {
                      tempFiltered = tempFiltered.filter(pkg => pkg.base_price >= singleVal);
                 }
            }
        }
        if (filters.activities.length > 0) {
            // Simple frontend filter (replace with API param later)
            tempFiltered = tempFiltered.filter(pkg =>
                filters.activities.every(filterActivity =>
                     (pkg.name + (pkg.description || '')).toLowerCase().includes(filterActivity.toLowerCase())
                    // Ideally, check against pkg.activities array when available from API
                )
            );
        }
        // --- End Apply Filters ---

        setFilteredPackages(tempFiltered);
    }, [filters, allPackages]);
  // --- End Handlers/Effects ---

  return (
    <>
      {/* --- Hero Section (remains the same) --- */}
      <div className="relative bg-gradient-to-r from-cyan-600 to-blue-700 h-64 md:h-80">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0 z-0">
          <Image src="/images/packages-hero.jpg" alt="Andaman tour packages - Desktop" fill className="object-cover hidden md:block" priority />
          <Image src="/images/packages-hero-mobile.jpg" alt="Andaman tour packages - Mobile" fill className="object-cover block md:hidden" priority />
        </div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-2 md:mb-4"> Our Andaman Packages </h1>
          <p className="text-lg sm:text-xl text-white text-center max-w-2xl opacity-90"> Find the perfect curated experience for your island getaway. </p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-8 md:py-12">
          <div className="container mx-auto px-4">
              {/* --- Mobile Filter Toggle (remains the same) --- */}
              <div className="md:hidden mb-4 text-center">
                  <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <Filter size={16} className="mr-2" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
              </div>

              {/* --- Filters Section (remains the same structure) --- */}
              <div className={`bg-white rounded-lg shadow-md p-4 md:p-6 mb-8 ${showFilters ? 'block' : 'hidden'} md:block`}>
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg md:text-xl font-semibold">Filter Packages</h2>
                      <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setShowFilters(false)}> <X size={20} /> </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Destination Filter */}
                      <div>
                          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1"> Destination </label>
                          <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white overflow-hidden">
                             <MapPin className="ml-3 text-gray-400 flex-shrink-0 pointer-events-none" size={16} />
                             {/* TODO: Populate options dynamically or improve API filtering */}
                             <select id="destination" name="destination" value={filters.destination} onChange={handleFilterChange} className="pl-2 pr-8 py-2 w-full text-sm border-none focus:ring-0 bg-transparent appearance-none" style={{ backgroundImage: 'none' }}>
                                <option value="">All</option>
                                <option value="Port Blair">Port Blair</option>
                                <option value="Havelock">Havelock</option>
                                <option value="Neil">Neil Island</option>
                                <option value="Baratang">Baratang</option>
                                <option value="Diglipur">Diglipur</option>
                             </select>
                          </div>
                      </div>
                      {/* Duration Filter */}
                      <div>
                           <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1"> Duration </label>
                            <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white overflow-hidden">
                               <Clock className="ml-3 text-gray-400 flex-shrink-0 pointer-events-none" size={16} />
                               <select id="duration" name="duration" value={filters.duration} onChange={handleFilterChange} className="pl-2 pr-8 py-2 w-full text-sm border-none focus:ring-0 bg-transparent appearance-none" style={{ backgroundImage: 'none' }}>
                                 <option value="">Any</option> <option value="4">4 Days</option> <option value="5">5 Days</option> <option value="6">6 Days</option> <option value="7">7 Days</option> <option value="8+">8+ Days</option>
                               </select>
                            </div>
                         </div>
                      {/* Price Range Filter */}
                       <div>
                           <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1"> Price Range </label>
                           <select id="priceRange" name="priceRange" value={filters.priceRange} onChange={handleFilterChange} className="pl-3 pr-8 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none text-sm" style={{ backgroundImage: 'none' }}>
                             <option value="">Any Price</option>
                             <option value="0-15000">Under ₹15k</option> {/* Example Ranges */}
                             <option value="15000-25000">₹15k - ₹25k</option>
                             <option value="25000-40000">₹25k - ₹40k</option>
                             <option value="40000">₹40k+</option>
                           </select>
                       </div>
                      {/* Activities Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"> Activities </label>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                            {/* TODO: Populate activities dynamically or improve API */}
                           {['Scuba Diving', 'Snorkeling', 'Trekking', 'Beach'].map(activity => (
                             <button key={activity} onClick={() => handleActivityToggle(activity)} className={`text-xs px-2 py-1 rounded-full transition-colors ${ filters.activities.includes(activity) ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' }`}>
                               {activity}
                             </button>
                           ))}
                         </div>
                      </div>
                  </div>
              </div>

              {/* --- Loading / Error / Package Listings --- */}
              {fetchStatus === 'loading' ? (
                 <LoadingSpinner />
              ) : fetchStatus === 'error' ? (
                  <div className="text-center py-10 px-4 bg-red-50 border border-red-200 rounded-md">
                      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3"/>
                      <p className="text-red-700 font-medium">Could not load packages.</p>
                      <p className="text-red-600 text-sm mt-1">{error?.message || "An unknown error occurred."}</p>
                  </div>
              ) : (
                  filteredPackages.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                          {filteredPackages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
                      </div>
                  ) : (
                      <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                          <h3 className="text-xl font-semibold mb-2">No packages found</h3>
                          <p className="text-gray-600">Try adjusting your filters or check back later.</p>
                      </div>
                  )
              )}

              {/* --- Custom Package CTA (remains the same) --- */}
              <div className="mt-12 md:mt-16 bg-blue-50 rounded-lg p-6 md:p-8 text-center">
                  <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Can't find what you're looking for?</h2>
                  <p className="text-gray-600 mb-5 md:mb-6 max-w-2xl mx-auto text-sm md:text-base"> Let us create a custom package tailored to your preferences, budget, and travel dates. </p>
                  <Link href="/custom-package" className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 md:py-3 md:px-6 rounded-md transition duration-300 text-sm md:text-base">
                      Create Custom Package
                  </Link>
              </div>
          </div>
      </div>
    </>
  );
}

// Wrap the main content component with Suspense for client-side data fetching
export default function PackagesPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <PackagesContent />
        </Suspense>
    );
}