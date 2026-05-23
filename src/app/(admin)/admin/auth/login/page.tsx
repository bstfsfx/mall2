'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthProvider } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from '@/app/(store)/login/page.module.css';

interface DevUser {
  email: string;
  password: string;
  role: string;
  name: string | null;
}

function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devUsers, setDevUsers] = useState<DevUser[]>([]);
  const [showDevPanel, setShowDevPanel] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  useEffect(() => {
    // DEV ONLY: Hardcoded demo accounts with plaintext passwords
    // In production this panel should be disabled/hidden
    const mockDevUsers: DevUser[] = [
      { email: 'admin@mall2.com', password: 'admin1234', role: 'admin', name: '系統管理員' },
      { email: 'marketing@mall2.com', password: 'marketing1234', role: 'marketing', name: '行銷管理員' },
      { email: 'cs@mall2.com', password: 'cs123456', role: 'customer_support', name: '客服人員' },
      { email: 'test@mall2.com', password: 'test1234', role: 'customer', name: '測試用戶' },
      { email: 'user1@mall2.com', password: 'user11234', role: 'customer', name: '一般會員' },
      { email: 'user2@mall2.com', password: 'user21234', role: 'customer', name: '一般會員 2' },
    ];
    setDevUsers(mockDevUsers);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error === 'Invalid login credentials' ? '電子信箱或密碼錯誤' : res.error);
      } else {
        const rawRedirect = searchParams.get('redirect');
        const redirect = rawRedirect ?? '/admin';
        router.push(redirect);
        router.refresh();
      }
    } catch {
      setError('發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (user: DevUser) => {
    setEmail(user.email);
    setPassword(user.password);
    setLoading(true);
    setError(null);
    const res = await signIn(user.email, user.password);
    if (res.error) {
      setError(res.error === 'Invalid login credentials' ? '電子信箱或密碼錯誤' : res.error);
      setLoading(false);
    } else {
      const rawRedirect = searchParams.get('redirect');
      const redirect = rawRedirect ?? '/admin';
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <div className={styles.page}>
      <div className={`container ${styles.container}`}>
        <div className={`glass ${styles.card}`}>
          {/* Admin branding */}
          <div className={styles.adminBadge}>
            <span>⚙️ 管理後台</span>
          </div>

          <h1 className={styles.title}>mall2 <span className={styles.adminTag}>ADMIN</span></h1>
          <p className={styles.subtitle}>請輸入管理員帳號以進入系統</p>

          {error && (
            <div className={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.group}>
              <label htmlFor="email">電子信箱</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="admin@mall2.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.group}>
              <label htmlFor="password">密碼</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="請輸入密碼"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? '驗證中...' : '進入管理後台'}
            </button>
          </form>

          <div className={styles.footer}>
            <p>這是管理員專用入口，一般會員請至 <a href="/login" className={styles.link}>會員登入</a></p>
          </div>

          {/* DEV ONLY: Quick login panel */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px dashed #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', background: '#ef4444', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>DEV ONLY</span>
                <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>開發者快速登入</span>
              </div>
              <button
                onClick={() => setShowDevPanel(!showDevPanel)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#ef4444' }}
              >
                {showDevPanel ? '隱藏 ▲' : '顯示 ▼'}
              </button>
            </div>

            {showDevPanel && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.72rem', color: '#ef4444', marginBottom: '0.5rem' }}>
                  ⚠️ 此面板僅在開發環境顯示，請勿於正式環境使用
                </p>
                {devUsers.map((user, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(239,68,68,0.05)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '8px',
                      padding: '0.6rem 0.8rem',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#333' }}>{user.email}</span>
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                          background: user.role === 'admin' ? 'rgba(239,68,68,0.15)' :
                                      user.role === 'marketing' ? 'rgba(168,85,247,0.15)' :
                                      user.role === 'customer_support' ? 'rgba(16,185,129,0.15)' :
                                      'rgba(59,130,246,0.15)',
                          color: user.role === 'admin' ? '#dc2626' :
                                 user.role === 'marketing' ? '#9333ea' :
                                 user.role === 'customer_support' ? '#059669' :
                                 '#2563eb',
                        }}>
                          {user.role === 'admin' ? '👑 ADMIN' :
                           user.role === 'marketing' ? '📣 行銷' :
                           user.role === 'customer_support' ? '🎧 客服' : '👤 USER'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#666' }}>
                        {user.name && <span>{user.name} · </span>}
                        <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.06)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>
                          {user.password}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDevLogin(user)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      登入
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <AuthProvider>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner" /></div>}>
        <AdminLoginForm />
      </Suspense>
    </AuthProvider>
  );
}