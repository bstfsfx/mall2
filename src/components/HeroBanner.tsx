'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HeroBanner.module.css';
import { GoldIcons } from '@/components/ui/GoldIcons';

interface Banner {
  url: string;
  alt?: string;
}

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  banners?: Banner[];
  logoUrl?: string | null;
}

export default function HeroBanner({
  title = 'mall2 潮流服飾',
  subtitle = '探索最新的時尚單品，展現你的獨特風格',
  banners = [],
  logoUrl,
}: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  const hasBanners = banners.length > 0;

  const goTo = useCallback((index: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 400);
  }, [animating]);

  const next = useCallback(() => {
    goTo((current + 1) % banners.length);
  }, [current, banners.length, goTo]);

  // Auto-advance carousel
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  // Text entrance animation
  useEffect(() => {
    const t = setTimeout(() => setTextVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className={styles.hero}>
      {/* Background */}
      <div className={styles.bg}>
        {hasBanners ? (
          banners.map((banner, i) => (
            <div
              key={i}
              className={`${styles.slide} ${i === current ? styles.active : ''} ${animating ? styles.animating : ''}`}
            >
              <Image
                src={banner.url}
                alt={banner.alt || `Banner ${i + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                priority={i === 0}
              />
            </div>
          ))
        ) : (
          <div className={styles.defaultBg}>
            <div className={styles.gradientOrb1} />
            <div className={styles.gradientOrb2} />
            <div className={styles.gridLines} />
          </div>
        )}
        <div className={styles.overlay} />
      </div>

      {/* Content */}
      <div className={`container ${styles.content} ${textVisible ? styles.visible : ''}`}>
        {logoUrl && (
          <div className={styles.logoWrap}>
            <Image src={logoUrl} alt="Logo" width={140} height={50} style={{ objectFit: 'contain' }} />
          </div>
        )}

        <div className={styles.eyebrow}>
          <span className={styles.eyebrowLine} />
          <span>2025 COLLECTION</span>
          <span className={styles.eyebrowLine} />
        </div>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        <div className={styles.actions}>
          <Link href="/products" className="btn btn-gold">
            立即選購
            <span style={{ marginLeft: '4px' }}><GoldIcons.ArrowRight /></span>
          </Link>
          <Link href="/products?category=new-arrivals" className="btn btn-outline-gold">
            查看新品
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollIndicator}>
          <span>向下探索</span>
          <div className={styles.scrollDot} />
        </div>
      </div>

      {/* Carousel Controls */}
      {hasBanners && banners.length > 1 && (
        <div className={styles.carouselControls}>
          <button className={styles.carouselBtn} onClick={() => goTo((current - 1 + banners.length) % banners.length)}>
            ‹
          </button>
          <div className={styles.dots}>
            {banners.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <button className={styles.carouselBtn} onClick={next}>
            ›
          </button>
        </div>
      )}
    </section>
  );
}
