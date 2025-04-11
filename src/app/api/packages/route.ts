// Path: src/app/api/packages/route.ts
const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database'; // Use the correct function

// --- FIX: Remove Edge Runtime (if it was added back) ---
// export const runtime = 'edge'; // Ensure this is removed for DB access

// --- FIX: Define interfaces (consistent structure) ---
interface Package {
  id: number;
  name: string;
  description: string | null;
  duration: string;
  base_price: number;
  max_people: number | null;
  created_by: number;
  is_active: number; // 0 or 1
  itinerary: string | null;
  included_services: string | null;
  images: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

interface GetPackagesResponse {
    packages: Package[];
    pagination: PaginationInfo;
}

interface ApiError {
    message: string;
    error?: string; // Optional detailed error message
}
// --- End of FIX ---


// --- FIX: Enhanced GET handler ---
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const searchParams = request.nextUrl.searchParams;

    // --- Pagination ---
    const pageParam = searchParams.get('page') || '1';
    const limitParam = searchParams.get('limit') || '9'; // Default to 9 for grid layout?
    const page = parseInt(pageParam, 10);
    const limit = parseInt(limitParam, 10);

    if (isNaN(page) || page < 1) {
        return NextResponse.json({ success: false, message: 'Invalid page parameter.' }, { status: 400 });
    }
    if (isNaN(limit) || limit < 1) {
        return NextResponse.json({ success: false, message: 'Invalid limit parameter.' }, { status: 400 });
    }
    const offset = (page - 1) * limit;

    // --- Filtering (Examples) ---
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const durationParam = searchParams.get('duration'); // e.g., "4 days / 3 nights"
    const maxPeopleParam = searchParams.get('maxPeople');

    let conditions: string[] = ['is_active = 1']; // Base condition: only active packages
    let queryParams: (string | number)[] = [];
    let paramIndex = 1; // Start parameter index for binding

    // Add filters to conditions and params
    if (minPriceParam) {
        const minPrice = parseFloat(minPriceParam);
        if (!isNaN(minPrice)) {
            conditions.push(`base_price >= ?${paramIndex}`);
            queryParams.push(minPrice);
            paramIndex++;
        }
    }
    if (maxPriceParam) {
        const maxPrice = parseFloat(maxPriceParam);
        if (!isNaN(maxPrice)) {
            conditions.push(`base_price <= ?${paramIndex}`);
            queryParams.push(maxPrice);
            paramIndex++;
        }
    }
    if (durationParam) {
        conditions.push(`duration = ?${paramIndex}`);
        queryParams.push(durationParam);
        paramIndex++;
    }
    if (maxPeopleParam) {
        const maxPeople = parseInt(maxPeopleParam, 10);
         if (!isNaN(maxPeople)) {
            // Assumes filtering packages suitable FOR AT LEAST this many people
            conditions.push(`(max_people IS NULL OR max_people >= ?${paramIndex})`);
            queryParams.push(maxPeople);
            paramIndex++;
        }
    }
    // Note: Filtering by island isn't directly possible with the current schema
    // as packages don't have an island_id. You'd need to adjust the schema
    // or infer based on included services/itinerary text search if required.

    // --- Build Queries ---
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const packagesQuery = `SELECT * FROM packages ${whereClause} ORDER BY created_at DESC LIMIT ?${paramIndex} OFFSET ?${paramIndex + 1}`;
    const countQuery = `SELECT COUNT(*) as total FROM packages ${whereClause}`;

    // Bind parameters for packages query (filters + pagination)
    const packagesParams = [...queryParams, limit, offset];
    // Bind parameters for count query (only filters)
    const countParams = [...queryParams];


    // --- Execute Queries ---
    // Fetch total count first
    const countStmt = db.prepare(countQuery).bind(...countParams);
    const countResult = await countStmt.first<{ total: number }>();
    const total = countResult?.total ?? 0; // Default to 0 if null/undefined

    // Fetch packages for the current page
    const packagesStmt = db.prepare(packagesQuery).bind(...packagesParams);
    const packagesResult = await packagesStmt.all<Package>();

    if (!packagesResult.success) { // Check D1 result success flag
        console.error('Failed to fetch packages from D1:', packagesResult.error);
        throw new Error('Database query failed to fetch packages.');
    }

    const packagesData = packagesResult.results || [];
    const totalPages = Math.ceil(total / limit);

    // --- Format Response ---
    const responseData: GetPackagesResponse = {
        packages: packagesData,
        pagination: {
            totalItems: total,
            currentPage: page,
            pageSize: limit,
            totalPages: totalPages
        }
    };

    return NextResponse.json({
      success: true,
      message: 'Packages retrieved successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching packages:', error);
    const apiError: ApiError = {
        message: 'Failed to retrieve packages',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
    return NextResponse.json({
      success: false,
      ...apiError,
      data: null // Ensure data is null on error
    }, { status: 500 });
  }
}
// --- End of FIX ---


// POST handler remains the same as before (assuming it was correct or placeholder)
// Define the expected structure for the POST request body
interface CreatePackagePayload {
  name: string;
  description?: string | null;
  duration: string;
  base_price: number;
  max_people?: number | null;
  itinerary?: string | null; // Adjust type if it's structured JSON (e.g., object[] or string)
  included_services?: string | null; // Adjust type if structured
  images?: string | null; // Adjust type if array (e.g., string[])
}

export async function POST(request: NextRequest) {
  try {
    // --- Get DB Instance ---
    const db = getDatabase();
    // --- End Get DB Instance ---

    // Check authentication and authorization (admin or vendor only)
    // TODO: Implement actual auth check using your middleware/library
    // const authCheck = await requireAuth(request, [ADMIN_ROLE_ID, VENDOR_ROLE_ID]);
    // if (authCheck) return authCheck; // Return 401 or 403 response
    // const { user } = await verifyAuth(request); // Get user details if needed for created_by

    const body = await request.json() as CreatePackagePayload;
    const {
        name,
        description,
        duration,
        base_price,
        max_people,
        itinerary,
        included_services,
        images
    } = body;

    // Validation
    if (!name || !duration || base_price === undefined || base_price === null) {
      return NextResponse.json({
        success: false, message: 'Name, duration, and base price are required fields.', data: null
      }, { status: 400 });
    }
     if (typeof base_price !== 'number' || base_price <= 0) {
         return NextResponse.json({ success: false, message: 'Base price must be a positive number.' }, { status: 400 });
     }
     if (max_people !== undefined && max_people !== null && (typeof max_people !== 'number' || max_people <= 0)) {
        return NextResponse.json({ success: false, message: 'Max people must be a positive number if provided.' }, { status: 400 });
    }

    // In a real implementation, created_by would come from the authenticated user
    const created_by = 1; // Placeholder: Replace with actual authenticated user ID (e.g., user.id)

    const result = await db
      .prepare(`
        INSERT INTO packages (
          name, description, duration, base_price, max_people,
          created_by, itinerary, included_services, images, is_active,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `) // Using CURRENT_TIMESTAMP for D1
      .bind(
        name,
        description ?? null,
        duration,
        base_price,
        max_people ?? null,
        created_by, // Replace with authenticated user ID
        // Ensure complex fields are stringified if stored as TEXT but managed as JSON
        typeof itinerary === 'object' ? JSON.stringify(itinerary) : itinerary ?? null,
        typeof included_services === 'object' ? JSON.stringify(included_services) : included_services ?? null,
        typeof images === 'object' ? JSON.stringify(images) : images ?? null,
        1 // is_active = true by default
      )
      .run();

    if (!result.success || !result.meta?.last_row_id) { // Check success and ID
      console.error("Package insert failed, D1 result:", result);
      throw new Error('Database operation failed to create package or return ID.');
    }

    return NextResponse.json({
      success: true,
      message: 'Package created successfully',
      data: { id: result.meta.last_row_id }
    }, { status: 201 }); // 201 Created status code

  } catch (error) {
    console.error('Error creating package:', error);
    const apiError: ApiError = {
        message: 'Error creating package',
        error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
    // Check for specific DB errors if possible (e.g., unique constraint)
    // if (apiError.error?.includes('UNIQUE constraint failed')) {
    //   return NextResponse.json({ success: false, message: 'A package with this name might already exist.', error: apiError.error }, { status: 409 }); // Conflict
    // }
    return NextResponse.json({
      success: false,
      ...apiError,
      data: null
    }, { status: 500 });
  }
}