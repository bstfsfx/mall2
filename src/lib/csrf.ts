// filepath: src/lib/csrf.ts
/**
 * CSRF Protection Utility
 * 
 * Implements double-submit cookie pattern for stateless CSRF protection.
 * The token is generated on the server and validated on each state-changing request.
 */

import { cookies } from 'next/headers';

// Cookie configuration
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash the token for storage/comparison (timing-safe)
 */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token from request
 * Uses timing-safe comparison to prevent timing attacks
 */
export async function validateCSRFToken(
  requestToken: string | null,
  cookieToken: string | null
): Promise<boolean> {
  if (!requestToken || !cookieToken) {
    return false;
  }

  // Timing-safe comparison
  const requestHash = await hashToken(requestToken);
  const cookieHash = await hashToken(cookieToken);

  if (requestHash.length !== cookieHash.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < requestHash.length; i++) {
    result |= requestHash.charCodeAt(i) ^ cookieHash.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Get CSRF token from cookies (for server components)
 */
export async function getCSRFTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value ?? null;
}

/**
 * Set CSRF token cookie (for server components)
 */
export async function setCSRFTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_COOKIE_MAX_AGE,
    path: '/',
  });
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };