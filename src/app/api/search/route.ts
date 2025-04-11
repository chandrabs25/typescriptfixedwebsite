// src/app/api/search/route.ts
const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// Removed runtime = 'edge' to allow proper D1 database access

// --- Define Interfaces for DB Results and Search Results ---
interface Island {
  id: number;
  name: string;
  description?: string | null;
  // Add other island fields if needed
}

interface Package {
  id: number;
  name: string;
  description?: string | null;
  base_price: number;
  duration: string;
  is_active: number;
  // Add other package fields if needed
}

interface Service {
  id: number;
  name: string;
  description?: string | null;
  island_id: number;
  island_name: string; // From JOIN
  // Add other service fields if needed
}

type SearchResultItem = Island | Package | Service;

interface SearchResultGroup {
  type: 'destinations' | 'packages' | 'services';
  items: SearchResultItem[];
}

// --- Define Interface for POST Request Body ---
interface SearchPayload {
    query: string;
    type?: 'all' | 'destinations' | 'packages' | 'services';
}

// --- GET Handler ---
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim(); // Trim whitespace
    const type = searchParams.get('type') || 'all';

    if (!query) {
      return NextResponse.json({
        success: false,
        message: 'Search query (q parameter) is required',
        data: []
      }, { status: 400 });
    }

    // Adjust DB initialization if needed for standard Node runtime
    const db = getDatabase();

    const results: SearchResultGroup[] = [];
    const searchQuery = `%${query}%`; // Prepare search term once

    // Search destinations/islands
    if (type === 'all' || type === 'destinations') {
      const destinationsResult = await db
        .prepare('SELECT id, name, description FROM islands WHERE name LIKE ?1 OR description LIKE ?1') // Use named or indexed parameters
        .bind(searchQuery)
        .all<Island>(); // Specify expected row type

      if (destinationsResult.results && destinationsResult.results.length > 0) {
        results.push({
          type: 'destinations',
          items: destinationsResult.results
        });
      }
    }

    // Search packages
    if (type === 'all' || type === 'packages') {
       // Corrected SQL: AND should apply to the WHERE clause, not OR
      const packagesResult = await db
        .prepare('SELECT id, name, description, base_price, duration FROM packages WHERE (name LIKE ?1 OR description LIKE ?1) AND is_active = 1')
        .bind(searchQuery)
        .all<Package>(); // Specify expected row type (adjust selected fields as needed)

      if (packagesResult.results && packagesResult.results.length > 0) {
        results.push({
          type: 'packages',
          items: packagesResult.results
        });
      }
    }

    // Search services
    if (type === 'all' || type === 'services') {
      const servicesResult = await db
        .prepare('SELECT s.id, s.name, s.description, s.island_id, i.name as island_name FROM services s JOIN islands i ON s.island_id = i.id WHERE s.name LIKE ?1 OR s.description LIKE ?1')
        .bind(searchQuery)
        .all<Service>(); // Specify expected row type

      if (servicesResult.results && servicesResult.results.length > 0) {
        results.push({
          type: 'services',
          items: servicesResult.results
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Search results retrieved successfully',
      data: results
    });
  } catch (error) {
    console.error('Search error (GET):', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({
      success: false,
      message: 'Error performing search',
      error: errorMessage,
      data: []
    }, { status: 500 });
  }
}

// --- POST Handler ---
export async function POST(request: NextRequest) {
  try {
    // --- FIX: Assert the type of the JSON body ---
    const body = await request.json() as SearchPayload;
    const { query: rawQuery, type = 'all' } = body;
    // --- End of FIX ---

    const query = rawQuery?.trim(); // Trim whitespace

    if (!query) {
      return NextResponse.json({
        success: false,
        message: 'Search query is required in the request body',
        data: []
      }, { status: 400 });
    }

    // Adjust DB initialization if needed
    const db = getDatabase();

    const results: SearchResultGroup[] = [];
    const searchQuery = `%${query}%`; // Prepare search term once

    // Search destinations/islands
    if (type === 'all' || type === 'destinations') {
        const destinationsResult = await db
          .prepare('SELECT id, name, description FROM islands WHERE name LIKE ?1 OR description LIKE ?1')
          .bind(searchQuery)
          .all<Island>();

        if (destinationsResult.results && destinationsResult.results.length > 0) {
          results.push({ type: 'destinations', items: destinationsResult.results });
        }
      }

      // Search packages
      if (type === 'all' || type === 'packages') {
        const packagesResult = await db
          .prepare('SELECT id, name, description, base_price, duration FROM packages WHERE (name LIKE ?1 OR description LIKE ?1) AND is_active = 1')
          .bind(searchQuery)
          .all<Package>();

        if (packagesResult.results && packagesResult.results.length > 0) {
          results.push({ type: 'packages', items: packagesResult.results });
        }
      }

      // Search services
      if (type === 'all' || type === 'services') {
        const servicesResult = await db
          .prepare('SELECT s.id, s.name, s.description, s.island_id, i.name as island_name FROM services s JOIN islands i ON s.island_id = i.id WHERE s.name LIKE ?1 OR s.description LIKE ?1')
          .bind(searchQuery)
          .all<Service>();

        if (servicesResult.results && servicesResult.results.length > 0) {
          results.push({ type: 'services', items: servicesResult.results });
        }
      }

    return NextResponse.json({
      success: true,
      message: 'Search results retrieved successfully',
      data: results
    });
  } catch (error) {
    console.error('Search error (POST):', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({
      success: false,
      message: 'Error performing search',
      error: errorMessage,
      data: []
    }, { status: 500 });
  }
}