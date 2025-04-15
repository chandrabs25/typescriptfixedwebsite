// Path: src/app/api/auth/me/route.ts
export const dynamic = 'force-dynamic'; // Ensure dynamic execution for reading cookies/env vars

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, getJwtSecret } from '@/lib/auth'; // Import your verification function
import * as jose from 'jose'; // Import jose for potential payload inspection if needed

// Define User type expected by useAuth hook
interface User {
  id: string | number;
  email: string;
  first_name?: string;
  last_name?: string;
  role_id?: number;
}

// Interface for the expected payload in the JWT
interface JwtPayload extends jose.JWTPayload {
  sub: string; // User ID
  email: string;
  role_id?: number;
  first_name?: string;
  last_name?: string;
  // Add other fields included during token creation
}

export async function GET(request: NextRequest) {
  console.log("--- GET /api/auth/me Request Received ---");
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      console.log("/api/auth/me: No auth token found in cookies.");
      return NextResponse.json(
        { success: false, message: 'Not authenticated: No token provided.', data: null },
        { status: 401 } // Unauthorized
      );
    }

    // Verify the token using the secret
    try {
      const { payload } = await jose.jwtVerify(token, getJwtSecret()) as { payload: JwtPayload };
      console.log("/api/auth/me: Token verified. Payload:", payload);

      // Check if token has expired (jose.jwtVerify usually handles this, but double-check if needed)
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
         console.log("/api/auth/me: Token expired.");
         // Clear the cookie on the client side by setting Max-Age to 0
         const response = NextResponse.json(
            { success: false, message: 'Session expired.', data: null },
            { status: 401 }
         );
         response.cookies.set('auth_token', '', { maxAge: 0, path: '/' });
         return response;
      }

      // Construct the user data object expected by the frontend (useAuth hook)
      const userData: User = {
        id: payload.sub,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        role_id: payload.role_id,
      };

      return NextResponse.json({
        success: true,
        message: 'User authenticated.',
        data: userData // Return the user data
      });

    } catch (jwtError: any) {
      console.error("/api/auth/me: Token verification failed.", jwtError);
      let message = 'Authentication failed: Invalid token.';
      let status = 401; // Unauthorized

      // Handle specific JWT errors if needed (e.g., expired token)
      if (jwtError.code === 'ERR_JWT_EXPIRED') {
        message = 'Session expired.';
         // Clear the cookie on the client side by setting Max-Age to 0
         const response = NextResponse.json(
            { success: false, message: message, data: null },
            { status: status }
         );
         response.cookies.set('auth_token', '', { maxAge: 0, path: '/' });
         return response;
      } else {
        // For other errors, just return the generic message and status
         return NextResponse.json(
           { success: false, message: message, data: null },
           { status: status }
         );
      }
    }
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.', error: error instanceof Error ? error.message : 'Unknown error', data: null },
      { status: 500 }
    );
  }
}