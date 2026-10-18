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
  const { signIn, signInWithGoogle, signInWithLine, signInWithFacebook } = useAuth();

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

          {/* Social Login Buttons */}
          <div className={styles.socialDivider}>
            <span>或使用以下帳號登入</span>
          </div>

          <div className={styles.socialButtons}>
            <button
              type="button"
              className={styles.socialButton}
              onClick={async () => {
                setLoading(true);
                setError(null);
                const res = await signInWithGoogle();
                if (res.error) {
                  setError(res.error);
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            <button
              type="button"
              className={styles.socialButton}
              onClick={async () => {
                setLoading(true);
                setError(null);
                const res = await signInWithLine();
                if (res.error) {
                  setError(res.error);
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="#06C755">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.703c-.213.637-1.485 1.336-2.097.684-.192-.204-.371-.438-.538-.678-.477-.685-.893-1.407-1.159-2.045-1.043-2.508-.224-5.29 1.4-5.91.537-.205 1.132-.21 1.67-.02.541.19.983.54 1.33.98.342.434.595.962.747 1.532.162.573.14 1.173-.033 1.743-.193.636-.69 1.075-1.32 1.714zM8.851 14.435c.128-.16.266-.314.432-.447.615-.492 1.37-.716 2.178-.646.809.07 1.522.416 2.077.958.278.272.506.59.676.94.166.343.262.718.283 1.103.022.391-.03.785-.152 1.158-.208.637-.793 1.072-1.444 1.062-.652-.012-1.223-.427-1.613-.962-.39-.534-.647-1.164-.752-1.832-.104-.667-.024-1.356.232-1.985.257-.63.726-1.163 1.323-1.517-.665-.27-1.284-.143-1.873.165-.362.19-.687.445-.967.756-.282.314-.492.691-.617 1.108-.124.414-.157.856-.097 1.292.06.437.237.857.514 1.222.28.368.648.668 1.062.869.415.2.867.292 1.328.27.461-.022.91-.127 1.317-.308.407-.181.766-.439 1.052-.753.286-.315.5-.686.628-1.085.126-.396.165-.812.114-1.222-.05-.41-.192-.808-.414-1.163-.224-.358-.516-.672-.854-.918-.338-.247-.722-.424-1.126-.519.537-.408.958-.949 1.206-1.558.249-.61.282-1.273.095-1.903-.186-.629-.562-1.188-1.073-1.596-.511-.408-1.131-.695-1.792-.823-.661-.129-1.352-.092-1.996.105-.644.197-1.212.565-1.632 1.053-.419.488-.698 1.094-.8 1.742-.103.648-.018 1.32.245 1.933.263.614.702 1.122 1.26 1.458z"/>
              </svg>
              LINE
            </button>

            <button
              type="button"
              className={styles.socialButton}
              onClick={async () => {
                setLoading(true);
                setError(null);
                const res = await signInWithFacebook();
                if (res.error) {
                  setError(res.error);
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.471h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.262 2.686.262v2.951h-1.51c-1.491 0-1.956.925-1.956 1.874v2.573h3.329l-.532 3.469h-2.797V23.93C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

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
