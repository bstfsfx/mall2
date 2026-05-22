'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  products: {
    name: string;
    image_url: string | null;
  } | null;
}

interface Order {
  id: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  total_amount: number;
  shipping_address: string | null;
  created_at: string;
  profiles: {
    name: string | null;
    email: string | null;
  } | null;
  order_items: OrderItem[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          shipping_address,
          created_at,
          profiles (
            name,
            id
          ),
          order_items (
            id,
            quantity,
            price_at_time,
            products (
              name,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      // We need to fetch email from auth.users, but Profiles doesn't store email.
      // We can just rely on profiles.name. To get email, we can query profiles which doesn't have email. That's fine,
      // we can display their name or user ID. Let's cast profiles name correctly.
      setOrders((data as any) ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '讀取訂單失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      // Update local state
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
    } catch (err: any) {
      console.error(err);
      alert(`更新狀態失敗: ${err.message}`);
    }
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  return (
    <div className={styles.page}>
      {/* Filter Row */}
      <div className={styles.filterRow}>
        <span className={styles.filterLabel}>篩選訂單狀態：</span>
        <div className={styles.filterGroup}>
          {[
            { value: 'all', label: '全部' },
            { value: 'pending', label: '待付款' },
            { value: 'paid', label: '已付款' },
            { value: 'processing', label: '處理中' },
            { value: 'shipped', label: '已出貨' },
            { value: 'completed', label: '已完成' },
            { value: 'cancelled', label: '已取消' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`${styles.filterBtn} ${statusFilter === opt.value ? styles.filterActive : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Orders List */}
      {loading ? (
        <div className={styles.loading}>
          <div className="spinner" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className={styles.empty}>找不到符合狀態的訂單</p>
      ) : (
        <div className={styles.orderList}>
          {filteredOrders.map(order => (
            <div key={order.id} className={`glass ${styles.orderCard}`}>
              <div className={styles.orderHeader}>
                <div>
                  <h4 className={styles.orderId}>訂單編號: {order.id.toUpperCase()}</h4>
                  <p className={styles.orderMeta}>
                    🕒 下單時間: {new Date(order.created_at).toLocaleString('zh-TW')} | 👤 顧客: {order.profiles?.name ?? '未知'}
                  </p>
                </div>
                <div className={styles.statusSelect}>
                  <label htmlFor={`status-${order.id}`} style={{ marginRight: '0.5rem', display: 'inline', fontSize: '0.82rem' }}>變更狀態：</label>
                  <select
                    id={`status-${order.id}`}
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    className={styles.select}
                  >
                    <option value="pending">待付款</option>
                    <option value="paid">已付款</option>
                    <option value="processing">處理中</option>
                    <option value="shipped">已出貨</option>
                    <option value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                  </select>
                </div>
              </div>

              <div className={styles.orderBody}>
                {/* Items list */}
                <div className={styles.items}>
                  {order.order_items?.map(item => (
                    <div key={item.id} className={styles.item}>
                      <div className={styles.itemDetails}>
                        <p className={styles.itemName}>{item.products?.name ?? '未知商品'}</p>
                        <p className={styles.itemMeta}>
                          NT$ {Number(item.price_at_time).toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <p className={styles.itemSubtotal}>
                        NT$ {(Number(item.price_at_time) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment summary */}
                <div className={styles.summary}>
                  <p className={styles.shippingAddress}>
                    <strong>📍 配送資訊:</strong> {order.shipping_address || '無收件人資訊'}
                  </p>
                  <div className={styles.amountWrap}>
                    <span className={styles.totalLabel}>實收總額</span>
                    <span className={styles.totalAmt}>NT$ {Number(order.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
