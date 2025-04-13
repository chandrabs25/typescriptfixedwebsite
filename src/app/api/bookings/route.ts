// Path: .\src\app\api\bookings\route.ts
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyAuth } from '@/lib/auth'; // Import verifyAuth to check login status
export const runtime = 'edge'
// --- FIX: Remove Edge Runtime ---
// export const runtime = 'edge'; // Remove: Needs DB access & potentially auth logic

// --- FIX: Define interface for the Booking DB structure ---
interface BookingDbRecord {
  id: number;
  user_id: number | null; // Now nullable
  package_id: number | null;
  total_people: number;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  payment_status: string;
  payment_details: string | null;
  special_requests: string | null;
  guest_name: string | null;     // Added
  guest_email: string | null;    // Added
  guest_phone: string | null;    // Added
  created_at: string;
  updated_at: string;
}
// --- End of FIX ---


// --- FIX: Update BookingRequestBody ---
interface BookingRequestBody {
    // Required fields for any booking
    packageId: number; // Assuming packageId is numeric
    startDate: string;
    endDate: string;
    guests: number;
    amount: number; // This should probably be calculated server-side based on package/guests
    specialRequests?: string;

    // Guest details (required if not logged in)
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;

    // userId is no longer explicitly sent in body, derived from session
}
// --- End of FIX ---


// --- GET Handler (Modified slightly for context) ---
// This handler likely needs AUTHENTICATION to fetch specific user/vendor bookings
// It should NOT fetch guest bookings unless specifically designed (e.g., for admin)
export async function GET(request: NextRequest) {
   // TODO: Implement proper authentication and filtering for GET
   // Example: Fetch bookings for the logged-in user
    const authCheck = await verifyAuth(request);
    if (!authCheck.isAuthenticated || !authCheck.user) {
        return NextResponse.json({ success: false, message: 'Authentication required to view bookings.' }, { status: 401 });
    }
    const userId = parseInt(authCheck.user.id as string, 10); // Assuming user ID is numeric

    try {
        const db = getDatabase();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // Example filter

        let query = 'SELECT * FROM bookings WHERE user_id = ?';
        const params: (string | number)[] = [userId];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        query += ' ORDER BY start_date DESC';

        const { results, success, error } = await db.prepare(query)
            .bind(...params)
            .all<BookingDbRecord>();

         if (!success) {
             console.error("Failed to fetch user bookings:", error);
             throw new Error("Database query failed");
         }

        return NextResponse.json({ success: true, bookings: results || [] }, { status: 200 });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
        { message: 'Failed to fetch bookings', error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
        );
    }
}
// --- End GET Handler ---


// --- FIX: Updated POST Handler for Guest/User Bookings ---
export async function POST(request: NextRequest) {
  let userId: number | null = null;
  let userEmail: string | null = null; // Store email for notifications

  try {
    // 1. Check if user is authenticated
    const authResult = await verifyAuth(request);
    if (authResult.isAuthenticated && authResult.user) {
      userId = parseInt(authResult.user.id as string, 10); // Assuming numeric ID
      userEmail = authResult.user.email as string; // Get email from authenticated user
      console.log(`Authenticated user booking request. User ID: ${userId}`);
    } else {
      console.log("Guest booking request.");
    }

    // 2. Parse request body
    const bookingData = await request.json() as BookingRequestBody;

    // 3. Validate common required fields
    const commonRequiredFields: (keyof BookingRequestBody)[] = ['packageId', 'startDate', 'endDate', 'guests', 'amount'];
    const missingCommonFields = commonRequiredFields.filter(field => !(field in bookingData) || bookingData[field] === undefined || bookingData[field] === null || bookingData[field] === '');
    if (missingCommonFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required booking details: ${missingCommonFields.join(', ')}` },
        { status: 400 }
      );
    }

    // 4. Validate guest details OR ensure user is logged in
    let guestName: string | null = null;
    let guestEmail: string | null = null;
    let guestPhone: string | null = null;

    if (!userId) { // If not logged in, guest details are required
      const guestRequiredFields: (keyof BookingRequestBody)[] = ['guestName', 'guestEmail', 'guestPhone'];
      const missingGuestFields = guestRequiredFields.filter(field => !(field in bookingData) || !bookingData[field]);

      if (missingGuestFields.length > 0) {
        return NextResponse.json(
          { message: `Guest details required for booking without an account: ${missingGuestFields.join(', ')}` },
          { status: 400 }
        );
      }
      // Validate guest email format (basic)
      if (!/\S+@\S+\.\S+/.test(bookingData.guestEmail!)) {
         return NextResponse.json({ message: 'Invalid guest email format.' }, { status: 400 });
      }
      guestName = bookingData.guestName!;
      guestEmail = bookingData.guestEmail!;
      guestPhone = bookingData.guestPhone!;
      userEmail = guestEmail; // Use guest email for notifications
    }

    // 5. TODO: Check availability (ensure this logic exists and works)
    // const isAvailable = await checkAvailability(
    //   bookingData.packageId.toString(), // checkAvailability might expect string
    //   bookingData.startDate,
    //   bookingData.endDate,
    //   bookingData.guests
    // );
    // if (!isAvailable) {
    //   return NextResponse.json(
    //     { message: 'The selected dates or package is not available' },
    //     { status: 409 } // Conflict
    //   );
    // }

    // 6. Prepare data for DB insert
    const db = getDatabase();
    const insertStmt = db.prepare(`
      INSERT INTO bookings (
        user_id, package_id, total_people, start_date, end_date,
        total_amount, status, payment_status, special_requests,
        guest_name, guest_email, guest_phone, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const result = await insertStmt.bind(
        userId, // NULL if guest
        bookingData.packageId,
        bookingData.guests,
        bookingData.startDate,
        bookingData.endDate,
        bookingData.amount, // Consider recalculating server-side for security
        'pending', // Initial status
        'pending', // Initial payment status
        bookingData.specialRequests || null,
        guestName, // NULL if logged-in user
        guestEmail, // NULL if logged-in user
        guestPhone, // NULL if logged-in user
    ).run();

    if (!result.success || !result.meta?.last_row_id) {
         console.error("Booking insert failed:", result);
         throw new Error('Database operation failed to create booking.');
    }

    const newBookingId = result.meta.last_row_id;

    // 7. TODO: Send confirmation email (to userEmail)
    console.log(`Booking created successfully (ID: ${newBookingId}). Need to send confirmation to ${userEmail}`);
    // Call email sending service here...


    // Fetch the created booking to return it
    const newBooking = await db.prepare("SELECT * FROM bookings WHERE id = ?")
        .bind(newBookingId)
        .first<BookingDbRecord>();

    return NextResponse.json({
        success: true,
        message: "Booking created successfully!",
        booking: newBooking // Return the created booking details
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Failed to create booking', error: errorMessage },
      { status: 500 }
    );
  }
}
// --- End of FIX ---


// Helper function stub - Implement actual availability check
async function checkAvailability(packageId: string, startDate: string, endDate: string, guests: number): Promise<boolean> {
    console.warn(`Availability check for package ${packageId} is not implemented.`);
    // Add real logic here, e.g., query DB for conflicting bookings or inventory
    return true; // Assuming available for now
}