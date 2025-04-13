export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// Middleware to protect booking routes
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  // Check if user is authenticated
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse; // Return 401 or 403 response
  }
  
  // User is authenticated, proceed with handler
  return handler(request);
}

// Middleware to protect vendor routes
export async function withVendorAuth(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  // Check if user is authenticated and has vendor role (role_id = 2)
  const authResponse = await requireAuth(request, [2]);
  if (authResponse) {
    return authResponse; // Return 401 or 403 response
  }
  
  // User is authenticated and has vendor role, proceed with handler
  return handler(request);
}
