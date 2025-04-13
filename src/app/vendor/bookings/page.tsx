// Path: .\src\app\vendor\bookings\page.tsx
'use client';
export const dynamic = 'force-dynamic'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar, AlertTriangle } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch'; // Import useFetch
import { useAuth } from '@/hooks/useAuth'; // Import auth hook


// Define Interfaces
type BookingStatusVendor = 'pending' | 'confirmed' | 'completed' | 'cancelled';
type PaymentStatusVendor = 'pending' | 'paid' | 'failed'; // Align with DB possibilities

// Interface for raw booking data from API (potentially joining user/package info)
interface RawVendorBooking {
  id: number;
  package_id?: number | null;
  user_id?: number | null;
  total_people: number;
  start_date: string;
  end_date: string;
  status: string; // Raw status from DB
  total_amount: number;
  payment_status: string; // Raw status from DB
  created_at: string;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  // Joined data (examples - adjust based on your actual API query)
  package_name?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
  user_phone?: string;
}

// Interface for processed booking data used in the component state
interface VendorBooking {
  id: string;
  packageName: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  startDate: string;
  endDate: string;
  guests: number;
  amount: number;
  netAmount: number; // Calculate if needed
  status: BookingStatusVendor;
  paymentStatus: PaymentStatusVendor;
  createdAt: string;
  // Keep raw IDs if needed for actions
  rawBookingId: number;
  rawPackageId?: number | null;
  rawUserId?: number | null;
}

interface VendorStats {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    totalRevenue: number; // Based on netAmount for completed/paid bookings
}

interface ApiBookingResponse {
    bookings: RawVendorBooking[]; // API returns raw data
}

// Loading Spinner
const LoadingSpinner = ({ message }: { message?: string }) => (
    <div className="text-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        <p className="mt-2 text-gray-600">{message || 'Loading...'}</p>
    </div>
);

export default function VendorBookingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth(); // Get authenticated vendor
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [stats, setStats] = useState<VendorStats>({
    pending: 0, confirmed: 0, completed: 0, cancelled: 0, totalRevenue: 0
  });
  const [activeTab, setActiveTab] = useState<BookingStatusVendor>('pending');

  // TODO: Fetch vendor ID based on user.id (if not directly available)
  // This might involve another API call or be included in the user object
  const vendorIdPlaceholder = user?.id ? 'fetch_vendor_id_for_' + user.id : null;

  // Fetch bookings for this vendor
  const { data: apiResponse, error: fetchError, status: fetchStatus } =
    useFetch<ApiBookingResponse>(vendorIdPlaceholder ? `/api/bookings?vendorId=${vendorIdPlaceholder}` : null); // Adjust API endpoint

  // Process fetched data and calculate stats
  useEffect(() => {
    if (fetchStatus === 'success' && apiResponse?.bookings) {
      const processedBookings = apiResponse.bookings.map((b: RawVendorBooking): VendorBooking => {
         const status = ['pending', 'confirmed', 'completed', 'cancelled'].includes(b.status) ? b.status : 'pending';
         const paymentStatus = ['pending', 'paid', 'failed'].includes(b.payment_status) ? b.payment_status : 'pending';
         const commissionRate = 0.1; // Example 10% commission
         const netAmount = b.total_amount * (1 - commissionRate);

         return {
             id: String(b.id), // Use string ID for consistency if needed
             rawBookingId: b.id,
             rawPackageId: b.package_id,
             rawUserId: b.user_id,
             packageName: b.package_name || 'Unknown Package', // Use joined name
             userName: b.guest_name || `${b.user_first_name || ''} ${b.user_last_name || ''}`.trim() || 'Unknown User',
             userEmail: b.guest_email || b.user_email || 'N/A',
             userPhone: b.guest_phone || b.user_phone || 'N/A',
             startDate: String(b.start_date || ''),
             endDate: String(b.end_date || ''),
             guests: Number(b.total_people) || 0,
             amount: Number(b.total_amount) || 0,
             netAmount: netAmount,
             status: status as VendorBooking['status'],
             paymentStatus: paymentStatus as VendorBooking['paymentStatus'],
             createdAt: String(b.created_at || new Date().toISOString()),
         };
       });
      setBookings(processedBookings);

      // Calculate stats from processed bookings
      const calculatedStats = processedBookings.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        // Calculate revenue based on completed bookings and successful payment
        if (booking.status === 'completed' && booking.paymentStatus === 'paid') {
          acc.totalRevenue += Number(booking.netAmount) || 0;
        }
        return acc;
      }, { pending: 0, confirmed: 0, completed: 0, cancelled: 0, totalRevenue: 0 } as VendorStats);
      setStats(calculatedStats);

    } else if (fetchStatus === 'error') {
        setBookings([]);
        setStats({ pending: 0, confirmed: 0, completed: 0, cancelled: 0, totalRevenue: 0 });
    }
  }, [fetchStatus, apiResponse]);


  // --- Action Handlers (View, Update Status - Need API calls) ---
  const handleViewBooking = (bookingId: string) => {
      // Find the raw numeric ID if needed
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
         router.push(`/vendor/bookings/${booking.rawBookingId}`); // Use raw ID for API/route
      }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatusVendor) => {
      // Find the booking and its raw ID
      const bookingToUpdate = bookings.find(b => b.id === bookingId);
      if (!bookingToUpdate) return;

      // TODO: Implement API call to update booking status
      // Need a PUT endpoint like /api/bookings/[id]/status
      console.log(`Simulating update status for booking ${bookingToUpdate.rawBookingId} to ${newStatus}`);
      try {
          // Show loading state?
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API
          // Optimistically update UI
          let oldStatus: BookingStatusVendor | undefined;
          setBookings(currentBookings => currentBookings.map(booking => {
              if (booking.id === bookingId) { oldStatus = booking.status; return { ...booking, status: newStatus }; }
              return booking;
          }));
          // Update stats based on the change
          if (oldStatus) { setStats(prevStats => ({ ...prevStats, [newStatus]: (prevStats[newStatus] || 0) + 1, [oldStatus!]: Math.max(0,(prevStats[oldStatus!] || 0) - 1) })); }
          alert(`Booking status updated to ${newStatus}`);
      } catch (err) {
          alert(err instanceof Error ? err.message : 'Failed to update status.');
      } finally {
          // Hide loading state?
      }
  };
  // --- End Action Handlers ---

  // Helper functions (formatDate, getStatusBadge, filterBookings)
  const filterBookings = (status: BookingStatusVendor): VendorBooking[] => { return bookings.filter(booking => booking.status === status); };
  const getStatusBadge = (status: BookingStatusVendor) => { const statusClasses: Record<BookingStatusVendor, string> = { confirmed: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', completed: 'bg-blue-100 text-blue-800', cancelled: 'bg-red-100 text-red-800' }; return ( <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}> {status.charAt(0).toUpperCase() + status.slice(1)} </span> ); };
  const formatDate = (dateString: string | null | undefined) => { if (!dateString) return 'N/A'; try { return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return 'Invalid Date'; } };

  const displayedBookings = filterBookings(activeTab);

  // --- Render Logic ---
  if (authLoading) {
      return <LoadingSpinner message="Authenticating..." />;
  }
  // Check if vendorId is available (might need adjustment based on how vendor ID is fetched)
  if (!vendorIdPlaceholder) {
       return <div className="container mx-auto px-4 py-8"><p>Could not identify vendor account.</p></div>;
  }

  return (
     <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Manage Bookings</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
             {/* Use calculated stats */}
             <div className="bg-white p-4 rounded-lg shadow"> <p className="text-sm text-gray-500">Pending</p> <p className="text-2xl font-bold">{stats.pending}</p> </div>
             <div className="bg-white p-4 rounded-lg shadow"> <p className="text-sm text-gray-500">Confirmed</p> <p className="text-2xl font-bold">{stats.confirmed}</p> </div>
             <div className="bg-white p-4 rounded-lg shadow"> <p className="text-sm text-gray-500">Completed</p> <p className="text-2xl font-bold">{stats.completed}</p> </div>
             <div className="bg-white p-4 rounded-lg shadow"> <p className="text-sm text-gray-500">Cancelled</p> <p className="text-2xl font-bold">{stats.cancelled}</p> </div>
             <div className="bg-white p-4 rounded-lg shadow"> <p className="text-sm text-gray-500">Est. Revenue</p> <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString('en-IN')}</p> </div>
        </div>

        {/* Tabs */}
        <div className="mb-6"> <div className="border-b border-gray-200"> <nav className="-mb-px flex space-x-8"> {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map(tab => ( <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 px-1 border-b-2 font-medium text-sm ${ activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }`}> {tab.charAt(0).toUpperCase() + tab.slice(1)} ({stats[tab]}) </button> ))} </nav> </div> </div>

        {/* Loading / Error / Content */}
         {fetchStatus === 'loading' ? ( <LoadingSpinner /> )
         : fetchStatus === 'error' ? ( <div className="bg-red-50 border-l-4 border-red-400 p-4"> <p className="text-sm text-red-700">{fetchError?.message || 'Failed to load bookings.'}</p> </div> )
         : ( <div> {displayedBookings.length === 0 ? ( <div className="text-center py-10 bg-gray-50 rounded-lg"> <p>No {activeTab} bookings found.</p> </div> )
                  : ( <div className="bg-white shadow overflow-hidden sm:rounded-md"> <ul className="divide-y divide-gray-200"> {displayedBookings.map((booking) => ( <li key={booking.id}> <div className="px-4 py-4 sm:px-6"> <div className="flex items-center justify-between"> <p className="text-sm font-medium text-blue-600 truncate">{booking.packageName}</p> <div className="ml-2 flex-shrink-0 flex"> {getStatusBadge(booking.status)} </div> </div> <div className="mt-2 sm:flex sm:justify-between"> <div className="sm:flex"> <p className="flex items-center text-sm text-gray-500 mr-4"> <Calendar size={14} className="mr-1"/> {formatDate(booking.startDate)} - {formatDate(booking.endDate)} </p> <p className="flex items-center text-sm text-gray-500"> {booking.userName} ({booking.guests} guests) </p> </div> <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0"> <p> Total: ₹{booking.amount.toLocaleString('en-IN')} / Net: ₹{booking.netAmount.toLocaleString('en-IN')} </p> </div> </div> <div className="mt-4 flex justify-end space-x-3 text-sm"> <button onClick={() => handleViewBooking(booking.id)} className="font-medium text-blue-600 hover:text-blue-800">View Details</button> {activeTab === 'pending' && ( <button onClick={() => handleUpdateStatus(booking.id, 'confirmed')} className="font-medium text-green-600 hover:text-green-800">Confirm</button> )} {activeTab === 'confirmed' && ( <button onClick={() => handleUpdateStatus(booking.id, 'completed')} className="font-medium text-indigo-600 hover:text-indigo-800">Mark Completed</button> )} {(activeTab === 'pending' || activeTab === 'confirmed') && ( <button onClick={() => handleUpdateStatus(booking.id, 'cancelled')} className="font-medium text-red-600 hover:text-red-800">Cancel Booking</button> )} </div> </div> </li> ))} </ul> </div> )
              } </div> )
        }
    </div>
  );
}