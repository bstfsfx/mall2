'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signUp(email, password, name);
      if (res.error) {
        setError(res.error);
      } else {
        // Supabase sends a confirmation email by default unless configured otherwise.
        // We will show a success message or redirect if email verification is off.
        setError('註冊成功！請檢查信箱以驗證您的帳號，或嘗試直接登入。');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setError('註冊時發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`container ${styles.container}`}>
        <div className={`glass ${styles.card}`}>
          <div className={styles.header}>
            <h1 className="section-title"><span className="gold-text">註冊會員</span></h1>
            <p className={styles.subtitle}>加入會員以享有更流暢的購物體驗</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={error.includes('成功') ? styles.success : styles.error}>
                {error}
              </div>
            )}

            <div className={styles.group}>
              <label htmlFor="name">真實姓名</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="請輸入姓名"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

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
                placeholder="請輸入密碼 (至少 6 個字元)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? '註冊中...' : '註冊'}
            </button>
          </form>

          <div className={styles.footer}>
            <p>已經有帳號了？ <Link href="/login" className={styles.link}>立即登入</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
