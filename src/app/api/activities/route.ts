// Path: src/app/api/activities/route.ts

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database'; // Import the function to get DB instance

// --- FIX: Remove Edge Runtime ---
// export const runtime = 'edge'; // Remove this line to allow database access

// --- FIX: Define the Activity interface (based on services+island join) ---
interface Activity {
  id: number; // service id
  name: string; // service name
  description: string | null;
  type: string; // Should be 'activity' or similar
  provider_id: number;
  island_id: number;
  price: string; // Keep as string to match schema, parse on frontend if needed
  availability: string | null;
  images: string | null; // Consider JSON parsing if stored as JSON string
  amenities: string | null;
  cancellation_policy: string | null;
  island_name: string; // Joined from islands table
  // Add other relevant fields if needed
}
// --- End of FIX ---

// --- FIX: Implement GET handler ---
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase(); // Get the database instance
    const { searchParams } = new URL(request.url);

    // --- Optional Filtering ---
    // Example: Allow filtering by island_id
    const islandIdParam = searchParams.get('islandId');
    const islandId = islandIdParam ? parseInt(islandIdParam, 10) : null;

    // Example: Allow filtering by provider_id
    const providerIdParam = searchParams.get('providerId');
    const providerId = providerIdParam ? parseInt(providerIdParam, 10) : null;

    // Example: Pagination (implement if needed)
    // const limitParam = searchParams.get('limit') || '10';
    // const pageParam = searchParams.get('page') || '1';
    // const limit = parseInt(limitParam);
    // const offset = (parseInt(pageParam) - 1) * limit;
    // --- End Optional Filtering ---

    // Build the query dynamically based on filters
    let queryString = `
      SELECT
        s.id, s.name, s.description, s.type, s.provider_id, s.island_id,
        s.price, s.availability, s.images, s.amenities, s.cancellation_policy,
        i.name as island_name
      FROM services s
      JOIN islands i ON s.island_id = i.id
      WHERE s.type LIKE ? -- Filter by type 'activity' (adjust '%activity%' if needed)
    `;
    const queryParams: (string | number)[] = ['%activity%']; // Use LIKE for flexibility, or = 'activity' for exact match

    if (islandId && !isNaN(islandId)) {
      queryString += ' AND s.island_id = ?';
      queryParams.push(islandId);
    }

    if (providerId && !isNaN(providerId)) {
        queryString += ' AND s.provider_id = ?';
        queryParams.push(providerId);
    }

    queryString += ' ORDER BY s.name ASC'; // Add ordering

    // Add pagination to query if implemented
    // queryString += ' LIMIT ? OFFSET ?';
    // queryParams.push(limit, offset);

    // Fetch activities (services of type 'activity') from the database
    const stmt = db.prepare(queryString).bind(...queryParams);
    const { results, success, error } = await stmt.all<Activity>(); // Specify the expected row type

    if (!success) {
        console.error('Failed to fetch activities from D1:', error);
        throw new Error('Database query failed');
    }

    // Ensure results is an array, even if empty
    const activitiesData = results || [];

    // Optionally parse JSON fields if needed before sending
    // activitiesData.forEach(activity => { /* ... parsing logic ... */ });

    return NextResponse.json({
      success: true,
      message: 'Activities retrieved successfully',
      data: activitiesData // Return the array of activities
    });

  } catch (err) {
    console.error('Error fetching activities:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve activities',
        error: errorMessage,
        data: [] // Return empty array on error
      },
      { status: 500 }
    );
  }
}
// --- End of FIX ---


// --- FIX: Update POST placeholder (if needed for creating activities/services) ---
// Keep POST as a placeholder for now, or implement if you need to create activities via API
export async function POST(request: NextRequest) {
  // Placeholder implementation - Needs logic to create a service in the DB
  // Remember to add authentication/authorization checks here (e.g., only vendors)
  console.warn("POST /api/activities is not fully implemented.");
   try {
      // const body = await request.json();
      // Validate body, check user role (must be vendor/admin)
      // const db = getDatabase();
      // const result = await db.prepare("INSERT INTO services (...) VALUES (...)").bind(...).run();
      // if (!result.success) throw new Error("Failed to create activity/service");

       return NextResponse.json({
           success: false, // Set to false as it's not implemented
           message: 'POST method for activities not implemented yet.',
           data: null
       }, { status: 501 }); // 501 Not Implemented

   } catch (error) {
       console.error("Error in POST /api/activities:", error);
       const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
       return NextResponse.json({ success: false, message: "Failed to process request", error: errorMessage }, { status: 500 });
   }
}
// --- End of FIX ---