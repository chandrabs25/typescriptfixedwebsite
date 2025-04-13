// Path: .\src\app\api\auth\login\route.ts
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
// --- FIX: Import getDatabase ---
import { getDatabase } from '@/lib/database';
// --- End of FIX ---
import * as jose from 'jose';
import * as bcrypt from 'bcryptjs';
// Removed runtime = 'edge' to allow Node.js dependencies
export const runtime = 'edge';
// Define an interface for expected request body
interface LoginRequestBody {
  email: string;
  password: string;
}

// Import auth utilities
import { getJwtSecret } from '@/lib/auth';

// Login with credentials
export async function POST(request: NextRequest) {
  console.log("--- POST /api/auth/login Request Started ---");
  try {
    // --- FIX: Get database instance ---
    const db = getDatabase();
    // --- End of FIX ---
    console.log("Login: DB handle obtained.");
    // Parse request body with type assertion
    const { email, password } = await request.json() as LoginRequestBody;
     console.log(`Login attempt for email: ${email}`); 
    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user using D1 syntax
    const user = await db // Use the obtained db instance
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<any>(); // Use <any> or a specific User type if defined
     console.log("User found:", user ? `ID ${user.id}` : 'No user found'); 
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password - Ensure user.password_hash exists and is the correct field name
    if (!user.password_hash) {
      console.log("Login failed: Invalid credentials (user not found or no hash)."); 
      // Handle cases where user might exist but has no password (e.g., OAuth user)
      return NextResponse.json(
        { success: false, message: 'Invalid credentials (no password set)' },
        { status: 401 }
      );
    }

    // Use bcrypt to compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log(`Password valid: ${isPasswordValid}`);
    if (!isPasswordValid) {
      console.log("Login failed: Password mismatch.");
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
     console.log("Password OK, generating token...");
    // Generate JWT token with proper signature
    const token = await new jose.SignJWT({
      // Ensure payload matches expected User structure for useAuth
      sub: user.id.toString(),
      email: user.email,
      role_id: user.role_id, // Include role_id
      first_name: user.first_name, // Include first name if available
      last_name: user.last_name, // Include last name if available
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // Token expires in 24 hours
      .sign(getJwtSecret());
     console.log("Token generated.");
    // Set cookie with the token
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      // --- FIX: Return user data matching expected structure for useAuth ---
      data: {
          id: user.id,
          email: user.email,
          role_id: user.role_id,
          first_name: user.first_name,
          last_name: user.last_name,
          // Exclude password_hash here explicitly if not done by spread above
      }
      // --- End of FIX ---
    });

    // Set HTTP-only cookie for better security
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours in seconds
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Error during login:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      // --- FIX: Provide more structured error ---
      { success: false, message: 'Login failed internally.', error: errorMessage },
      // --- End of FIX ---
      { status: 500 }
    );
  }
}