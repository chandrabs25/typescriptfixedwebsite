// Path: .\src\app\api\auth\register\route.ts
import { NextRequest, NextResponse } from 'next/server';
// --- FIX: Import getDatabase ---
import { getDatabase } from '@/lib/database';
// --- End of FIX ---
import * as jose from 'jose'; // Keep if needed for auto-login, though not used directly here
import * as bcrypt from 'bcryptjs';
// Removed runtime = 'edge' to allow Node.js dependencies

// Define an interface for the expected request body
interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  phone?: string; // phone is optional
}

// --- FIX: Define User type (can be moved to a types file) ---
interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    phone?: string | null;
    role_id: number;
    // Add other fields like profile_image, created_at, updated_at if needed
}
// --- End of FIX ---


// Register a new user
export async function POST(request: NextRequest) {
  try {
    // --- FIX: Get database instance ---
    const db = getDatabase();
    // --- End of FIX ---

    // Parse request body with type assertion
    const body = await request.json() as RegisterRequestBody;
    const { name, email, password, phone } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
     if (password.length < 6) { // Example: Basic password length validation
        return NextResponse.json(
            { success: false, message: 'Password must be at least 6 characters long' },
            { status: 400 }
        );
     }
     // Example: Basic email format validation (more robust validation might be needed)
     if (!/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json(
            { success: false, message: 'Invalid email format' },
            { status: 400 }
        );
     }


    // Split name into first_name and last_name (simple split)
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''; // Handle cases with only first name

    // Check if user already exists using D1 syntax
    const existingUser = await db // Use obtained db instance
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first<{ id: number }>(); // Check if any user with that email exists

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 } // Use 409 Conflict status code
      );
    }

    // Hash password using bcrypt (Node.js compatible)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get the role_id for 'user' (assuming it's 2 based on your migration)
    const userRoleId = 2; // Replace with actual ID if different (Role 1 is Admin, Role 3 is Vendor)

    // Insert user into database using D1 syntax and correct schema fields
    const result = await db // Use obtained db instance
      .prepare(`
        INSERT INTO users (first_name, last_name, email, password_hash, phone, role_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
      .bind(
        firstName,      // Use firstName
        lastName,       // Use lastName
        email,
        hashedPassword, // Use the bcrypt hashed password
        phone || null,  // Use phone or null if undefined
        userRoleId      // Use the role_id
      )
      .run(); // Use run() for INSERT

    const lastRowId = result.meta?.last_row_id;

    if (!lastRowId) {
       console.error("User insert failed or D1 did not return last_row_id:", result);
       // Don't throw generic error, return specific feedback
        return NextResponse.json(
            { success: false, message: 'Database error occurred during registration.' },
            { status: 500 }
        );
    }

     // --- FIX: Optionally fetch the created user to return more data ---
     // This adds an extra query but provides better feedback/data for auto-login
     const createdUser = await db
       .prepare('SELECT id, email, first_name, last_name, role_id FROM users WHERE id = ?')
       .bind(lastRowId)
       .first<Omit<User, 'password_hash'>>(); // Fetch relevant fields, exclude hash

     if (!createdUser) {
         console.warn(`Could not fetch newly created user with ID: ${lastRowId}`);
     }
     // --- End of FIX ---


    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      // --- FIX: Return created user data (excluding password) ---
      data: createdUser || { id: lastRowId } // Return fetched user or just ID if fetch failed
      // --- End of FIX ---
    }, { status: 201 });

  } catch (error) {
    console.error('Error registering user:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // Check for specific database errors if possible (e.g., constraint violations)
    // Provide a more generic error message to the client for security
    return NextResponse.json(
      // --- FIX: Provide more structured error ---
      { success: false, message: 'An internal server error occurred during registration.', error: errorMessage },
       // --- End of FIX ---
      { status: 500 }
    );
  }
}