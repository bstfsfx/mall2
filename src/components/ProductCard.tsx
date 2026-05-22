'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import styles from './ProductCard.module.css';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  slug: string;
  status: string;
  stock: number;
}

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem, openCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={styles.card}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Image */}
      <div className={styles.imageWrap}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>No Image</span>
          </div>
        )}

        {/* Overlay with Add to Cart */}
        <div className={styles.overlay}>
          <button className={styles.addBtn} onClick={handleAddToCart}>
            加入購物車
          </button>
        </div>

        {/* Out of stock */}
        {product.stock === 0 && (
          <div className={styles.soldOut}>已售完</div>
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>NT$ {product.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}
