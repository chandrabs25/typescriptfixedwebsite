// Path: src/app/api/packages/[id]/route.ts
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database'; // Import the function to get DB instance

// --- FIX: Remove Edge Runtime if present (Database access requires Node.js runtime) ---
// export const runtime = 'edge'; // Remove or comment out this line

// --- FIX: Define the Package interface (align with your DB schema) ---
interface Package {
  id: number;
  name: string;
  description: string | null;
  duration: string;
  base_price: number; // Should be REAL in DB, maps to number
  max_people: number | null; // INTEGER
  created_by: number; // INTEGER, Foreign Key to users(id)
  is_active: number; // Assuming 0 or 1 from SQLite BOOLEAN
  itinerary: string | null; // TEXT, consider JSON parsing if stored as JSON
  included_services: string | null; // TEXT, consider JSON parsing
  images: string | null; // TEXT, consider JSON parsing
  created_at: string; // DATETIME string
  updated_at: string; // DATETIME string
}
// --- End of FIX ---


// --- FIX: Implement GET handler for specific Package ID ---
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // Destructure 'id' from params
) {
  try {
    const db = getDatabase(); // Get the database instance
    const packageId = params.id;

    // --- Validate ID ---
    const idAsNumber = parseInt(packageId, 10);
    if (isNaN(idAsNumber)) {
        return NextResponse.json(
            { success: false, message: 'Invalid package ID format. Must be a number.' },
            { status: 400 } // Bad Request
        );
    }
    // --- End Validation ---

    // Fetch the specific package from the database using the ID
    // Fetch only active packages unless specifically needed otherwise
    const pkg = await db.prepare(
        'SELECT * FROM packages WHERE id = ? AND is_active = 1' // Fetch active package by ID
      )
      .bind(idAsNumber) // Use the numeric ID
      .first<Package>(); // Specify the expected row type


    if (!pkg) {
      // If no active package is found with that ID, return 404 Not Found
      return NextResponse.json(
        { success: false, message: `Active package with ID ${idAsNumber} not found.` },
        { status: 404 }
      );
    }

    // Package found, return its data
    // Optionally parse JSON fields (itinerary, included_services, images) here if needed
    // try {
    //     if (pkg.itinerary) pkg.itinerary = JSON.parse(pkg.itinerary);
    //     // ... parse others
    // } catch (parseError) {
    //     console.error(`Failed to parse JSON fields for package ${idAsNumber}:`, parseError);
    //     // Decide how to handle: return error, return unparsed, return with warning?
    // }

    return NextResponse.json({
      success: true,
      message: `Package details for ID: ${idAsNumber}`,
      data: pkg // Return the single package object
    });

  } catch (err) {
    console.error(`Error fetching package with ID ${params.id}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve package details',
        error: errorMessage,
        data: null
      },
      { status: 500 }
    );
  }
}
// --- End of FIX ---


// --- FIX: Update PUT/DELETE placeholders ---
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
   // Placeholder - Needs implementation for updating a package
   // Requires authentication/authorization (Admin or Vendor owner)
  console.warn(`PUT /api/packages/${params.id} is not fully implemented.`);
  return NextResponse.json({
      success: false,
      message: `PUT method for package ID ${params.id} not implemented yet.`,
      data: null
  }, { status: 501 }); // Not Implemented
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
   // Placeholder - Needs implementation for deleting (or deactivating) a package
   // Requires authentication/authorization (Admin or Vendor owner)
   // Consider soft delete (setting is_active = 0) instead of hard delete
  console.warn(`DELETE /api/packages/${params.id} is not fully implemented.`);
  return NextResponse.json({
      success: false,
      message: `DELETE method for package ID ${params.id} not implemented yet.`
  }, { status: 501 }); // Not Implemented
}
// --- End of FIX ---