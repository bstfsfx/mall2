import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { CATEGORIES } from '@/components/ui/GoldIcons';
import styles from './page.module.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '全部商品 | mall2',
  description: '探索 mall2 所有潮流服飾，尋找你的風格',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const { category, sort } = params;

  let query = supabase.from('products').select('*, categories(name, slug)').eq('status', 'active');

  if (category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data: products } = await query;

  const activeCategory = CATEGORIES.find(c => c.slug === category);

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <p className="section-eyebrow">Collections</p>
            <h1 className="section-title">
              {activeCategory ? activeCategory.label : '全部商品'}
            </h1>
          </div>
          <div className={styles.sortBar}>
            <span className={styles.sortLabel}>排序：</span>
            {[
              { value: '', label: '最新' },
              { value: 'price_asc', label: '價格低到高' },
              { value: 'price_desc', label: '價格高到低' },
            ].map(o => (
              <Link
                key={o.value}
                href={`/products?${category ? `category=${category}&` : ''}sort=${o.value}`}
                className={`${styles.sortBtn} ${(!sort && !o.value) || sort === o.value ? styles.sortActive : ''}`}
              >
                {o.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <h3 className={styles.filterTitle}>分類</h3>
            <nav className={styles.catList}>
              <Link href="/products" className={`${styles.catLink} ${!category ? styles.catActive : ''}`}>
                全部商品
              </Link>
              {CATEGORIES.map(c => (
                <Link
                  key={c.slug}
                  href={`/products?category=${c.slug}`}
                  className={`${styles.catLink} ${category === c.slug ? styles.catActive : ''}`}
                >
                  {c.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Products */}
          <div className={styles.grid}>
            {!products || products.length === 0 ? (
              <div className={styles.empty}>
                <p>此分類暫無商品</p>
                <Link href="/products" className="btn btn-outline-gold" style={{ marginTop: '1rem' }}>查看全部</Link>
              </div>
            ) : (
              products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
