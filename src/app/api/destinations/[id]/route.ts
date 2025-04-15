// Path: src/app/api/destinations/[id]/route.ts
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database'; // Import the function to get DB instance

// --- FIX: Remove Edge Runtime ---
// export const runtime = 'edge'; // Remove this line to allow database access

// --- FIX: Define the Island interface (ensure this matches the one in ../route.ts or a shared types file) ---
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

// --- FIX: Implement GET handler for specific ID ---
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // Destructure 'id' from params
) {
  try {
    const db = getDatabase(); // Get the database instance
    const destinationId = params.id;

    // --- Validate ID ---
    // D1 expects numbers for integer primary keys. Ensure conversion.
    const idAsNumber = parseInt(destinationId, 10);
    if (isNaN(idAsNumber)) {
        return NextResponse.json(
            { success: false, message: 'Invalid destination ID format. Must be a number.' },
            { status: 400 } // Bad Request
        );
    }
    // --- End Validation ---


    // Fetch the specific island from the database using the ID
    const island = await db.prepare(
        'SELECT * FROM islands WHERE id = ?'
      )
      .bind(idAsNumber) // Use the numeric ID
      .first<Island>(); // Specify the expected row type


    if (!island) {
      // If no island is found with that ID, return 404 Not Found
      return NextResponse.json(
        { success: false, message: `Destination with ID ${idAsNumber} not found.` },
        { status: 404 }
      );
    }

    // Island found, return its data
    return NextResponse.json({
      success: true,
      message: `Destination details for ID: ${idAsNumber}`,
      data: island // Return the single island object
    });

  } catch (err) {
    console.error(`Error fetching destination with ID ${params.id}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve destination details',
        error: errorMessage,
        data: null
      },
      { status: 500 }
    );
  }
}
// --- End of FIX ---


// --- FIX: Update PUT/DELETE placeholders (or remove if not needed) ---
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
   // Placeholder - Needs implementation for updating a destination
   // Remember authentication/authorization
  console.warn(`PUT /api/destinations/${params.id} is not fully implemented.`);
  return NextResponse.json({
      success: false,
      message: `PUT method for destination ID ${params.id} not implemented yet.`,
      data: null
  }, { status: 501 }); // Not Implemented
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
   // Placeholder - Needs implementation for deleting a destination
   // Remember authentication/authorization
  console.warn(`DELETE /api/destinations/${params.id} is not fully implemented.`);
  return NextResponse.json({
      success: false,
      message: `DELETE method for destination ID ${params.id} not implemented yet.`
  }, { status: 501 }); // Not Implemented
}
// --- End of FIX ---