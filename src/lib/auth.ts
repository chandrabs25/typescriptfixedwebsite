// src/lib/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

// Keep runtime export if needed for other functions in this file, otherwise remove if unused.
// export const runtime = 'edge';
// Keep dynamic export if needed for other functions in this file, otherwise remove if unused.
// export const dynamic = 'force-dynamic';

// Get JWT secret from environment variable or use a fallback for development
// In production, this should always be set in environment variables
export const getJwtSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return new TextEncoder().encode(secret);
};



// Define the User structure expected by verifyAuth return and useAuth hook
interface VerifiedUser {
    id: string | number;
    email: string;
    role_id?: number; // Changed from role to role_id
    // Add other fields if they are consistently included in the token and needed by consumers
}

// Interface for the expected payload in the JWT (Matches what's set in login)
interface JwtPayload extends jose.JWTPayload {
  sub: string; // User ID
  email: string;
  role_id?: number;
  first_name?: string;
  last_name?: string;
}


// Verify JWT token from request
export async function verifyAuth(request: NextRequest): Promise<{ isAuthenticated: boolean; user: VerifiedUser | null }> { // Added return type
  try {
    // Get token from cookie
   
    const token = request.cookies.get('auth_token')?.value;

    // If no token, return unauthorized
    if (!token) {
      return { isAuthenticated: false, user: null };
    }

    // Verify token with proper signature verification
    const { payload } = await jose.jwtVerify(token, getJwtSecret()) as { payload: JwtPayload }; // Use JwtPayload

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      return { isAuthenticated: false, user: null };
    }

    // Return authenticated user data
    const verifiedUser: VerifiedUser = {
        id: payload.sub,
    email: payload.email,
    role_id: payload.role_id 
    };

    return {
      isAuthenticated: true,
      user: verifiedUser
    };
  } catch (error) {
    // Log specific JWT errors if possible
    if (error instanceof Error && 'code' in error && error.code === 'ERR_JWT_EXPIRED') {
      console.log('Auth token expired during verification.');
    } else {
      console.error('Error verifying auth token:', error);
    }
    return { isAuthenticated: false, user: null };
  }
}

// Middleware to protect routes (using the corrected verifyAuth)
export async function requireAuth(
  request: NextRequest,
  allowedRoles: number[] = [] // Roles are numbers (IDs)
) {
  const { isAuthenticated, user } = await verifyAuth(request);

  if (!isAuthenticated || !user) { // Check user as well
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }

  // If roles are specified, check if user has required role
  // Use role_id from the verified user object
  if (allowedRoles.length > 0 && (user.role_id === undefined || !allowedRoles.includes(user.role_id))) {
    return NextResponse.json(
      { success: false, message: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  // User is authenticated and has required role (if specified)
  return null; // Indicates success, allow request to proceed
}