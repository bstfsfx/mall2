'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
        </div>
      </div>
    </div>
  );
}
