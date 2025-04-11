// Path: .\src\app\api\availability\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// Removed runtime = 'edge'

// --- Define Interfaces ---
interface Package {
  id: number;
  base_price: number;
  max_people: number | null;
}
interface ExistingBooking {
  id: number;
  start_date: string; // Stored as DATE in DB
  end_date: string;   // Stored as DATE in DB
}
interface PricingInfo {
  basePrice: number;
  taxes: number; // Placeholder tax calculation
  totalAmount: number;
}
interface AvailabilityResponse {
  available: boolean;
  message: string;
  packageId?: string;
  startDate?: string;
  endDate?: string;
  guests?: number;
  pricing?: PricingInfo;
  error?: string; // Add error field for detailed issues
}
// --- End Interfaces ---

export async function GET(request: NextRequest) {
  const db = getDatabase();

  try {
    // --- Get and Validate Query Parameters ---
    const searchParams = request.nextUrl.searchParams;
    const packageIdStr = searchParams.get('packageId');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const guestsStr = searchParams.get('guests');

    if (!packageIdStr || !startDateStr || !endDateStr || !guestsStr) {
      return NextResponse.json(
        { available: false, message: 'Missing required parameters: packageId, startDate, endDate, guests' },
        { status: 400 }
      );
    }

    const packageId = parseInt(packageIdStr, 10);
    const guests = parseInt(guestsStr, 10);

    if (isNaN(packageId) || packageId <= 0 || isNaN(guests) || guests <= 0) {
      return NextResponse.json(
        { available: false, message: 'Invalid packageId or guests parameter. Must be positive numbers.' },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
        return NextResponse.json(
            { available: false, message: 'Invalid date format. Use YYYY-MM-DD.' },
            { status: 400 }
        );
    }

    const reqStartDate = new Date(startDateStr + 'T00:00:00Z'); // Add time and UTC marker for comparison
    const reqEndDate = new Date(endDateStr + 'T00:00:00Z');   // Add time and UTC marker

    // Ensure dates are valid after parsing
    if (isNaN(reqStartDate.getTime()) || isNaN(reqEndDate.getTime())) {
        return NextResponse.json(
            { available: false, message: 'Invalid date value(s).' },
            { status: 400 }
        );
    }

    // Basic date order check (using parsed dates)
    if (reqStartDate >= reqEndDate) {
        return NextResponse.json(
            { available: false, message: 'End date must be strictly after start date.' },
            { status: 400 }
        );
    }
    // --- End Parameter Validation ---


    // --- Check 1: Package Capacity ---
    const packageInfo = await db.prepare('SELECT id, base_price, max_people FROM packages WHERE id = ? AND is_active = 1')
                            .bind(packageId)
                            .first<Package>();

    if (!packageInfo) {
        return NextResponse.json(
            { available: false, message: `Package with ID ${packageId} not found or is inactive.` },
            { status: 404 } // Not Found
        );
    }

    if (packageInfo.max_people !== null && guests > packageInfo.max_people) {
        return NextResponse.json(
            { available: false, message: `Maximum ${packageInfo.max_people} guests allowed for this package.` },
            { status: 200 } // Still OK, just unavailable
        );
    }
    // --- End Capacity Check ---


    // --- Check 2: Date Overlap ---
    // Find bookings for this package that overlap with the requested date range.
    // Overlap condition: existing_start_date < requested_end_date AND existing_end_date > requested_start_date
    // This avoids issues with bookings ending on the day the new one starts, or vice-versa.
    const overlappingBookings = await db.prepare(`
      SELECT id FROM bookings
      WHERE package_id = ?
        AND status IN ('pending', 'confirmed')
        AND start_date < ?
        AND end_date > ?
    `)
    .bind(packageId, endDateStr, startDateStr) // Use original strings here as DB stores them as DATE/TEXT
    .all<{id: number}>(); // Only need ID to check for existence

    if (!overlappingBookings.success) {
        console.error("Failed to query overlapping bookings:", overlappingBookings.error);
        throw new Error("Database error checking booking conflicts.");
    }

    if (overlappingBookings.results && overlappingBookings.results.length > 0) {
        console.log(`Availability check failed for package ${packageId} (${startDateStr} to ${endDateStr}): Overlapping bookings found.`);
        return NextResponse.json(
            { available: false, message: 'This package is already booked for the selected dates or part of the range.' },
            { status: 200 } // OK, but unavailable
      );
    }
    // --- End Date Overlap Check ---


    // --- If checks pass, it's available ---
    const basePrice = packageInfo.base_price * guests;
    const taxes = basePrice * 0.18; // Example: 18% tax placeholder
    const totalAmount = basePrice + taxes;

    const responseData: AvailabilityResponse = {
      available: true,
      message: 'The selected package is available for booking.',
      packageId: packageIdStr,
      startDate: startDateStr,
      endDate: endDateStr,
      guests: guests,
      pricing: {
        basePrice: parseFloat(basePrice.toFixed(2)),
        taxes: parseFloat(taxes.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Error checking availability:', error);
    const response: AvailabilityResponse = {
        available: false,
        message: 'Failed to check availability due to an internal server error.',
        error: error instanceof Error ? error.message : 'Unknown error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}