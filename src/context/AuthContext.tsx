'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_API_URL = '/api/csrf';

interface Profile {
  id: string;
  role: 'admin' | 'customer';
  name: string | null;
  phone: string | null;
  address: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  csrfFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    setProfile(data ?? null);
  };

  /**
   * Refresh CSRF token from server
   * Should be called on page load and periodically
   */
  const refreshCSRFToken = useCallback(async () => {
    try {
      const response = await fetch(CSRF_API_URL, { method: 'GET' });
      if (!response.ok) {
        console.warn('Failed to refresh CSRF token');
      }
    } catch (error) {
      console.warn('CSRF token refresh error:', error);
    }
  }, []);

  /**
   * Get CSRF token from document cookies
   */
  const getCSRFTokenFromDOM = useCallback((): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(^| )${CSRF_COOKIE_NAME}=([^;]+)`));
    return match ? match[2] : null;
  }, []);

  /**
   * Fetch with CSRF token attached
   */
  const csrfFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = getCSRFTokenFromDOM();
    const headers: HeadersInit = {
      ...options.headers,
    };
    if (token && headers instanceof Headers) {
      headers.set(CSRF_HEADER_NAME, token);
    } else if (token && typeof headers === 'object') {
      (headers as Record<string, string>)[CSRF_HEADER_NAME] = token;
    }
    return fetch(url, { ...options, headers });
  }, [getCSRFTokenFromDOM]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) await fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) await fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, refreshCSRFToken]);

  // Refresh CSRF token on mount and periodically
  useEffect(() => {
    refreshCSRFToken();
    // Refresh token every 4 hours
    const interval = setInterval(refreshCSRFToken, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshCSRFToken]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      isAdmin: profile?.role === 'admin',
      signIn, signUp, signOut, refreshProfile,
      csrfFetch,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
