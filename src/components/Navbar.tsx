'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';
import { GoldIcons } from '@/components/ui/GoldIcons';
import { useCart } from '@/context/CartContext';

interface NavbarProps {
  logoUrl?: string | null;
}

const NAV_LINKS = [
  { href: '/products', label: '全部商品' },
  { href: '/products?category=new-arrivals', label: '新品' },
  { href: '/products?category=tops', label: '上衣' },
  { href: '/products?category=bottoms', label: '下裝' },
  { href: '/products?category=outerwear', label: '外套' },
  { href: '/products?category=accessories', label: '配件' },
  { href: '/knowledge', label: '專業知識區' },
];

export default function Navbar({ logoUrl }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          {logoUrl ? (
            <Image src={logoUrl} alt="mall2" width={110} height={38} style={{ objectFit: 'contain' }} />
          ) : (
            <span className={styles.logoText}>mall2</span>
          )}
        </Link>

        {/* Desktop Nav */}
        <ul className={styles.links}>
          {NAV_LINKS.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={styles.link}>{l.label}</Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className={styles.actions}>
          <Link href="/search" className={styles.iconBtn} aria-label="搜尋">
            <GoldIcons.Search />
          </Link>
          <Link href="/messages" className={styles.iconBtn} aria-label="客服訊息" title="客服訊息" style={{ fontSize: '1.1rem' }}>
            💬
          </Link>
          <Link href="/profile" className={styles.iconBtn} aria-label="會員">
            <GoldIcons.User />
          </Link>
          <button onClick={openCart} className={styles.cartBtn} aria-label="購物車">
            <GoldIcons.Cart />
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>
          <button
            className={`${styles.iconBtn} ${styles.menuToggle}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="選單"
          >
            {menuOpen ? <GoldIcons.Close /> : <GoldIcons.Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileOpen : ''}`}>
        {NAV_LINKS.map(l => (
          <Link key={l.href} href={l.href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            {l.label}
          </Link>
        ))}
        <div className={styles.mobileDivider} />
        <Link href="/profile" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>我的帳號</Link>
        <Link href="/messages" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>💬 客服訊息</Link>
        <Link href="/orders" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>我的訂單</Link>
      </div>
    </nav>
  );
}
