// Path: .\src\app\vendors\page.tsx
'use client';

import React, { useState } from 'react'; // Import React
import Link from 'next/link';
import { MapPin, Star, Clock, Users, Phone, Mail, Globe, Shield } from 'lucide-react'; // Added Shield

// --- Define Interfaces ---
interface Vendor {
  id: number;
  name: string;
  type: string; // Can be refined e.g., 'Activity Provider' | 'Accommodation' | ...
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  services: string[];
  priceRange: string; // Example: '₹1,200 - ₹3,500' - might need better structure
  image?: string; // Optional image path
  verified: boolean;
}

interface FiltersState {
  type: string;
  location: string;
  rating: string;
  priceRange: string;
}
// --- End Interfaces ---


export default function VendorListings() {
  // --- Explicitly type the state ---
  const [filters, setFilters] = useState<FiltersState>({
    type: '',
    location: '',
    rating: '',
    priceRange: ''
  });
  // --- End State Typing ---

  // --- Mock vendor data (Typed) ---
  const vendors: Vendor[] = [ // Use Vendor type
    { id: 1, name: 'Island Adventures', type: 'Activity Provider', location: 'Port Blair', rating: 4.8, reviewCount: 124, description: 'Offering a wide range of water activities including scuba diving, snorkeling, and sea walking experiences.', services: ['Scuba Diving', 'Snorkeling', 'Sea Walking', 'Glass Bottom Boat'], priceRange: '₹1,200 - ₹3,500', image: '/images/vendors/island-adventures.jpg', verified: true },
    { id: 2, name: 'Barefoot Resorts', type: 'Accommodation', location: 'Havelock Island', rating: 4.9, reviewCount: 256, description: 'Luxury eco-friendly resort located on the pristine Radhanagar Beach with stunning ocean views and world-class amenities.', services: ['Beachfront Villas', 'Restaurant', 'Spa', 'Water Sports'], priceRange: '₹12,000 - ₹25,000', image: '/images/vendors/barefoot-resorts.jpg', verified: true },
    { id: 3, name: 'Andaman Ferries', type: 'Transportation', location: 'Port Blair', rating: 4.6, reviewCount: 189, description: 'Reliable ferry service connecting Port Blair, Havelock, and Neil Island with comfortable seating and on-time departures.', services: ['Ferry Transport', 'Private Charters', 'Island Hopping'], priceRange: '₹800 - ₹1,500', image: '/images/vendors/andaman-ferries.jpg', verified: true },
    { id: 4, name: 'Coral Safari', type: 'Activity Provider', location: 'Havelock Island', rating: 4.7, reviewCount: 112, description: 'Specialized in scuba diving and underwater photography with experienced instructors and top-quality equipment.', services: ['Scuba Diving', 'Underwater Photography', 'PADI Certification'], priceRange: '₹3,500 - ₹15,000', image: '/images/vendors/coral-safari.jpg', verified: true },
    { id: 5, name: 'Neil Island Retreats', type: 'Accommodation', location: 'Neil Island', rating: 4.5, reviewCount: 87, description: 'Peaceful cottages surrounded by tropical gardens, just a short walk from Bharatpur Beach.', services: ['Garden Cottages', 'Restaurant', 'Bicycle Rental', 'Tour Desk'], priceRange: '₹4,500 - ₹8,000', image: '/images/vendors/neil-island-retreats.jpg', verified: false },
    { id: 6, name: 'Andaman Explorers', type: 'Tour Operator', location: 'Port Blair', rating: 4.8, reviewCount: 203, description: 'Comprehensive tour packages covering all major attractions in the Andaman Islands with knowledgeable local guides.', services: ['Guided Tours', 'Custom Itineraries', 'Group Packages', 'Private Tours'], priceRange: '₹2,500 - ₹20,000', image: '/images/vendors/andaman-explorers.jpg', verified: true }
  ];
  // --- End Mock Data ---


  // --- FIX: Add type to event parameter 'e' ---
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  // --- End FIX ---
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Filtering logic remains the same, benefits from typed state
  const filteredVendors = vendors.filter(vendor => {
    if (filters.type && vendor.type !== filters.type) return false;
    if (filters.location && vendor.location !== filters.location) return false;
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      if (!isNaN(minRating) && vendor.rating < minRating) return false; // Added isNaN check
    }
    if (filters.priceRange) {
      // Simplified logic based on dropdown values 'budget', 'mid', 'luxury'
       // Adjust this based on how you define these ranges relative to vendor.priceRange string
       const priceString = vendor.priceRange.replace(/[^0-9-]/g, ''); // Extract numbers/range
       const prices = priceString.split('-').map(Number).filter(n => !isNaN(n));
       const minVendorPrice = prices.length > 0 ? prices[0] : 0;

       if (filters.priceRange === 'budget' && minVendorPrice > 5000) return false; // Example threshold
       if (filters.priceRange === 'mid' && (minVendorPrice < 5000 || minVendorPrice > 15000)) return false; // Example threshold
       if (filters.priceRange === 'luxury' && minVendorPrice < 15000) return false; // Example threshold
    }
    return true;
  });

  // --- JSX remains largely the same ---
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Service Providers</h1>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Discover our verified service providers offering accommodations, activities, transportation, and tour services across the Andaman Islands.
        </p>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Filter Providers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1"> Provider Type </label>
              <select id="type" name="type" value={filters.type} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"> {/* Added bg-white */}
                <option value="">All Types</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Activity Provider">Activity Provider</option>
                <option value="Transportation">Transportation</option>
                <option value="Tour Operator">Tour Operator</option>
              </select>
            </div>
            {/* Location Filter */}
             <div>
               <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1"> Location </label>
               <select id="location" name="location" value={filters.location} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                 <option value="">All Locations</option>
                 <option value="Port Blair">Port Blair</option>
                 <option value="Havelock Island">Havelock Island</option>
                 <option value="Neil Island">Neil Island</option>
               </select>
             </div>
            {/* Rating Filter */}
             <div>
               <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1"> Minimum Rating </label>
               <select id="rating" name="rating" value={filters.rating} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                 <option value="">Any Rating</option>
                 <option value="4.5">4.5+ Stars</option>
                 <option value="4.0">4.0+ Stars</option>
                 <option value="3.5">3.5+ Stars</option>
               </select>
             </div>
            {/* Price Range Filter */}
            <div>
              <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1"> Price Range </label>
              <select id="priceRange" name="priceRange" value={filters.priceRange} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="">Any Price</option>
                <option value="budget">Budget (Under ₹5k)</option>
                <option value="mid">Mid-Range (₹5k-₹15k)</option>
                <option value="luxury">Luxury (Over ₹15k)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vendor Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"> {/* Added gap control */}
          {filteredVendors.length > 0 ? (
            filteredVendors.map(vendor => (
              <div key={vendor.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-[1.02]">
                {/* Vendor Card Content */}
                 <div className="h-48 bg-gray-200 relative"> {/* Placeholder */}
                    {/* Optional Image: <Image src={vendor.image || '/images/placeholder.jpg'} alt={vendor.name} fill className="object-cover"/> */}
                    {vendor.verified && ( <div className="absolute top-3 right-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center"> <Shield className="h-3 w-3 mr-1" /> Verified </div> )}
                 </div>
                 <div className="p-4 sm:p-5"> {/* Adjusted padding */}
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-lg font-semibold">{vendor.name}</h3>
                       <div className="flex items-center text-yellow-500 flex-shrink-0 ml-2"> <Star size={14} fill="currentColor" /> <span className="ml-1 text-xs font-medium">{vendor.rating}</span> <span className="ml-1 text-xs text-gray-500">({vendor.reviewCount})</span> </div>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2 text-sm"> <MapPin size={14} className="mr-1 flex-shrink-0" /> <span>{vendor.location}</span> </div>
                    <div className="mb-3"> <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"> {vendor.type} </span> </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{vendor.description}</p> {/* Adjusted line clamp */}
                    <div className="flex flex-wrap gap-1 mb-3"> {vendor.services.slice(0, 3).map((service, index) => ( <span key={index} className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded"> {service} </span> ))} {vendor.services.length > 3 && ( <span className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded"> +{vendor.services.length - 3} more </span> )} </div>
                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100"> {/* Use mt-auto */}
                       <span className="text-gray-600 text-xs"> Price: <span className="font-semibold">{vendor.priceRange}</span> </span>
                       <Link href={`/vendors/${vendor.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium"> View Details </Link>
                    </div>
                 </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No service providers found</h3>
              <p className="text-gray-600">Try adjusting your filters.</p>
            </div>
          )}
        </div>

        {/* Become a Vendor CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center"> {/* Changed background */}
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Are You a Service Provider?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our platform to reach thousands of travelers planning their trip to the Andaman Islands. List your services, manage bookings, and grow your business with us.
          </p>
          <Link
            href="/vendor/register"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 rounded-md transition duration-300 shadow-sm hover:shadow-md" // Adjusted style
          >
            Register as Vendor
          </Link>
        </div>
      </div>
    </div>
  );
}