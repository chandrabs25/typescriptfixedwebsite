export const dynamic = 'force-dynamic'// Path: src/app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database'; // Import the function to get DB instance
import { verifyAuth } from '@/lib/auth'; // Import verifyAuth to check login status

// --- FIX: Remove Edge Runtime ---
// export const runtime = 'edge'; // Remove this line to allow database access & auth logic

// --- FIX: Define the Booking DB structure (consistent with migration 0003) ---
interface BookingDbRecord {
  id: number;
  user_id: number | null; // Nullable
  package_id: number | null;
  total_people: number;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  payment_status: string;
  payment_details: string | null;
  special_requests: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  created_at: string;
  updated_at: string;
  // Optional: Join related data if needed (e.g., package name)
  // package_name?: string;
}
// --- End of FIX ---


// --- FIX: Implement GET handler for specific Booking ID with Auth Check ---
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // Destructure 'id' from params
) {
  try {
    // 1. Authenticate the request
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to view booking details.' },
        { status: 401 }
      );
    }
    const authenticatedUserId = parseInt(authResult.user.id as string, 10); // Assuming numeric ID

    // 2. Validate Booking ID from URL
    const bookingId = params.id;
    const idAsNumber = parseInt(bookingId, 10);
    if (isNaN(idAsNumber)) {
        return NextResponse.json(
            { success: false, message: 'Invalid booking ID format. Must be a number.' },
            { status: 400 } // Bad Request
        );
    }

    // 3. Fetch the booking from the database
    const db = getDatabase();
    // Optional: Join package name
    // const query = `
    //     SELECT b.*, p.name as package_name
    //     FROM bookings b
    //     LEFT JOIN packages p ON b.package_id = p.id
    //     WHERE b.id = ?
    // `;
    const query = 'SELECT * FROM bookings WHERE id = ?';
    const booking = await db.prepare(query)
      .bind(idAsNumber)
      .first<BookingDbRecord>(); // Specify the expected row type


    // 4. Check if booking exists
    if (!booking) {
      return NextResponse.json(
        { success: false, message: `Booking with ID ${idAsNumber} not found.` },
        { status: 404 }
      );
    }

    // 5. Authorize: Check if the authenticated user owns this booking
    // TODO: Add logic here if Admins should also be allowed access
    if (booking.user_id !== authenticatedUserId) {
        console.warn(`User ${authenticatedUserId} attempted to access booking ${idAsNumber} owned by user ${booking.user_id}`);
        return NextResponse.json(
            { success: false, message: 'You do not have permission to view this booking.' },
            { status: 403 } // Forbidden
        );
    }

    // 6. Return booking data (exclude sensitive guest data if necessary, though owner should see it)
    return NextResponse.json({
      success: true,
      message: `Booking details for ID: ${idAsNumber}`,
      data: booking
    });

  } catch (err) {
    console.error(`Error fetching booking with ID ${params.id}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve booking details',
        error: errorMessage,
        data: null
      },
      { status: 500 }
    );
  }
}
// --- End of FIX ---


// --- FIX: Update PUT/DELETE placeholders ---
// PUT should likely only allow updating certain fields (e.g., status by admin/vendor, special requests by user)
// and requires similar auth/authorization checks.
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
   // Placeholder - Needs implementation for updating a booking
   // Requires authentication/authorization (User owner, Vendor, Admin depending on field)
  console.warn(`PUT /api/bookings/${params.id} is not fully implemented.`);
  return NextResponse.json({
      success: false,
      message: `PUT method for booking ID ${params.id} not implemented yet.`,
      data: null
  }, { status: 501 }); // Not Implemented
}

// DELETE should likely be a soft delete (cancel status) and requires auth/authz
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
   // Placeholder - Needs implementation for cancelling a booking
   // Requires authentication/authorization (User owner, Admin)
  console.warn(`DELETE /api/bookings/${params.id} is not fully implemented.`);
  return NextResponse.json({
      success: false,
      message: `DELETE method for booking ID ${params.id} not implemented yet.`
  }, { status: 501 }); // Not Implemented
}
// --- End of FIX ---