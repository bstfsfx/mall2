// filepath: src/lib/csrf-client.ts
/**
 * Client-side CSRF utilities
 * 
 * Provides functions for retrieving and attaching CSRF tokens to requests.
 */

import { cookies } from 'next/headers';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Get CSRF token from cookies (client-side)
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value ?? null;
}

/**
 * Fetch wrapper that automatically includes CSRF token
 */
export async function csrfFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getCSRFToken();

  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    if (headers instanceof Headers) {
      headers.set(CSRF_HEADER_NAME, token);
    } else {
      (headers as Record<string, string>)[CSRF_HEADER_NAME] = token;
    }
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };