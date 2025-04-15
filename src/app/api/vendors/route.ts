// Path: src/app/api/vendors/route.ts
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database'; // Import the function to get DB instance

// --- FIX: Remove Edge Runtime ---
// export const runtime = 'edge'; // Remove this line to allow database access

// --- FIX: Define the ServiceProvider interface (align with your schema) ---
interface ServiceProvider {
  id: number;
  user_id: number;
  business_name: string;
  type: string; // e.g., 'hotel', 'tour_operator', 'activity_provider'
  license_no: string | null;
  address: string | null;
  verified: number; // 0 or 1
  verification_documents: string | null; // Likely stores paths or identifiers
  bank_details: string | null; // Sensitive - consider how/if this is exposed
  created_at: string;
  updated_at: string;
  // Optional: Add fields from users table if joining (e.g., email, phone)
  // email?: string;
  // phone?: string;
}

// Define a simpler Vendor type for API response, excluding sensitive fields
interface VendorApiResponseData {
    id: number;
    business_name: string;
    type: string;
    address: string | null;
    // Add other fields you want to expose publicly
    // Maybe average rating, number of services, etc., if calculated
}
// --- End of FIX ---


// --- FIX: Implement GET handler ---
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase(); // Get the database instance
    const { searchParams } = new URL(request.url);

    // --- Optional Filtering ---
    const typeFilter = searchParams.get('type'); // e.g., filter by 'hotel'

    // Example: Pagination (implement if needed)
    // const limitParam = searchParams.get('limit') || '10';
    // const pageParam = searchParams.get('page') || '1';
    // const limit = parseInt(limitParam);
    // const offset = (parseInt(pageParam) - 1) * limit;
    // --- End Optional Filtering ---

    // Base query fetches verified providers
    let queryString = `
      SELECT
        id, user_id, business_name, type, address, verified, created_at, updated_at
        -- Select only necessary fields, exclude sensitive ones like bank_details, verification_documents, license_no unless needed
      FROM service_providers
      WHERE verified = 1 -- Fetch only verified vendors
    `;
    const queryParams: (string | number)[] = [];
    let paramIndex = 1; // Start after the hardcoded 'verified = 1'

    if (typeFilter) {
        queryString += ` AND type = ?${paramIndex}`;
        queryParams.push(typeFilter);
        paramIndex++;
    }

    queryString += ' ORDER BY business_name ASC'; // Order alphabetically

    // Add pagination to query if implemented
    // queryString += ' LIMIT ? OFFSET ?';
    // queryParams.push(limit, offset);

    // Fetch verified providers from the database
    const stmt = db.prepare(queryString).bind(...queryParams);
    // Fetch the full ServiceProvider data first
    const { results, success, error } = await stmt.all<ServiceProvider>();

    if (!success) {
        console.error('Failed to fetch vendors from D1:', error);
        throw new Error('Database query failed');
    }

    // Ensure results is an array, even if empty
    const providersData = results || [];

    // --- FIX: Map to the simplified public Vendor type ---
    const vendorsApiResponse: VendorApiResponseData[] = providersData.map(provider => ({
        id: provider.id,
        business_name: provider.business_name,
        type: provider.type,
        address: provider.address,
        // Add any other publicly safe fields here
    }));
    // --- End of FIX ---


    return NextResponse.json({
      success: true,
      message: 'Vendors retrieved successfully',
      data: vendorsApiResponse // Return the mapped array
    });

  } catch (err) {
    console.error('Error fetching vendors:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve vendors',
        error: errorMessage,
        data: [] // Return empty array on error
      },
      { status: 500 }
    );
  }
}
// --- End of FIX ---


// --- FIX: Update POST placeholder (Vendor Registration) ---
// This route is likely NOT for registration. Registration should happen via a specific
// vendor registration endpoint (e.g., /api/vendor/register) which might create
// both a user and a service_provider entry. Keep this POST as not implemented.
export async function POST(request: NextRequest) {
  console.warn("POST /api/vendors is likely not the correct endpoint for vendor registration. Use a dedicated registration route.");
  return NextResponse.json({
      success: false,
      message: 'POST method not supported on this endpoint. Use vendor registration route.',
      data: null
  }, { status: 405 }); // Method Not Allowed
}
// --- End of FIX ---