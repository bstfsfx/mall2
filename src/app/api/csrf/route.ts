// filepath: src/app/api/csrf/route.ts
/**
 * CSRF Token Endpoint
 * 
 * Generates and sets a CSRF token cookie for the client.
 * This should be called on page load for any page with forms/actions.
 */

import { NextResponse } from 'next/server';
import { generateCSRFToken, setCSRFTokenCookie, CSRF_COOKIE_NAME, CSRF_COOKIE_MAX_AGE } from '@/lib/csrf';

export async function GET() {
  const token = generateCSRFToken();

  const response = NextResponse.json({ 
    success: true, 
    message: 'CSRF token generated' 
  });

  // Set the token as a secure, httpOnly cookie
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_COOKIE_MAX_AGE,
    path: '/',
  });

  // Also return the token in the body for client-side access
  response.body;

  return response;
}