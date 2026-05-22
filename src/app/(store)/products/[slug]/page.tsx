'use client';

import { useState } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';
import Link from 'next/link';

interface Product {
  id: string; name: string; price: number; description: string | null;
  image_url: string | null; images: string[]; stock: number; slug: string; status: string;
  categories: { name: string; slug: string } | null;
}

async function getProduct(slug: string): Promise<Product | null> {
  const { data } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  return data as Product | null;
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return <ProductDetailClient slug={params.slug} />;
}

// Client component for interactivity
function ProductDetailClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  if (product === undefined) {
    getProduct(slug).then(p => {
      setProduct(p);
      if (!p) notFound();
    });
    return (
      <div className={styles.loading}>
        <div className="spinner" />
      </div>
    );
  }
  if (!product) return null;

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean) as string[];
  const [activeImg, setActiveImg] = useState(0);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">首頁</Link>
          <span>›</span>
          <Link href="/products">商品</Link>
          {product.categories && <>
            <span>›</span>
            <Link href={`/products?category=${product.categories.slug}`}>{product.categories.name}</Link>
          </>}
          <span>›</span>
          <span>{product.name}</span>
        </nav>

        <div className={styles.layout}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {allImages[activeImg] ? (
                <Image src={allImages[activeImg]} alt={product.name} fill style={{ objectFit: 'cover' }} priority />
              ) : (
                <div className={styles.imgPlaceholder}>No Image</div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className={styles.thumbnails}>
                {allImages.map((img, i) => (
                  <button key={i} className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`} onClick={() => setActiveImg(i)}>
                    <Image src={img} alt={`${product.name} ${i+1}`} fill style={{ objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            {product.categories && (
              <Link href={`/products?category=${product.categories.slug}`} className={styles.catBadge}>
                {product.categories.name}
              </Link>
            )}
            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.price}>NT$ {product.price.toLocaleString()}</p>
            <hr className="gold-divider" />
            {product.description && <p className={styles.desc}>{product.description}</p>}

            {/* Qty & Add to Cart */}
            {product.stock > 0 ? (
              <>
                <div className={styles.qtyRow}>
                  <span className={styles.qtyLabel}>數量</span>
                  <div className={styles.qtyControls}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                  </div>
                  <span className={styles.stock}>剩餘 {product.stock} 件</span>
                </div>
                <button className={`btn btn-gold ${styles.addBtn}`} onClick={handleAddToCart}>
                  {added ? '✓ 已加入購物車' : '加入購物車'}
                </button>
              </>
            ) : (
              <div className={styles.soldOut}>此商品已售完</div>
            )}

            <div className={styles.features}>
              {[['🚚', '全台免運', '訂單滿 NT$1,500 免運'], ['🔄', '7天退換', '收到商品 7 天內可退換'], ['🔒', '安全付款', '多元安全付款方式']].map(([icon, t, d]) => (
                <div key={t} className={styles.feature}>
                  <span>{icon}</span>
                  <div>
                    <strong>{t}</strong>
                    <p>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
