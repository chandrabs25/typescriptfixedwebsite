import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
// Get JWT secret from environment variable or use a fallback for development
// In production, this should always be set in environment variables
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('WARNING: JWT_SECRET not set in environment variables. Using fallback secret for development only.');
    return new TextEncoder().encode('fallback_secret_for_development_only');
  }
  return new TextEncoder().encode(secret);
};

// Verify JWT token from request
export async function verifyAuth(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;
    
    // If no token, return unauthorized
    if (!token) {
      return { isAuthenticated: false, user: null };
    }
    
    // Verify token with proper signature verification
    const { payload } = await jose.jwtVerify(token, getJwtSecret());
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      return { isAuthenticated: false, user: null };
    }
    
    // Return authenticated user data
    return { 
      isAuthenticated: true, 
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role
      } 
    };
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return { isAuthenticated: false, user: null };
  }
}

// Middleware to protect routes
export async function requireAuth(
  request: NextRequest,
  allowedRoles: number[] = []
) {
  const { isAuthenticated, user } = await verifyAuth(request);
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // If roles are specified, check if user has required role
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role as number)) {
    return NextResponse.json(
      { success: false, message: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  // User is authenticated and has required role (if specified)
  return null;
}
