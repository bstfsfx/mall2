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
  shipping_method: string | null;
  payment_method: string | null;
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

  // Segmented Report stats
  const [paymentReports, setPaymentReports] = useState({
    bank_transfer: { count: 0, total: 0 },
    ecpay: { count: 0, total: 0 },
    cod: { count: 0, total: 0 }
  });

  const [logisticsReports, setLogisticsReports] = useState({
    blackcat: { count: 0, total: 0 },
    hsinchu: { count: 0, total: 0 },
    none: { count: 0, total: 0 }
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

        // 3. Get orders for calculations & reports
        const { data: allOrders } = await supabase
          .from('orders')
          .select('total_amount, status, payment_method, shipping_method');

        const totalSales = allOrders?.reduce((sum, o) => {
          return sum + (o.status !== 'cancelled' ? Number(o.total_amount) : 0);
        }, 0) ?? 0;

        setStats({
          sales: totalSales,
          orders: allOrders?.length ?? 0,
          products: prodCount ?? 0,
          users: profileCount ?? 0,
        });

        // 4. Calculate Payment & Logistics reports
        const paymentStats = {
          bank_transfer: { count: 0, total: 0 },
          ecpay: { count: 0, total: 0 },
          cod: { count: 0, total: 0 }
        };

        const logisticsStats = {
          blackcat: { count: 0, total: 0 },
          hsinchu: { count: 0, total: 0 },
          none: { count: 0, total: 0 }
        };

        allOrders?.forEach(o => {
          const isCancelled = o.status === 'cancelled';
          const amt = Number(o.total_amount) || 0;
          
          // Payment aggregation
          const payMethod = ((o.payment_method === 'bank_transfer' || o.payment_method === 'ecpay')
            ? o.payment_method
            : 'cod') as keyof typeof paymentStats;

          paymentStats[payMethod].count += 1;
          if (!isCancelled) {
            paymentStats[payMethod].total += amt;
          }

          // Logistics aggregation
          const shipMethod = ((o.shipping_method === 'blackcat' || o.shipping_method === 'hsinchu')
            ? o.shipping_method
            : 'none') as keyof typeof logisticsStats;

          logisticsStats[shipMethod].count += 1;
          if (!isCancelled) {
            logisticsStats[shipMethod].total += amt;
          }
        });

        setPaymentReports(paymentStats);
        setLogisticsReports(logisticsStats);

        // 5. Fetch recent orders
        const { data: recent } = await supabase
          .from('orders')
          .select('id, created_at, total_amount, status, shipping_method, payment_method, profiles(name)')
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

      {/* Segmented Reports Section */}
      <div className={styles.reportSection}>
        {/* Payment Report Card */}
        <div className={`glass ${styles.reportCard}`}>
          <h3>💳 系統金流營收分析 (未扣除取消單)</h3>
          <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />
          <div className={styles.reportGrid}>
            <div className={styles.reportRow}>
              <span>🏦 銀行ATM轉帳/匯款：</span>
              <strong>NT$ {paymentReports.bank_transfer.total.toLocaleString()} 元 ({paymentReports.bank_transfer.count} 筆)</strong>
            </div>
            <div className={styles.reportRow}>
              <span>🛡️ 綠界信用卡線上支付：</span>
              <strong>NT$ {paymentReports.ecpay.total.toLocaleString()} 元 ({paymentReports.ecpay.count} 筆)</strong>
            </div>
            <div className={styles.reportRow}>
              <span>💵 貨到付款 (COD)：</span>
              <strong>NT$ {paymentReports.cod.total.toLocaleString()} 元 ({paymentReports.cod.count} 筆)</strong>
            </div>
          </div>
        </div>

        {/* Logistics Report Card */}
        <div className={`glass ${styles.reportCard}`}>
          <h3>🚚 系統物流方案分析</h3>
          <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />
          <div className={styles.reportGrid}>
            <div className={styles.reportRow}>
              <span>🐈 黑貓宅急便配送：</span>
              <strong>NT$ {logisticsReports.blackcat.total.toLocaleString()} 元 ({logisticsReports.blackcat.count} 筆)</strong>
            </div>
            <div className={styles.reportRow}>
              <span>🚛 新竹貨運配送：</span>
              <strong>NT$ {logisticsReports.hsinchu.total.toLocaleString()} 元 ({logisticsReports.hsinchu.count} 筆)</strong>
            </div>
            <div className={styles.reportRow}>
              <span>📦 門市/無指定配送：</span>
              <strong>NT$ {logisticsReports.none.total.toLocaleString()} 元 ({logisticsReports.none.count} 筆)</strong>
            </div>
          </div>
        </div>
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
                  <th>金流方式</th>
                  <th>物流方案</th>
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
                    <td>{o.payment_method === 'bank_transfer' ? '銀行轉帳' : o.payment_method === 'ecpay' ? '綠界信用卡' : '貨到付款'}</td>
                    <td>{o.shipping_method === 'blackcat' ? '黑貓宅急便' : o.shipping_method === 'hsinchu' ? '新竹貨運' : '無'}</td>
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
