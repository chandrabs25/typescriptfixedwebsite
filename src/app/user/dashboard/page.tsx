// Path: .\src\app\user\dashboard\page.tsx
'use client';
export const dynamic = 'force-dynamic'
import React, { useState, useEffect, Suspense } from 'react'; // Import useEffect, Suspense
import Link from 'next/link';
import { MapPin, Calendar, Clock, CreditCard, User, Star, Package, Bell, LogOut, Home, Users as UsersIcon, FileText, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import { useFetch } from '@/hooks/useFetch'; // Import useFetch

// --- Define Interfaces ---
type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

interface Booking { // From /api/bookings response
  id: number | string;
  package_id: number | null;
  packageName?: string; // Optional if joined
  package?: string; // Keep for compatibility if needed, prefer packageName
  start_date: string;
  end_date: string;
  total_people: number; // Use total_people from DB
  total_amount: number; // Use total_amount from DB
  status: BookingStatus;
}
interface GetBookingsApiResponse { // For /api/bookings fetch
    success: boolean;
    bookings: Booking[];
    message?: string;
}

// Placeholders for data structures not yet fetched from API
interface WishlistItem { id: number; name: string; duration: string; price: number; image: string; }
interface Review { id: number; package: string; rating: number; comment: string; date: string; }
interface Notification { id: number; message: string; date: string; read: boolean; }

// User structure from useAuth
interface AuthUser {
  id: string | number;
  email: string;
  first_name?: string;
  last_name?: string;
  role_id?: number;
  phone?: string; // Add if API provides
  joinDate?: string; // Add if API provides
}
// --- End Interfaces ---

// --- Loading Spinner ---
const LoadingSpinner = ({ text = "Loading..." }: { text?: string }) => (
    <div className="flex justify-center items-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        <span>{text}</span>
    </div>
);
// --- End Loading Spinner ---

// --- Helper Functions (Keep as they are) ---
const getStatusColor = (status: BookingStatus): string => {
    switch (status) { /* ... status color logic ... */
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
};
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'; try { return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return dateString; }
};
// --- End Helper Functions ---


// --- Main Dashboard Content Component ---
function DashboardContent() {
  const [activeTab, setActiveTab] = useState('bookings');
  const { user: authUser, isLoading: authLoading, isAuthenticated } = useAuth() as { user: AuthUser | null, isLoading: boolean, isAuthenticated: boolean };

  // --- Fetch Recent Bookings ---
  // Only fetch if the user is authenticated
  const bookingsApiUrl = isAuthenticated ? '/api/bookings?limit=3' : null; // Fetch only 3 recent
  const {
      data: bookingsResponse,
      error: bookingsError,
      status: bookingsStatus
  } = useFetch<GetBookingsApiResponse>(bookingsApiUrl);

  const recentBookings = bookingsResponse?.bookings || [];
  // --- End Fetch Recent Bookings ---

  // --- Placeholder Data (to be replaced by API calls) ---
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]); // Start empty
  const [reviews, setReviews] = useState<Review[]>([]); // Start empty
  const [notifications, setNotifications] = useState<Notification[]>([]); // Start empty
  // TODO: Fetch wishlist, reviews, notifications in separate useEffects or useFetch calls
  // Example for wishlist (needs /api/user/wishlist endpoint):
  // const { data: wishlistData } = useFetch('/api/user/wishlist');
  // useEffect(() => { if (wishlistData?.success) setWishlist(wishlistData.data) }, [wishlistData]);
  // --- End Placeholder Data ---


  // --- Calculate Stats ---
  // Use optional chaining and provide defaults
  const stats = {
      totalBookings: recentBookings.length, // Based on fetched recent only for now
      confirmedBookings: recentBookings.filter(b => b.status === 'confirmed').length,
      pendingBookings: recentBookings.filter(b => b.status === 'pending').length,
      wishlistCount: wishlist.length,
      reviewsCount: reviews.length,
      unreadNotifications: notifications.filter(n => !n.read).length,
  };
  // --- End Calculate Stats ---

  // Show loading spinner if auth check or initial booking fetch is in progress
  if (authLoading || (isAuthenticated && bookingsStatus === 'loading')) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  // Handle case where user is not authenticated (should ideally be handled by route protection)
  if (!isAuthenticated) {
      // Or redirect using useRouter
      return <div className="text-center py-20">Please <Link href="/auth/signin" className="text-blue-600 hover:underline">sign in</Link> to view your dashboard.</div>;
  }

  // Derive user display name
  const userDisplayName = authUser?.first_name ? `${authUser.first_name} ${authUser.last_name || ''}`.trim() : authUser?.email || 'User';
  const userJoinDate = formatDate(authUser?.joinDate) || 'N/A'; // Use joinDate if available from API


  return (
    <div className="bg-gray-50 min-h-screen">
      {/* --- Header Section (remains the same) --- */}
      <div className="bg-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="mt-2">Manage your bookings, wishlist, and account settings</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* User Profile Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
             <div className="flex items-center mb-4 md:mb-0">
                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                     {/* Use initials or a generic icon */}
                     <span className="text-2xl font-bold text-blue-600">{userDisplayName.charAt(0).toUpperCase()}</span>
                 </div>
                 <div>
                     <h2 className="text-xl font-semibold">{userDisplayName}</h2>
                     {/* Add join date if available from API */}
                     {/* <p className="text-gray-600 text-sm">Member since {userJoinDate}</p> */}
                 </div>
             </div>
             <div className="flex flex-wrap gap-2 sm:gap-4">
                 {/* Links remain the same */}
                 <Link href="/user/edit-profile" className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition duration-300"> Edit Profile </Link>
                 <Link href="/packages" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"> Browse Packages </Link>
             </div>
          </div>
        </div>

        {/* --- Dashboard Stats (using calculated stats) --- */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6"> <h3 className="text-sm font-medium text-gray-500 mb-1">Recent Bookings</h3> <p className="text-2xl sm:text-3xl font-bold">{stats.totalBookings}</p> <p className="mt-1 text-xs text-gray-600"> {stats.confirmedBookings} confirmed, {stats.pendingBookings} pending </p> </div>
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6"> <h3 className="text-sm font-medium text-gray-500 mb-1">Wishlist</h3> <p className="text-2xl sm:text-3xl font-bold">{stats.wishlistCount}</p> <p className="mt-1 text-xs text-gray-600"> Saved packages </p> </div>
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6"> <h3 className="text-sm font-medium text-gray-500 mb-1">Reviews</h3> <p className="text-2xl sm:text-3xl font-bold">{stats.reviewsCount}</p> <p className="mt-1 text-xs text-gray-600"> Reviews submitted </p> </div>
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6"> <h3 className="text-sm font-medium text-gray-500 mb-1">Notifications</h3> <p className="text-2xl sm:text-3xl font-bold">{stats.unreadNotifications}</p> <p className="mt-1 text-xs text-gray-600"> Unread notifications </p> </div>
         </div>

        {/* --- Dashboard Tabs (structure remains the same) --- */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="flex border-b overflow-x-auto">
             {(['bookings', 'wishlist', 'reviews', 'notifications', 'account'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 sm:px-6 py-3 font-medium text-sm whitespace-nowrap ${ activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600' }`}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
             ))}
          </div>

          <div className="p-6 min-h-[200px]"> {/* Added min-height */}
            {/* Bookings Tab Content */}
            {activeTab === 'bookings' && (
              <div>
                 {bookingsStatus === 'loading' && <LoadingSpinner text="Loading bookings..."/>}
                 {bookingsStatus === 'error' && (
                    <div className="text-center py-8 text-red-600"> <AlertTriangle className="inline-block mr-2" size={18}/> Could not load bookings: {bookingsError?.message}</div>
                 )}
                 {bookingsStatus === 'success' && recentBookings.length > 0 ? (
                     <div className="space-y-4">
                         {recentBookings.map((booking) => (
                            <div key={booking.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                                <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                                    <h3 className="font-semibold text-base">{booking.packageName || booking.package || `Booking #${booking.id}`}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {/* Use DB field names */}
                                    <div title="Dates"><Calendar size={14} className="inline mr-1" /> {formatDate(booking.start_date)} - {formatDate(booking.end_date)}</div>
                                    <div title="Guests"><UsersIcon size={14} className="inline mr-1" /> {booking.total_people} People</div>
                                    <div title="Amount"><CreditCard size={14} className="inline mr-1" /> ₹{booking.total_amount.toLocaleString('en-IN')}</div>
                                    <div className="text-right">
                                        <Link href={`/user/bookings/${booking.id}`} className="text-blue-600 hover:underline"> View Details </Link>
                                    </div>
                                </div>
                            </div>
                         ))}
                         {/* Link to see all bookings */}
                         <div className="text-center mt-6">
                              <Link href="/user/bookings" className="text-blue-600 hover:underline font-medium text-sm">View All Bookings →</Link>
                         </div>
                     </div>
                 ) : bookingsStatus === 'success' && recentBookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500"> You have no recent bookings. <Link href="/packages" className="text-blue-600 hover:underline">Explore packages?</Link> </div>
                 ) : null /* Handle loading/error above */
                 }
              </div>
            )}

            {/* Wishlist Tab Content (Placeholder) */}
            {activeTab === 'wishlist' && (
               <div className="text-center py-8 text-gray-500">
                    <Package size={24} className="mx-auto mb-2" /> Wishlist feature coming soon!
                    {/* TODO: Fetch and display wishlist items */}
               </div>
            )}

            {/* Reviews Tab Content (Placeholder) */}
            {activeTab === 'reviews' && (
               <div className="text-center py-8 text-gray-500">
                   <Star size={24} className="mx-auto mb-2" /> Your reviews feature coming soon!
                   {/* TODO: Fetch and display submitted reviews */}
               </div>
            )}

            {/* Notifications Tab Content (Placeholder) */}
            {activeTab === 'notifications' && (
               <div className="text-center py-8 text-gray-500">
                    <Bell size={24} className="mx-auto mb-2" /> Notifications feature coming soon!
                    {/* TODO: Fetch and display notifications */}
               </div>
            )}

            {/* Account Settings Tab Content */}
            {activeTab === 'account' && (
               <div className="max-w-xl">
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                     <div className="mb-4"> <label className="text-sm font-medium text-gray-500">Name</label> <input type="text" value={userDisplayName} readOnly className="w-full p-2 border rounded bg-gray-100 mt-1 text-sm"/> </div>
                     <div className="mb-4"> <label className="text-sm font-medium text-gray-500">Email</label> <input type="email" value={authUser?.email || ''} readOnly className="w-full p-2 border rounded bg-gray-100 mt-1 text-sm"/> </div>
                     {/* Add phone if available */}
                     {authUser?.phone && <div className="mb-4"> <label className="text-sm font-medium text-gray-500">Phone</label> <input type="tel" value={authUser.phone} readOnly className="w-full p-2 border rounded bg-gray-100 mt-1 text-sm"/> </div>}
                    <div className="flex justify-end mb-6"> <Link href="/user/edit-profile" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"> Edit Profile </Link> </div>
                     <hr className="my-6"/>
                     <h3 className="text-lg font-semibold mb-4">Account Security</h3>
                     <div className="mb-4"> <label className="text-sm font-medium text-gray-500">Password</label> <input type="password" value="••••••••" readOnly className="w-full p-2 border rounded bg-gray-100 mt-1 text-sm"/> </div>
                     <div className="flex justify-end"> <Link href="/user/change-password" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300"> Change Password </Link> </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// Wrap with Suspense
export default function UserDashboardPage() {
    return (
        <Suspense fallback={<LoadingSpinner text="Loading dashboard..." />}>
            <DashboardContent />
        </Suspense>
    );
}