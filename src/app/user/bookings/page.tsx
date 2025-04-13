// Path: .\src\app\user\bookings\page.tsx
'use client';
export const dynamic = 'force-dynamic'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar, AlertTriangle } from 'lucide-react';

// Define Booking Interface
interface Booking {
  id: string;
  packageId: string;
  packageName: string;
  startDate: string;
  endDate: string;
  guests: number;
  amount: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  paymentStatus: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

// Define API Response Interfaces
interface ApiBookingResponse {
    bookings: any[]; // Use any[] initially, map later
}

interface ApiErrorResponse {
    message?: string; // Optional message property
}

export default function UserBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setError(null);
    setLoading(true);
    try {
      const userId = 'user_123'; // Replace with actual user ID logic
      const response = await fetch(`/api/bookings?userId=${userId}`);

      // Try parsing JSON regardless of status code first
      let responseData: unknown;
      try {
           responseData = await response.json();
      } catch (jsonError) {
           console.error("Failed to parse API response JSON:", jsonError);
           if (!response.ok) {
               throw new Error(`Failed to fetch bookings. Status: ${response.status}`);
           } else {
               throw new Error("Received invalid data format from server.");
           }
      }

      if (!response.ok) {
        const errorData = responseData as ApiErrorResponse;
        const errorMessage = (typeof errorData?.message === 'string' && errorData.message)
                            ? errorData.message
                            : `Failed to fetch bookings. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const successData = responseData as { bookings?: any[] };

      if (!successData || !Array.isArray(successData.bookings)) {
         throw new Error("Invalid data structure received from bookings API.");
      }

       // --- FIX: Added missing closing parenthesis for .map() ---
       const fetchedBookings: Booking[] = successData.bookings.map((b: any): Booking => {
           const status = ['confirmed', 'pending', 'completed', 'cancelled'].includes(b.status) ? b.status : 'pending';
           const paymentStatus = ['completed', 'pending', 'failed'].includes(b.paymentStatus) ? b.paymentStatus : 'pending';

           return {
               id: String(b.id ?? `unknown-${Math.random()}`),
               packageId: String(b.packageId ?? ''),
               packageName: String(b.packageName || 'Unknown Package'),
               startDate: String(b.startDate || ''),
               endDate: String(b.endDate || ''),
               guests: Number(b.guests) || 0,
               amount: Number(b.amount) || 0,
               status: status as Booking['status'],
               paymentStatus: paymentStatus as Booking['paymentStatus'],
               createdAt: String(b.createdAt || new Date().toISOString()),
           };
       }); // <-- This closing parenthesis was missing
       // --- End of FIX ---

      setBookings(fetchedBookings);

      /* MOCK DATA SECTION (Comment out when using real API) */
      /*
      const mockBookings: Booking[] = [ ];
      setBookings(mockBookings);
      */
      /* END MOCK DATA SECTION */

    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings. Please try again later.');
      // setBookings([]); // Optionally clear
    } finally {
      setLoading(false);
    }
  };

  // handleViewBooking, handleCancelBooking, filterBookings, getStatusBadge, formatDate functions remain the same...
  const handleViewBooking = (bookingId: string) => { router.push(`/user/bookings/${bookingId}`); };
  const handleCancelBooking = async (bookingId: string) => {
      if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
      setError(null);
      try {
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API
          setBookings(currentBookings => currentBookings.map(booking => booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking ));
          alert('Booking cancelled successfully');
      } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to cancel booking. Please try again.';
          console.error('Error cancelling booking:', err);
          setError(message);
          alert(message);
      }
  };
  const filterBookings = (status: 'upcoming' | 'past' | 'cancelled'): Booking[] => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return bookings.filter(booking => {
          try {
              const endDate = new Date(booking.endDate); endDate.setHours(0,0,0,0);
              if (status === 'upcoming') return endDate >= today && booking.status !== 'cancelled' && booking.status !== 'completed';
              if (status === 'past') return endDate < today || booking.status === 'completed';
              if (status === 'cancelled') return booking.status === 'cancelled';
              return false;
          } catch { return false; }
      });
  };
  const getStatusBadge = (status: Booking['status']) => {
       const statusClasses: Record<Booking['status'], string> = { confirmed: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', completed: 'bg-blue-100 text-blue-800', cancelled: 'bg-red-100 text-red-800' };
       return ( <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}> {status.charAt(0).toUpperCase() + status.slice(1)} </span> );
   };
  const formatDate = (dateString: string | null | undefined): string => {
       if (!dateString) return 'N/A'; try { return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return 'Invalid Date'; }
   };

  const displayedBookings = filterBookings(activeTab);

  // JSX return statement remains the same...
  return (
     <div className="container mx-auto px-4 py-8">
       {/* ... Heading and Tabs ... */}
       <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
        <div className="mb-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {(['upcoming', 'past', 'cancelled'] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${ activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }`} aria-current={activeTab === tab ? 'page' : undefined} >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
            </div>
        </div>

        {/* Loading / Error / Content */}
         {loading ? ( <div className="text-center py-10"> <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" /> <p className="mt-2 text-gray-600">Loading...</p> </div> )
         : error ? ( <div className="bg-red-50 border-l-4 border-red-400 p-4"> <p className="text-sm text-red-700">{error}</p> </div> )
         : ( <div> {displayedBookings.length === 0 ? ( <div className="text-center py-10 bg-gray-50 rounded-lg"> <p>No {activeTab} bookings.</p> </div> )
                 : ( <div className="bg-white shadow overflow-hidden sm:rounded-md"> <ul role="list" className="divide-y divide-gray-200"> {displayedBookings.map((booking) => ( <li key={booking.id}> <div className="block hover:bg-gray-50"> <div className="px-4 py-4 sm:px-6"> <div className="flex items-center justify-between"> <p>{booking.packageName}</p> {getStatusBadge(booking.status)} </div> <div className="mt-2 sm:flex sm:justify-between"> <p>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</p> <p>₹{booking.amount.toLocaleString()}</p> </div> <div className="mt-4 flex justify-end space-x-3"> <button onClick={() => handleViewBooking(booking.id)}>View</button> {(booking.status === 'confirmed' || booking.status === 'pending') && activeTab === 'upcoming' && ( <button onClick={() => handleCancelBooking(booking.id)}>Cancel</button> )} </div> </div> </div> </li> ))} </ul> </div> )
             } </div> )
         }
     </div>
   );
}