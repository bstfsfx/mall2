'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Geist } from 'next/font/google';
import '../globals.css';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import styles from './layout.module.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const menuItems = [
    { href: '/admin', label: '📊 數據總覽' },
    { href: '/admin/products', label: '👕 商品管理' },
    { href: '/admin/categories', label: '📁 分類管理' },
    { href: '/admin/orders', label: '📦 訂單管理' },
    { href: '/admin/users', label: '👥 會員管理' },
    { href: '/admin/settings', label: '⚙️ 網站設定' },
  ];

  return (
    <div className={styles.adminWrap}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <Link href="/" className={styles.logoText}>mall2 <span className={styles.adminBadge}>ADMIN</span></Link>
        </div>
        <nav className={styles.nav}>
          {menuItems.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`${styles.navLink} ${active ? styles.navActive : ''}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <p className={styles.email}>{user.email}</p>
          <button onClick={() => signOut().then(() => router.push('/'))} className={styles.logoutBtn}>
            🚪 安全登出
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        <header className={styles.header}>
          <h2>{menuItems.find(i => pathname === i.href || (i.href !== '/admin' && pathname.startsWith(i.href)))?.label.substring(3) || '管理后台'}</h2>
          <Link href="/" className="btn btn-outline-gold btn-sm" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}>
            🏪 返回前台首頁
          </Link>
        </header>
        <div className={styles.contentInner}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className={geistSans.variable}>
      <body style={{ background: '#08080c' }}>
        <AuthProvider>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
