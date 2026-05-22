'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import Link from 'next/link';

export default function CheckoutPage() {
  const { user, profile, loading } = useAuth();
  const { items, total, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  // Autofill if profile exists
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setPhone(profile.phone ?? '');
      setAddress(profile.address ?? '');
    }
  }, [profile]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" />
      </div>
    );
  }

  // Require auth to checkout
  if (!user) {
    return (
      <div className={styles.page}>
        <div className={`container ${styles.authPromptContainer}`}>
          <div className={`glass ${styles.authPromptCard}`}>
            <h2>🔑 需要先登入帳號</h2>
            <p>請先登入或註冊會員以完成結帳流程。</p>
            <div className={styles.promptBtns}>
              <Link href="/login?redirect=/checkout" className="btn btn-gold">立即登入</Link>
              <Link href="/signup" className="btn btn-ghost">註冊新會員</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (successOrderId) {
    return (
      <div className={styles.page}>
        <div className={`container ${styles.successContainer}`}>
          <div className={`glass ${styles.successCard}`}>
            <span className={styles.successIcon}>🎉</span>
            <h1 className="gold-text">感謝您的訂購！</h1>
            <p className={styles.orderId}>您的訂單編號是：{successOrderId.toUpperCase()}</p>
            <p className={styles.successMsg}>我們已收到您的訂單，將會盡快處理與出貨。</p>
            <div className={styles.promptBtns} style={{ marginTop: '2rem' }}>
              <Link href="/orders" className="btn btn-gold">查看訂單紀錄</Link>
              <Link href="/products" className="btn btn-ghost">繼續選購</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className={`container ${styles.emptyContainer}`}>
          <h2>🛒 您的購物車是空的</h2>
          <p>請先將商品加入購物車再進行結帳。</p>
          <Link href="/products" className="btn btn-gold" style={{ marginTop: '1.5rem' }}>
            前往商品列表
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          shipping_address: `${name} | ${phone} | ${address}`,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Update products stock
      await Promise.all(items.map(async item => {
        // Fetch current product stock
        const { data: prod } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();
        
        if (prod) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.id);
        }
      }));

      // 4. Success
      setSuccessOrderId(order.id);
      clearCart();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err?.message ?? '結帳時發生錯誤，請稍後再試。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: '2.5rem' }}>
          確認 <span className="gold-text">訂單與結帳</span>
        </h1>

        <div className={styles.layout}>
          {/* Form */}
          <form onSubmit={handleSubmit} className={`glass ${styles.form}`}>
            <h2>📍 收件人資訊</h2>
            <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.group}>
              <label htmlFor="chkName">收件人姓名</label>
              <input
                id="chkName"
                type="text"
                className="input"
                placeholder="請輸入收件人姓名"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles.group}>
              <label htmlFor="chkPhone">收件人電話</label>
              <input
                id="chkPhone"
                type="tel"
                className="input"
                placeholder="請輸入收件人電話"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>

            <div className={styles.group}>
              <label htmlFor="chkAddress">收件配送地址</label>
              <textarea
                id="chkAddress"
                className="input"
                placeholder="請輸入完整收件地址 (包含縣市與郵遞區號)"
                value={address}
                onChange={e => setAddress(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className={styles.paymentMethod}>
              <h3>💳 付款方式</h3>
              <div className={styles.payOption}>
                <input type="radio" id="cod" name="payment" defaultChecked />
                <label htmlFor="cod">
                  <strong>貨到付款</strong>
                  <p>商品送達時，以現金支付給配送人員。</p>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '1.5rem' }} disabled={submitting}>
              {submitting ? '正送出訂單...' : `確認付款並送出訂單 (NT$ ${total.toLocaleString()})`}
            </button>
          </form>

          {/* Cart Summary */}
          <aside className={`glass ${styles.summary}`}>
            <h2>🛍️ 訂單商品明細</h2>
            <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />

            <div className={styles.summaryItems}>
              {items.map(item => (
                <div key={item.id} className={styles.summaryItem}>
                  <div className={styles.itemThumb}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <div className={styles.thumbPlaceholder} />
                    )}
                  </div>
                  <div className={styles.itemDetails}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemMeta}>NT$ {item.price.toLocaleString()} × {item.quantity}</p>
                  </div>
                  <p className={styles.itemPrice}>NT$ {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <hr className="gold-divider" style={{ margin: '1.5rem 0' }} />

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>商品小計</span>
                <span>NT$ {total.toLocaleString()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>運費</span>
                <span className={total >= 1500 ? styles.freeShipping : ''}>
                  {total >= 1500 ? '免運費' : 'NT$ 100'}
                </span>
              </div>
              <hr className="gold-divider" style={{ opacity: 0.3, margin: '1rem 0' }} />
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>總計金額</span>
                <span>NT$ {(total >= 1500 ? total : total + 100).toLocaleString()}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
