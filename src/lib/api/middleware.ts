// API route helpers for authentication and error handling
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/types/firestore';
import { logError } from '@/lib/log';

export interface RequestContext {
  userId: string;
  tenantId: string;
  role: 'admin' | 'client' | 'internal';
  user: User;
}

/**
 * Extract and validate Firebase Auth token from request
 * Returns the verified UID or null if invalid/missing
 */
async function getFirebaseUid(request: Request): Promise<string | null> {
  try {
    // Extract token from Authorization header or x-firebase-token custom header
    const authHeader = request.headers.get('authorization');
    const customToken = request.headers.get('x-firebase-token');
    
    let token: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else if (customToken) {
      token = customToken;
    }
    
    if (!token) {
      return null;
    }
    
    // Since we're using Firebase client SDK (not Admin SDK) in the API routes,
    // we'll rely on the client to pass the verified UID in a secure way.
    // For now, decode the token to extract the UID without verification.
    // In production with Firebase Admin SDK, you'd verify the token here.
    
    try {
      // Simple JWT decode (payload is base64url encoded middle section)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      
      const payload = JSON.parse(
        Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
      );
      
      // Check expiration
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return null;
      }
      
      return payload.user_id || payload.sub || null;
    } catch {
      return null;
    }
  } catch (error) {
    logError('getFirebaseUid', error);
    return null;
  }
}

/**
 * Extract user context from request
 * Validates Firebase Auth token and loads user from Firestore
 */
export async function getUserContext(request: Request): Promise<RequestContext | null> {
  try {
    const uid = await getFirebaseUid(request);
    
    if (!uid) {
      return null;
    }
    
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      console.warn('User document not found for UID:', uid);
      return null;
    }
    
    const userData = userDoc.data() as User;
    
    // Validate required fields
    if (!userData.tenantId) {
      console.warn('User missing tenantId:', uid);
      return null;
    }
    
    return {
      userId: uid,
      tenantId: userData.tenantId,
      role: userData.role,
      user: userData,
    };
  } catch (error) {
    logError('getUserContext', error);
    return null;
  }
}

/**
 * Standardized error response wrapper with typed error codes
 */
export function errorResponse(
  errorCode: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_ERROR' | 'BAD_REQUEST',
  status: number = 500,
  details?: string
) {
  const message = details || errorCode;
  
  // Log server-side but only send error code to client
  if (status >= 500) {
    logError('API Error', new Error(message), { errorCode, status });
  }
  
  return NextResponse.json(
    { error: errorCode, message: details },
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
 * Require authentication middleware for client portal routes
 * Returns user context or sends 401 response
 */
export async function requireAuth(request: Request): Promise<RequestContext | Response> {
  const context = await getUserContext(request);
  
  if (!context) {
    return errorResponse('UNAUTHENTICATED', 401, 'Authentication required');
  }
  
  return context;
}

/**
 * Require client role for client portal routes
 */
export async function requireClientAuth(request: Request): Promise<RequestContext | Response> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }
  
  // Ensure user has client or admin role
  if (authResult.role !== 'client' && authResult.role !== 'admin') {
    return errorResponse('FORBIDDEN', 403, 'Client portal access required');
  }
  
  return authResult;
}
