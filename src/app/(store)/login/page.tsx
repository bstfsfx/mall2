'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

const DEV_USERS = [
  { email: 'test@mall2.com', password: 'test1234', role: '👤 USER', roleColor: '#6b7280', label: '測試用戶' },
  { email: 'user1@mall2.com', password: 'user11234', role: '👤 USER', roleColor: '#6b7280', label: '一般會員 1' },
  { email: 'user2@mall2.com', password: 'user21234', role: '👤 USER', roleColor: '#6b7280', label: '一般會員 2' },
];

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDev, setShowDev] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error === 'Invalid login credentials' ? '電子信箱或密碼錯誤' : res.error);
      } else {
        const redirect = searchParams.get('redirect') ?? '/';
        router.push(redirect);
        router.refresh();
      }
    } catch (err) {
      setError('登入時發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setLoading(true);
    setError(null);
    const res = await signIn(e, p);
    if (res.error) {
      setError(res.error === 'Invalid login credentials' ? '電子信箱或密碼錯誤' : res.error);
      setLoading(false);
    } else {
      const redirect = searchParams.get('redirect') ?? '/';
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <div className={styles.page}>
      <div className={`container ${styles.container}`}>
        <div className={`glass ${styles.card}`}>
          <div className={styles.header}>
            <h1 className="section-title"><span className="gold-text">會員登入</span></h1>
            <p className={styles.subtitle}>登入以管理您的訂單與個人資料</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.group}>
              <label htmlFor="email">電子信箱</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="your@email.com"
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
              {loading ? '登入中...' : '登入'}
            </button>
          </form>

          <div className={styles.footer}>
            <p>還沒有帳號？ <Link href="/signup" className={styles.link}>立即註冊</Link></p>
          </div>

          {/* DEV ONLY quick login panel */}
          <div className={styles.devPanel}>
            <button className={styles.devToggle} onClick={() => setShowDev(v => !v)}>
              🔧 開發者快速登入 {showDev ? '▲' : '▼'}
            </button>
            {showDev && (
              <div className={styles.devContent}>
                <p className={styles.devWarning}>⚠️ 此面板僅在開發環境顯示，請勿於正式環境使用</p>
                <div className={styles.devUserList}>
                  {DEV_USERS.map(u => (
                    <div key={u.email} className={styles.devUserItem}>
                      <div className={styles.devUserInfo}>
                        <span className={styles.devUserEmail}>{u.email}</span>
                        <span className={styles.devUserRole} style={{ color: u.roleColor }}>{u.role}</span>
                      </div>
                      <div className={styles.devUserMeta}>
                        <span>{u.label}</span>
                        <span style={{ fontFamily: 'monospace' }}>{u.password}</span>
                      </div>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.78rem', padding: '4px 12px' }}
                        onClick={() => quickLogin(u.email, u.password)}
                        disabled={loading}
                      >
                        登入
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
