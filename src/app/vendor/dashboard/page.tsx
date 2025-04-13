// Path: .\src\app\vendor\dashboard\page.tsx
'use client';
export const dynamic = 'force-dynamic'
import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, Calendar, Clock, User as UserIconLucide, MapPin, Phone, Mail, Shield, Package, Activity, Settings, LogOut, Home, Users as UsersIcon, FileText, Star, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';

// --- Interfaces ---
interface AuthUser {
  id: string | number;
  email: string;
  first_name?: string;
  last_name?: string;
  role_id?: number;
}
interface VendorProfile {
  id: number;
  user_id: number;
  business_name: string;
  type: string;
  address: string | null;
  verified: number;
  email?: string;
  phone?: string;
  created_at?: string;
  profile_image?: string | null;
  description?: string | null;
}
interface GetVendorProfileResponse { success: boolean; data: VendorProfile | null; message?: string; }

interface VendorStats {
    totalServices: number;
    activeBookings: number;
    totalEarnings: number;
    reviewScore: number | null;
}
interface GetVendorStatsResponse { success: boolean; data: VendorStats | null; message?: string; }

interface VendorService {
  id: number;
  name: string;
  price: string | number; // Allow both for flexibility from API
  duration?: string;
  bookings_count?: number;
  rating?: number | null;
  is_active: number; // Assuming 0 or 1
}
interface GetVendorServicesResponse { success: boolean; data: VendorService[]; message?: string; }

type VendorBookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
interface VendorBooking {
  id: number | string;
  serviceOrPackageName: string;
  customerName: string;
  start_date: string;
  end_date?: string;
  total_people: number;
  total_amount: number;
  net_amount: number;
  status: VendorBookingStatus;
}
interface GetVendorBookingsResponse { success: boolean; data: VendorBooking[]; message?: string; }

interface VendorReview {
  id: number;
  serviceName: string;
  customerName: string;
  rating: number;
  comment: string | null;
  created_at: string;
}
interface GetVendorReviewsResponse { success: boolean; data: VendorReview[]; message?: string; }
// --- End Interfaces ---


// --- LoadingSpinner Component ---
const LoadingSpinner = ({ text = "Loading..." }: { text?: string }) => (
    <div className="flex justify-center items-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        <span>{text}</span>
    </div>
);
// --- End Loading Spinner ---

// --- Helper Functions (FIXED: Ensure all paths return string) ---
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return 'Invalid Date'; // Return a string even on error
    }
};
const getBookingStatusColor = (status: VendorBookingStatus): string => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default:
          console.warn(`Unknown booking status in getBookingStatusColor: ${status}`);
          return 'bg-gray-100 text-gray-800'; // Ensure default returns string
    }
};
const getServiceStatusColor = (isActive: number): string => {
    // Ensure return type is always string
    return isActive === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
};
// --- End Helper Functions ---


// --- Main Dashboard Content Component ---
function VendorDashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const { user: authUser, isLoading: authLoading, isAuthenticated, logout } = useAuth() as {
      user: AuthUser | null;
      isLoading: boolean;
      isAuthenticated: boolean;
      logout: () => Promise<void>;
  };

  const userId = authUser?.id;

  // --- Fetch Vendor Specific Data ---
  // TODO: Replace placeholders with actual API endpoints when ready
  const profileApiUrl = userId ? `/api/vendors/profile?userId=${userId}` : null; // Placeholder
  const statsApiUrl = userId ? `/api/vendors/stats?userId=${userId}` : null; // Placeholder
  const servicesApiUrl = userId ? `/api/services?providerUserId=${userId}&limit=5` : null; // Placeholder
  const bookingsApiUrl = userId ? `/api/bookings?vendorUserId=${userId}&limit=5` : null; // Placeholder
  const reviewsApiUrl = userId ? `/api/reviews?vendorUserId=${userId}&limit=3` : null; // Placeholder

  const { data: profileResponse, error: profileError, status: profileStatus } = useFetch<GetVendorProfileResponse>(profileApiUrl);
  const { data: statsResponse, error: statsError, status: statsStatus } = useFetch<GetVendorStatsResponse>(statsApiUrl);
  const { data: servicesResponse, error: servicesError, status: servicesStatus } = useFetch<GetVendorServicesResponse>(servicesApiUrl);
  const { data: bookingsResponse, error: bookingsError, status: bookingsStatus } = useFetch<GetVendorBookingsResponse>(bookingsApiUrl);
  const { data: reviewsResponse, error: reviewsError, status: reviewsStatus } = useFetch<GetVendorReviewsResponse>(reviewsApiUrl);

  const vendorProfile = profileResponse?.data;
  const vendorStats = statsResponse?.data ?? { totalServices: 0, activeBookings: 0, totalEarnings: 0, reviewScore: null };
  const vendorServices = servicesResponse?.data || [];
  const vendorBookings = bookingsResponse?.data || [];
  const vendorReviews = reviewsResponse?.data || [];

  // --- Authorization Check ---
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || authUser?.role_id !== 3)) {
        router.replace('/auth/signin?reason=unauthorized_vendor');
    }
  }, [authLoading, isAuthenticated, authUser, router]);

  // --- Loading State ---
  const isLoading = authLoading || profileStatus === 'loading' || statsStatus === 'loading';
  const fetchError = profileError || statsError;

  if (isLoading) { return <LoadingSpinner text="Loading Vendor Dashboard..." />; }

  // Handle critical errors (auth/profile fetch)
  if (!isAuthenticated || !authUser || (profileStatus === 'error' && profileApiUrl) || (statsStatus === 'error' && statsApiUrl)) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-10">
             <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
             <h2 className="text-2xl font-semibold text-red-600 mb-4">Access Denied or Error</h2>
             <p className="text-gray-700 mb-6">
                 {fetchError?.message || "Could not load essential vendor data or invalid permissions."}
             </p>
             <button onClick={logout} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Logout and Sign In
             </button>
         </div>
      );
  }
  // --- End Loading/Error/Auth Handling ---


  // --- Render Tab Content Logic ---
  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div>
            {/* Stats Display - FIX: Restored JSX content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Services */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                 <div className="flex items-center mb-4">
                   <div className="bg-blue-100 p-3 rounded-full mr-4"> <Activity className="h-6 w-6 text-blue-600" /> </div>
                   <div> <p className="text-sm text-gray-500">Total Services</p> <h3 className="text-2xl font-bold">{vendorStats.totalServices}</h3> </div>
                 </div>
                 <div className="h-1 bg-gray-200 rounded-full"><div className="h-1 bg-blue-500 rounded-full" style={{width: '100%'}}></div></div> {/* Example progress */}
              </div>
              {/* Active Bookings */}
               <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-full mr-4"> <Calendar className="h-6 w-6 text-green-600" /> </div>
                    <div> <p className="text-sm text-gray-500">Active Bookings</p> <h3 className="text-2xl font-bold">{vendorStats.activeBookings}</h3> </div>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full"><div className="h-1 bg-green-500 rounded-full" style={{width: '75%'}}></div></div> {/* Example progress */}
               </div>
              {/* Review Score */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                 <div className="flex items-center mb-4">
                   <div className="bg-purple-100 p-3 rounded-full mr-4"> <Star className="h-6 w-6 text-purple-600" /> </div>
                   <div> <p className="text-sm text-gray-500">Avg. Rating</p> <h3 className="text-2xl font-bold">{vendorStats.reviewScore ? `${vendorStats.reviewScore.toFixed(1)}/5` : 'N/A'}</h3> </div>
                 </div>
                  <div className="h-1 bg-gray-200 rounded-full"><div className="h-1 bg-purple-500 rounded-full" style={{width: `${(vendorStats.reviewScore || 0)/5 * 100}%`}}></div></div> {/* Example progress */}
              </div>
              {/* Total Earnings */}
               <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="bg-yellow-100 p-3 rounded-full mr-4"> <FileText className="h-6 w-6 text-yellow-600" /> </div>
                    <div> <p className="text-sm text-gray-500">Total Earnings</p> <h3 className="text-2xl font-bold">₹{vendorStats.totalEarnings.toLocaleString('en-IN')}</h3> </div>
                  </div>
                   <div className="h-1 bg-gray-200 rounded-full"><div className="h-1 bg-yellow-500 rounded-full" style={{width: '85%'}}></div></div> {/* Example progress */}
               </div>
            </div>
            {/* End Stats Display */}

            {/* Recent Bookings & Reviews Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Bookings Card */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                 <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                 {bookingsStatus === 'loading' && <LoadingSpinner text="Loading bookings..."/>}
                 {bookingsStatus === 'error' && <p className="text-sm text-red-600">Error: {bookingsError?.message}</p>}
                 {bookingsStatus === 'success' && vendorBookings.length > 0 ? (
                     <>
                         <div className="overflow-x-auto -mx-6">
                             <table className="min-w-full">
                                 <thead> <tr className="border-b"> <th className="py-2 px-6 text-left text-xs font-medium text-gray-500 uppercase">Service/Pkg</th> <th className="py-2 px-6 text-left text-xs font-medium text-gray-500 uppercase">Date</th> <th className="py-2 px-6 text-left text-xs font-medium text-gray-500 uppercase">Amount</th> <th className="py-2 px-6 text-left text-xs font-medium text-gray-500 uppercase">Status</th> </tr> </thead>
                                 <tbody>
                                     {vendorBookings.map(booking => (
                                         <tr key={booking.id} className="border-b text-sm hover:bg-gray-50">
                                         <td className="py-2 px-6 font-medium truncate max-w-[150px]">{booking.serviceOrPackageName}</td>
                                         <td className="py-2 px-6">{formatDate(booking.start_date)}</td>
                                         <td className="py-2 px-6">₹{booking.net_amount?.toLocaleString('en-IN') ?? booking.total_amount?.toLocaleString('en-IN')}</td>
                                         <td className="py-2 px-6"><span className={`px-2 py-0.5 rounded-full text-xs ${getBookingStatusColor(booking.status)}`}>{booking.status}</span></td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                         <div className="mt-4 text-right"> <Link href="/vendor/bookings" className="text-blue-600 hover:text-blue-800 text-sm font-medium"> View all bookings → </Link> </div>
                     </>
                 ) : bookingsStatus === 'success' ? ( <p className="text-sm text-gray-500 text-center py-4">No recent bookings.</p> ) : null}
              </div>

              {/* Recent Reviews Card */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                 <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
                  {reviewsStatus === 'loading' && <LoadingSpinner text="Loading reviews..."/>}
                  {reviewsStatus === 'error' && <p className="text-sm text-red-600">Error: {reviewsError?.message}</p>}
                  {reviewsStatus === 'success' && vendorReviews.length > 0 ? (
                     <>
                         <div className="space-y-4">
                             {vendorReviews.map(review => (
                                 <div key={review.id} className="border-b pb-4 last:border-b-0">
                                     <div className="flex justify-between items-start mb-2"> <div><p className="font-medium text-sm">{review.serviceName}</p><p className="text-xs text-gray-500">{review.customerName} • {formatDate(review.created_at)}</p></div> <div className="flex items-center bg-yellow-100 px-2 py-0.5 rounded-full text-xs"><Star className="h-3 w-3 text-yellow-500 mr-1" /><span>{review.rating}/5</span></div> </div>
                                     <p className="text-sm text-gray-700 line-clamp-2">{review.comment || "No comment."}</p>
                                 </div>
                             ))}
                         </div>
                         <div className="mt-4 text-right"> <Link href="/vendor/reviews" className="text-blue-600 hover:text-blue-800 text-sm font-medium"> View all reviews → </Link> </div>
                     </>
                  ) : reviewsStatus === 'success' ? ( <p className="text-sm text-gray-500 text-center py-4">No recent reviews.</p> ) : null}
              </div>
            </div>
          </div>
        );
      case 'services':
        return <div className="text-center py-10 text-gray-500">(Service Management UI - <Link href="/vendor/services" className="text-blue-600 hover:underline">Go to Service Page</Link>)</div>;
      case 'bookings':
        return <div className="text-center py-10 text-gray-500">(Booking Management UI - <Link href="/vendor/bookings" className="text-blue-600 hover:underline">Go to Booking Page</Link>)</div>;
      case 'reviews':
        return <div className="text-center py-10 text-gray-500">(Reviews Management UI - Placeholder)</div>;
      case 'profile':
        // Use optional chaining for safety as vendorProfile might be null briefly
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-bold mb-6">Business Profile</h2>
                 <div className="space-y-4 text-sm">
                     <div><label className="font-medium text-gray-500 block mb-1">Business Name</label><p className="text-gray-800">{vendorProfile?.business_name || 'N/A'}</p></div>
                     <div><label className="font-medium text-gray-500 block mb-1">Type</label><p className="text-gray-800">{vendorProfile?.type || 'N/A'}</p></div>
                     <div><label className="font-medium text-gray-500 block mb-1">Email</label><p className="text-gray-800">{vendorProfile?.email || authUser?.email || 'N/A'}</p></div>
                     <div><label className="font-medium text-gray-500 block mb-1">Phone</label><p className="text-gray-800">{vendorProfile?.phone || 'N/A'}</p></div>
                     <div><label className="font-medium text-gray-500 block mb-1">Address</label><p className="text-gray-800">{vendorProfile?.address || 'Not Provided'}</p></div>
                     <div><label className="font-medium text-gray-500 block mb-1">Status</label><p>{vendorProfile?.verified ? <span className="text-green-600 font-medium inline-flex items-center"><Shield size={14} className="mr-1"/>Verified</span> : <span className="text-yellow-600 font-medium">Pending Verification</span>}</p></div>
                     <div className="pt-4 text-right border-t mt-4"><button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">Edit Profile</button></div>
                 </div>
            </div>
        );
      default:
        return null; // Should not happen
    }
  };
  // --- End Render Tab Content Logic ---


  // --- Main Return Structure ---
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold truncate">{vendorProfile?.business_name || 'Vendor Area'}</h1>
          <p className="text-gray-400 text-sm mt-1 truncate">{vendorProfile?.type || 'Service Provider'}</p>
        </div>
        <nav className="flex-grow p-4 overflow-y-auto"> {/* Added overflow */}
          <ul className="space-y-1">
             {(['overview', 'services', 'bookings', 'reviews', 'profile'] as const).map(tab => (
                 <li key={tab}>
                     <button onClick={() => setActiveTab(tab)} className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${ activeTab === tab ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white' }`}>
                         {tab === 'overview' && <Home size={16} className="mr-2"/>}
                         {tab === 'services' && <Package size={16} className="mr-2"/>}
                         {tab === 'bookings' && <Calendar size={16} className="mr-2"/>}
                         {tab === 'reviews' && <Star size={16} className="mr-2"/>}
                         {tab === 'profile' && <UserIconLucide size={16} className="mr-2"/>}
                         {tab.charAt(0).toUpperCase() + tab.slice(1)}
                     </button>
                 </li>
             ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={logout} className="flex items-center text-gray-300 hover:text-white transition-colors w-full text-sm">
            <LogOut size={16} className="mr-2" /> Logout
          </button>
        </div>
      </div> {/* End Sidebar */}

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 bg-gray-100 overflow-y-auto"> {/* Added overflow */}
        <div className="mb-6 flex justify-between items-center">
             <h1 className="text-2xl font-bold text-gray-800">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
             </h1>
         </div>
        {/* Render Active Tab Content */}
        {renderTabContent()}
      </main> {/* End Main Content */}
    </div>
  );
}


// --- Wrap with Suspense ---
export default function VendorDashboardPage() {
    return (
        <Suspense fallback={<LoadingSpinner text="Loading Vendor Dashboard..." />}>
            <VendorDashboardContent />
        </Suspense>
    );
}