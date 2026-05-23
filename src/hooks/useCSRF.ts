// filepath: src/hooks/useCSRF.ts
/**
 * useCSRF Hook
 * 
 * Provides CSRF token management for form submissions.
 * Use this hook in any form that makes state-changing requests.
 * 
 * @example
 * ```tsx
 * const { csrfFetch, getCSRFToken, refreshToken } = useCSRF();
 * 
 * const handleSubmit = async (data) => {
 *   const res = await csrfFetch('/api/orders', {
 *     method: 'POST',
 *     body: JSON.stringify(data),
 *   });
 * };
 * ```
 */

'use client';

import { useCallback, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

export interface UseCSRFReturn {
  /** Fetch wrapper that automatically includes CSRF token */
  csrfFetch: (url: string, options?: RequestInit) => Promise<Response>;
  /** Get CSRF token directly from document cookies */
  getCSRFToken: () => string | null;
  /** Manually refresh the CSRF token */
  refreshToken: () => Promise<void>;
  /** Whether CSRF token is loading */
  loading: boolean;
}

/**
 * Hook for CSRF-protected form submissions
 */
export function useCSRF(): UseCSRFReturn {
  const { csrfFetch: authCsrfFetch } = useAuth();
  const [loading, setLoading] = useState(false);

  /**
   * Get CSRF token from document cookies
   */
  const getCSRFToken = useCallback((): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(^| )${CSRF_COOKIE_NAME}=([^;]+)`));
    return match ? match[2] : null;
  }, []);

  /**
   * Manually refresh the CSRF token
   */
  const refreshToken = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await fetch('/api/csrf', { method: 'GET' });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    csrfFetch: authCsrfFetch,
    getCSRFToken,
    refreshToken,
    loading,
  };
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };