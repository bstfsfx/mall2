'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Set form fields once profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setPhone(profile.phone ?? '');
      setAddress(profile.address ?? '');
    }
  }, [profile]);

  if (loading || !user) {
    return (
      <div className={styles.loading}>
        <div className="spinner" />
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMsg(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name, phone, address })
        .eq('id', user.id);

      if (error) {
        setMsg({ type: 'error', text: error.message });
      } else {
        setMsg({ type: 'success', text: '基本資料已成功更新' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: '更新時發生錯誤，請稍後再試' });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: '2rem' }}>
          我的 <span className="gold-text">會員中心</span>
        </h1>

        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={`glass ${styles.sidebar}`}>
            <div className={styles.avatarArea}>
              <div className={styles.avatar}>{name.slice(0, 1) || user.email?.slice(0, 1).toUpperCase()}</div>
              <div>
                <p className={styles.sidebarName}>{name || '未設定姓名'}</p>
                <p className={styles.sidebarEmail}>{user.email}</p>
                {profile?.role === 'admin' && (
                  <span className="badge badge-gold" style={{ marginTop: '0.4rem' }}>管理員</span>
                )}
              </div>
            </div>
            <nav className={styles.nav}>
              <Link href="/profile" className={`${styles.navLink} ${styles.navActive}`}>
                👤 個人資料
              </Link>
              <Link href="/orders" className={styles.navLink}>
                📦 我的訂單
              </Link>
              {profile?.role === 'admin' && (
                <Link href="/admin" className={styles.navLink}>
                  🛠️ 後台管理系統
                </Link>
              )}
              <button onClick={handleLogout} className={styles.logoutBtn}>
                🚪 登出帳號
              </button>
            </nav>
          </aside>

          {/* Form Content */}
          <main className={`glass ${styles.content}`}>
            <h2 className={styles.sectionHeader}>修改個人資料</h2>
            <hr className="gold-divider" style={{ margin: '1rem 0 2rem' }} />

            <form onSubmit={handleUpdate} className={styles.form}>
              {msg && (
                <div className={msg.type === 'success' ? styles.success : styles.error}>
                  {msg.text}
                </div>
              )}

              <div className={styles.group}>
                <label>登入信箱 (無法變更)</label>
                <input type="text" className="input" value={user.email ?? ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>

              <div className={styles.group}>
                <label htmlFor="profileName">姓名</label>
                <input
                  id="profileName"
                  type="text"
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="請輸入真實姓名"
                  required
                />
              </div>

              <div className={styles.group}>
                <label htmlFor="profilePhone">聯絡電話</label>
                <input
                  id="profilePhone"
                  type="tel"
                  className="input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="請輸入聯絡電話"
                />
              </div>

              <div className={styles.group}>
                <label htmlFor="profileAddress">預設配送地址</label>
                <textarea
                  id="profileAddress"
                  className="input"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="請輸入預設收件地址"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn-gold" style={{ alignSelf: 'flex-start', marginTop: '1rem' }} disabled={updating}>
                {updating ? '更新中...' : '儲存變更'}
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
