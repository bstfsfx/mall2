'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { GoldIcons } from '@/components/ui/GoldIcons';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { items, itemCount, total, removeItem, updateQty, clearCart, isOpen, closeCart } = useCart();

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`} onClick={closeCart} />

      {/* Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`} role="dialog" aria-label="購物車">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>購物車</h2>
            {itemCount > 0 && <p className={styles.count}>{itemCount} 件商品</p>}
          </div>
          <button className={styles.closeBtn} onClick={closeCart} aria-label="關閉">
            <GoldIcons.Close />
          </button>
        </div>

        <hr className="gold-divider" style={{ margin: '0' }} />

        {/* Items */}
        <div className={styles.items}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}><GoldIcons.Cart /></div>
              <p>購物車是空的</p>
              <Link href="/products" className="btn btn-outline-gold" onClick={closeCart} style={{ marginTop: '1rem' }}>
                去選購
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className={styles.imagePlaceholder} />
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemPrice}>NT$ {item.price.toLocaleString()}</p>
                  <div className={styles.qtyControls}>
                    <button onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button className={styles.removeBtn} onClick={() => removeItem(item.id)} aria-label="移除">
                  <GoldIcons.Close />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>小計</span>
              <span className={styles.totalAmt}>NT$ {total.toLocaleString()}</span>
            </div>
            <p className={styles.shippingNote}>運費於結帳時計算</p>
            <Link href="/checkout" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={closeCart}>
              前往結帳
            </Link>
            <button className={styles.clearBtn} onClick={clearCart}>清空購物車</button>
          </div>
        )}
      </div>
    </>
  );
}
