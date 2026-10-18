'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        router.push('/login?error=' + encodeURIComponent(error.message));
        return;
      }

      // Successfully authenticated - redirect to home or intended page
      const redirect = new URLSearchParams(window.location.search).get('redirect') ?? '/';
      router.push(redirect);
      router.refresh();
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)' }}>正在處理登入...</p>
    </div>
  );
}