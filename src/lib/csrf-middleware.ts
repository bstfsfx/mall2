// filepath: src/lib/csrf-middleware.ts
/**
 * CSRF Validation Middleware
 * 
 * Validates CSRF tokens for API routes.
 * Use this in your route handlers for state-changing operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken, getCSRFTokenFromCookies } from '@/lib/csrf';

export interface CSRFValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate CSRF token from a Next.js request
 * 
 * @param request - The incoming Next.js request
 * @returns Validation result with success status and optional error message
 */
export async function validateCSRFFromRequest(request: NextRequest): Promise<CSRFValidationResult> {
  // Only validate for state-changing methods
  const method = request.method;
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true };
  }

  // Extract token from header
  const requestToken = request.headers.get('x-csrf-token');

  // Get token from cookie
  const cookieToken = await getCSRFTokenFromCookies();

  // Validate
  const isValid = await validateCSRFToken(requestToken, cookieToken);

  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid or missing CSRF token',
    };
  }

  return { valid: true };
}

/**
 * Middleware wrapper for route handlers
 * 
 * Usage:
 * ```
 * export async function POST(request: NextRequest) {
 *   const validation = await withCSRFValidation(request);
 *   if (!validation.valid) {
 *     return NextResponse.json({ error: validation.error }, { status: 403 });
 *   }
 *   // Your handler logic...
 * }
 * ```
 */
export async function withCSRFValidation(request: NextRequest): Promise<CSRFValidationResult> {
  return validateCSRFFromRequest(request);
}

/**
 * Create a protected route handler wrapper
 * 
 * @param handler - Your original route handler
 * @returns Wrapped handler with CSRF validation
 */
export function withCSRF<T extends (request: NextRequest, ...args: any[]) => Promise<NextResponse>>(
  handler: T
): (request: NextRequest, ...args: Parameters<T>) => Promise<NextResponse> {
  return async (request: NextRequest, ...args: Parameters<T>) => {
    const validation = await withCSRFValidation(request);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error ?? 'CSRF validation failed' },
        { status: 403 }
      );
    }

    return handler(request, ...args);
  };
}