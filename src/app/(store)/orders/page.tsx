'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import Link from 'next/link';

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
  order_items: OrderItem[];
}

const STATUS_MAP = {
  pending: { label: '待付款', class: styles.statusPending },
  paid: { label: '已付款', class: styles.statusPaid },
  processing: { label: '處理中', class: styles.statusProc },
  shipped: { label: '已出貨', class: styles.statusShip },
  completed: { label: '已完成', class: styles.statusComp },
  cancelled: { label: '已取消', class: styles.statusCancel },
};

export default function OrdersPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            total_amount,
            shipping_address,
            created_at,
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
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders((data as any) ?? []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading || !user) {
    return (
      <div className={styles.loading}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: '2rem' }}>
          我的 <span className="gold-text">會員中心</span>
        </h1>

        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={`glass ${styles.sidebar}`}>
            <div className={styles.avatarArea}>
              <div className={styles.avatar}>{(profile?.name ?? '').slice(0, 1) || user.email?.slice(0, 1).toUpperCase()}</div>
              <div>
                <p className={styles.sidebarName}>{profile?.name || '未設定姓名'}</p>
                <p className={styles.sidebarEmail}>{user.email}</p>
                {profile?.role === 'admin' && (
                  <span className="badge badge-gold" style={{ marginTop: '0.4rem' }}>管理員</span>
                )}
              </div>
            </div>
            <nav className={styles.nav}>
              <Link href="/profile" className={styles.navLink}>
                👤 個人資料
              </Link>
              <Link href="/orders" className={`${styles.navLink} ${styles.navActive}`}>
                📦 我的訂單
              </Link>
              {profile?.role === 'admin' && (
                <Link href="/admin" className={styles.navLink}>
                  🛠️ 後台管理系統
                </Link>
              )}
            </nav>
          </aside>

          {/* Orders Content */}
          <main className={`glass ${styles.content}`}>
            <h2 className={styles.sectionHeader}>我的訂單紀錄</h2>
            <hr className="gold-divider" style={{ margin: '1rem 0 2rem' }} />

            {fetching ? (
              <div className={styles.innerLoading}>
                <div className="spinner" />
              </div>
            ) : orders.length === 0 ? (
              <div className={styles.empty}>
                <p>尚無任何訂單紀錄</p>
                <Link href="/products" className="btn btn-gold" style={{ marginTop: '1.5rem' }}>
                  開始選購商品
                </Link>
              </div>
            ) : (
              <div className={styles.orderList}>
                {orders.map(order => {
                  const statusInfo = STATUS_MAP[order.status] || { label: order.status, class: '' };
                  return (
                    <div key={order.id} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <div>
                          <p className={styles.orderId}>訂單編號: {order.id.slice(0, 8).toUpperCase()}</p>
                          <p className={styles.orderDate}>
                            訂購時間: {new Date(order.created_at).toLocaleString('zh-TW')}
                          </p>
                        </div>
                        <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
                      </div>

                      <div className={styles.orderBody}>
                        {order.order_items?.map(item => (
                          <div key={item.id} className={styles.orderItem}>
                            <div className={styles.itemThumb}>
                              {item.products?.image_url ? (
                                <img src={item.products.image_url} alt={item.products.name} className={styles.thumbImg} />
                              ) : (
                                <div className={styles.thumbPlaceholder} />
                              )}
                            </div>
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

                      <div className={styles.orderFooter}>
                        <p className={styles.shippingAddress}>
                          📍 配送地址: {order.shipping_address || '未提供'}
                        </p>
                        <p className={styles.orderTotal}>
                          總金額: <span className={styles.totalAmt}>NT$ {Number(order.total_amount).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
