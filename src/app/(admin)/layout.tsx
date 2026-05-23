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

  // Skip auth check for admin auth login route
  const isAdminAuthRoute = pathname.startsWith('/admin/auth');

  useEffect(() => {
    if (loading) return;
    if (isAdminAuthRoute) return;
    if (!user) {
      router.push('/admin/auth/login?redirect=/admin');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [user, loading, isAdmin, router, isAdminAuthRoute]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" />
      </div>
    );
  }

  // Show auth page without admin sidebar
  if (isAdminAuthRoute) {
    return <>{children}</>;
  }

  if (!user || !isAdmin) {
    return null;
  }

  const menuGroups = [
    {
      title: '總覽',
      items: [
        { href: '/admin', label: '📊 儀表板' },
      ],
    },
    {
      title: '商品',
      items: [
        { href: '/admin/products', label: '🍰 商品管理' },
        { href: '/admin/categories', label: '📁 分類管理' },
      ],
    },
    {
      title: '詢價 / 會員',
      items: [
        { href: '/admin/inquiries', label: '📧 詢價單管理' },
        { href: '/admin/orders', label: '📦 訂單管理' },
        { href: '/admin/users', label: '👤 會員管理' },
      ],
    },
    {
      title: '內容 CMS',
      items: [
        { href: '/admin/banners', label: '🖼️ Banner' },
        { href: '/admin/articles', label: '📝 文章 / FAQ' },
      ],
    },
    {
      title: '行銷',
      items: [
        { href: '/admin/discounts', label: '🎫 折扣碼' },
        { href: '/admin/messages', label: '💬 客服訊息' },
      ],
    },
    {
      title: '系統',
      items: [
        { href: '/admin/settings', label: '⚙️ 系統設定' },
        { href: '/admin/users', label: '👥 使用者' },
        { href: '/admin/roles', label: '🔐 角色 / 權限' },
        { href: '/admin/logs', label: '📋 操作紀錄' },
      ],
    },
  ];

  return (
    <div className={styles.adminWrap}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <Link href="/" className={styles.logoText}>mall2 <span className={styles.adminBadge}>ADMIN</span></Link>
        </div>
        <nav className={styles.nav}>
          {menuGroups.map(group => (
            <div key={group.title} className={styles.navSection}>
              <div className={styles.navSectionTitle}>{group.title}</div>
              {group.items.map(item => {
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} className={`${styles.navLink} ${active ? styles.navActive : ''}`}>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
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
          <h2>
            {menuGroups.flatMap(g => g.items).find(i => pathname === i.href || (i.href !== '/admin' && pathname.startsWith(i.href)))?.label.substring(3) || '管理后台'}
          </h2>
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
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}