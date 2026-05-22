'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import Link from 'next/link';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  profiles: {
    name: string | null;
  } | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    sales: 0,
    orders: 0,
    products: 0,
    users: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Get products count
        const { count: prodCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // 2. Get profiles count
        const { count: profileCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // 3. Get orders for calculations
        const { data: allOrders } = await supabase
          .from('orders')
          .select('total_amount, status');

        const totalSales = allOrders?.reduce((sum, o) => {
          return sum + (o.status !== 'cancelled' ? Number(o.total_amount) : 0);
        }, 0) ?? 0;

        setStats({
          sales: totalSales,
          orders: allOrders?.length ?? 0,
          products: prodCount ?? 0,
          users: profileCount ?? 0,
        });

        // 4. Fetch recent orders
        const { data: recent } = await supabase
          .from('orders')
          .select('id, created_at, total_amount, status, profiles(name)')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentOrders((recent as any) ?? []);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="spinner" />
      </div>
    );
  }

  const cards = [
    { title: '💰 總營業額', value: `NT$ ${stats.sales.toLocaleString()}`, color: styles.cardGold },
    { title: '📦 訂單總數', value: `${stats.orders} 筆`, color: styles.cardBlue },
    { title: '👕 在架商品', value: `${stats.products} 件`, color: styles.cardGreen },
    { title: '👥 註冊會員', value: `${stats.users} 人`, color: styles.cardPurple },
  ];

  return (
    <div className={styles.page}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {cards.map(c => (
          <div key={c.title} className={`glass ${styles.statCard} ${c.color}`}>
            <p className={styles.cardTitle}>{c.title}</p>
            <p className={styles.cardValue}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className={`glass ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h3>📝 最近訂單</h3>
          <Link href="/admin/orders" className="btn btn-outline-gold btn-sm" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}>
            管理所有訂單
          </Link>
        </div>
        <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />

        {recentOrders.length === 0 ? (
          <p className={styles.empty}>目前沒有任何訂單</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>訂單編號</th>
                  <th>顧客姓名</th>
                  <th>訂購日期</th>
                  <th>訂單金額</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td className={styles.orderId}>{o.id.slice(0, 8).toUpperCase()}</td>
                    <td>{o.profiles?.name ?? '未知'}</td>
                    <td>{new Date(o.created_at).toLocaleDateString('zh-TW')}</td>
                    <td className={styles.amount}>NT$ {Number(o.total_amount).toLocaleString()}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${
                        o.status === 'completed' ? styles.statusComp :
                        o.status === 'cancelled' ? styles.statusCancel :
                        o.status === 'shipped' ? styles.statusShip :
                        styles.statusPending
                      }`}>
                        {o.status === 'pending' ? '待付款' :
                         o.status === 'paid' ? '已付款' :
                         o.status === 'processing' ? '處理中' :
                         o.status === 'shipped' ? '已出貨' :
                         o.status === 'completed' ? '已完成' : '已取消'}
                      </span>
                    </td>
                    <td>
                      <Link href="/admin/orders" className={styles.actionBtn}>
                        查看
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
