import { supabase } from '@/lib/supabase';
import HeroBanner from '@/components/HeroBanner';
import CategoryGrid from '@/components/CategoryGrid';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';
import Link from 'next/link';

async function getSiteSettings() {
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .single();
  return data;
}

async function getFeaturedProducts() {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8);
  return data ?? [];
}

export default async function HomePage() {
  const [settings, products] = await Promise.all([
    getSiteSettings(),
    getFeaturedProducts(),
  ]);

  const banners = settings?.hero_banners ?? [];

  return (
    <>
      <HeroBanner
        title={settings?.hero_title ?? undefined}
        subtitle={settings?.hero_subtitle ?? undefined}
        banners={banners}
        logoUrl={settings?.logo_url}
      />

      {/* Category Section */}
      <section className={styles.section}>
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">Shop by Category</p>
            <h2 className="section-title">探索潮流分類</h2>
            <p className="section-subtitle">找到屬於你的風格，從分類開始</p>
          </div>
          <CategoryGrid />
        </div>
      </section>

      {/* Gold Divider */}
      <div className="container"><hr className="gold-divider" /></div>

      {/* Brand Story */}
      <section className={styles.brandSection}>
        <div className="container">
          <div className={styles.brandInner}>
            <div className={styles.brandText}>
              <p className="section-eyebrow">Our Story</p>
              <h2 className={styles.brandTitle}>關於 MALL²</h2>
              <p className={styles.brandLead}>
                MALL² 成立於 2020 年，是一個扎根於台北的獨立服飾平台。
                我們相信穿著不只是表面的打扮，而是自我表達最直接的方式。
              </p>
              <p className={styles.brandBody}>
                從選料到版型，每一個環節都由團隊親自把關。我們與小型工廠合作，支持在地製造，
                並嚴選具有環保意識的供應商。每一件單品在正式上架前，都經過多次穿著測試與修改，
                確保品質經得起時間考驗。
              </p>
              <p className={styles.brandBody}>
                我們不追逐快速的流行週期，只專注於經得起時間的單品。
                MALL² 的名字代表著多元與可能——兩個人，兩種風格，無限組合。
              </p>
              <div className={styles.brandStats}>
                <div className={styles.brandStat}>
                  <span className={styles.statNum}>6+</span>
                  <span className={styles.statLabel}>年在地經營</span>
                </div>
                <div className={styles.brandStat}>
                  <span className={styles.statNum}>200+</span>
                  <span className={styles.statLabel}>精選單品</span>
                </div>
                <div className={styles.brandStat}>
                  <span className={styles.statNum}>15K+</span>
                  <span className={styles.statLabel}>滿意顧客</span>
                </div>
              </div>
            </div>
            <div className={styles.brandVisual}>
              <div className={styles.brandImageWrap}>
                <div className={styles.brandImagePlaceholder}>
                  <span>🏷️</span>
                  <p>在地製造 · 嚴選品質</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionTop}>
            <div>
              <p className="section-eyebrow">New Arrivals</p>
              <h2 className="section-title">最新單品</h2>
            </div>
            <Link href="/products" className="btn btn-outline-gold">查看全部</Link>
          </div>

          {products.length === 0 ? (
            <div className={styles.emptyProducts}>
              <p>商品即將上架，敬請期待</p>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Value Props */}
      <section className={styles.valueSection}>
        <div className="container">
          <div className={styles.valueGrid}>
            {[
              { icon: '🚚', title: '全台免運', desc: '訂單滿 NT$1,500 享免運費配送' },
              { icon: '🔄', title: '7天退換', desc: '收到商品 7 天內，輕鬆退換貨' },
              { icon: '🔒', title: '安全支付', desc: '多種安全付款方式，放心購物' },
              { icon: '💬', title: '線上客服', desc: '週一至週六 10:00–20:00 服務' },
            ].map((v, i) => (
              <div key={i} className={styles.valueCard}>
                <span className={styles.valueIcon}>{v.icon}</span>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
