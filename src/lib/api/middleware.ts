// API route helpers for authentication and error handling
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/types/firestore';

export interface RequestContext {
  userId: string;
  tenantId: string;
  role: 'admin' | 'client' | 'internal';
  user: User;
}

/**
 * Extract user context from request
 * For now, returns placeholder data until we implement proper auth middleware
 * TODO: Implement Firebase Auth token verification
 */
export async function getUserContext(request: Request): Promise<RequestContext | null> {
  try {
    // TODO: Extract Firebase Auth token from Authorization header
    // const authHeader = request.headers.get('authorization');
    // const token = authHeader?.replace('Bearer ', '');
    // Verify token with Firebase Admin SDK
    
    // PLACEHOLDER: Return mock context for development
    // In production, this should:
    // 1. Verify the Firebase ID token
    // 2. Get the UID from the token
    // 3. Lookup the user document in Firestore
    // 4. Return the user context
    
    const mockUserId = 'user-placeholder';
    const userDoc = await getDoc(doc(db, 'users', mockUserId));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data() as User;
    
    return {
      userId: mockUserId,
      tenantId: userData.tenantId,
      role: userData.role,
      user: userData,
    };
  } catch (error) {
    console.error('Failed to get user context:', error);
    return null;
  }
}

/**
 * Standardized error response wrapper
 */
export function errorResponse(message: string, status: number = 500) {
  console.error(`API Error (${status}):`, message);
  return NextResponse.json(
    { error: message },
    { status }
  );
}

/**
 * Enforce tenant isolation
 * Validates that the requested tenantId matches the user's tenantId
 */
export function enforceTenantAccess(
  userContext: RequestContext,
  requestedTenantId: string
): boolean {
  // Admin can access all tenants
  if (userContext.role === 'admin') {
    return true;
  }
  
  // Non-admin users can only access their own tenant
  return userContext.tenantId === requestedTenantId;
}

/**
 * Require authentication middleware
 * Returns user context or sends 401 response
 */
export async function requireAuth(request: Request): Promise<RequestContext | Response> {
  const context = await getUserContext(request);
  
  if (!context) {
    return errorResponse('Unauthorized', 401);
  }
  
  return context;
}
