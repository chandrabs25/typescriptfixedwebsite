// Path: src/app/api/destinations/route.ts
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database'; // Import the function to get DB instance

// --- FIX: Remove Edge Runtime ---
// export const runtime = 'edge'; // Remove this line to allow database access

// --- FIX: Define the Island interface (align with your schema) ---
interface Island {
  id: number;
  name: string;
  description: string | null;
  permit_required: number; // Assuming 0 or 1 from SQLite BOOLEAN
  permit_details: string | null;
  coordinates: string | null;
  attractions: string | null; // Consider JSON parsing if stored as JSON string
  activities: string | null; // Consider JSON parsing if stored as JSON string
  images: string | null; // Consider JSON parsing if stored as JSON string
  created_at: string;
  updated_at: string;
}
// --- End of FIX ---

// --- FIX: Implement GET handler ---
export async function GET(request: NextRequest) {
   console.log("--- GET /api/destinations Request Started ---"); 
  try {
    const db = getDatabase(); // Get the database instance
    console.log("Database handle obtained.");
    // Fetch all islands from the database
    // Ensure your D1 schema has an 'islands' table with appropriate columns
    const { results, success, error } = await db.prepare(
        'SELECT * FROM islands ORDER BY name ASC' // Fetch all columns, order by name
      )
      .all<Island>(); // Specify the expected row type
     console.log(`Query success: ${success}, Error: ${error}`); // Add this
    console.log("Islands results:", JSON.stringify(results, null, 2));

    if (!success) {
        console.error('Failed to fetch islands from D1:', error);
        throw new Error('Database query failed');
    }

    // Ensure results is an array, even if empty
    const islandsData = results || [];

    return NextResponse.json({
      success: true,
      message: 'Destinations retrieved successfully',
      data: islandsData // Return the array of islands
    });

  } catch (err) {
    console.error('Error fetching destinations:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve destinations',
        error: errorMessage,
        data: [] // Return empty array on error
      },
      { status: 500 }
    );
  }
}
// --- End of FIX ---


// --- FIX: Update POST placeholder (or remove if not needed) ---
// Keep POST as a placeholder for now, or implement if you need to create destinations via API
export async function POST(request: NextRequest) {
  // Placeholder implementation - Needs logic to create a destination in the DB
  // Remember to add authentication/authorization checks here
  console.warn("POST /api/destinations is not fully implemented.");
  try {
      // const body = await request.json();
      // Basic validation
      // const db = getDatabase();
      // const result = await db.prepare("INSERT INTO islands (...) VALUES (...)").bind(...).run();
      // if (!result.success) throw new Error("Failed to create destination");

       return NextResponse.json({
           success: false, // Set to false as it's not implemented
           message: 'POST method for destinations not implemented yet.',
           data: null
       }, { status: 501 }); // 501 Not Implemented

  } catch (error) {
       console.error("Error in POST /api/destinations:", error);
       const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
       return NextResponse.json({ success: false, message: "Failed to process request", error: errorMessage }, { status: 500 });
  }
}
// --- End of FIX ---