'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  slug: string;
  status: string;
  stock: number;
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className={styles.loading} style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') ?? '';

  const [inputVal, setInputVal] = useState(q);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInputVal(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image_url, slug, status, stock')
          .eq('status', 'active')
          .ilike('name', `%${q}%`);

        if (error) throw error;
        setResults(data ?? []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [q]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputVal.trim())}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: '2.5rem' }}>
          搜尋 <span className="gold-text">商品</span>
        </h1>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <input
            type="text"
            className={`input ${styles.searchInput}`}
            placeholder="輸入商品名稱，例如：帽T、外套..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
          />
          <button type="submit" className="btn btn-gold">
            搜尋
          </button>
        </form>

        <hr className="gold-divider" style={{ margin: '3rem 0' }} />

        {/* Results */}
        {loading ? (
          <div className={styles.loading}>
            <div className="spinner" />
          </div>
        ) : q.trim() === '' ? (
          <div className={styles.empty}>
            <p>請輸入關鍵字開始搜尋商品</p>
          </div>
        ) : results.length === 0 ? (
          <div className={styles.empty}>
            <p>找不到與「{q}」符合的商品</p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              試試其他關鍵字，或者瀏覽我們的最新單品。
            </p>
          </div>
        ) : (
          <div>
            <p className={styles.resultsCount}>找到 {results.length} 個與「{q}」相關的商品</p>
            <div className={styles.grid}>
              {results.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
