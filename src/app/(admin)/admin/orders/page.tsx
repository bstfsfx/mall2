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
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
      
      // Update selected order if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
      
    } catch (err: any) {
      console.error(err);
      alert(`更新狀態失敗: ${err.message}`);
    }
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);
    
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return styles.statusPending;
      case 'paid': return styles.statusPaid;
      case 'processing': return styles.statusProcessing;
      case 'shipped': return styles.statusShipped;
      case 'completed': return styles.statusCompleted;
      case 'cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

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

      {/* Orders Table */}
      <div className={`glass ${styles.tableCard}`}>
        <h3 className={styles.cardTitle}>訂單交易清單</h3>
        
        {loading ? (
          <div className={styles.loading}>
            <div className="spinner" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <p className={styles.empty}>找不到符合狀態的訂單</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>訂單編號</th>
                  <th>訂購日期</th>
                  <th>收件人姓名</th>
                  <th>應付總額</th>
                  <th>付款方式</th>
                  <th>訂單狀態</th>
                  <th>管理操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const dateStr = new Date(order.created_at);
                  const formattedDate = `${dateStr.getFullYear()}/${String(dateStr.getMonth()+1).padStart(2, '0')}/${String(dateStr.getDate()).padStart(2, '0')} ${String(dateStr.getHours()).padStart(2, '0')}:${String(dateStr.getMinutes()).padStart(2, '0')}`;
                  
                  return (
                    <tr key={order.id}>
                      <td><span className={styles.orderId}>VIBE-{order.id.split('-')[0].toUpperCase()}</span></td>
                      <td><span className={styles.dateText}>{formattedDate}</span></td>
                      <td>{order.profiles?.name ?? 'Test User'}</td>
                      <td><span className={styles.amountText}>NT$ {Number(order.total_amount).toLocaleString()}</span></td>
                      <td><span className={styles.paymentText}>貨到付款</span></td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button className={styles.editBtn} onClick={() => setSelectedOrder(order)}>
                          查看與編輯
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={`glass ${styles.formCard}`} onClick={e => e.stopPropagation()}>
            <div className={styles.formHeader}>
              <h3>📝 訂單詳情 (VIBE-{selectedOrder.id.split('-')[0].toUpperCase()})</h3>
              <button className={styles.closeModal} onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <hr className="gold-divider" style={{ margin: '1rem 0' }} />
            
            <div className={styles.orderDetailSection}>
              <h4>變更訂單狀態</h4>
              <select
                value={selectedOrder.status}
                onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                className={styles.select}
              >
                <option value="pending">待付款 (PENDING)</option>
                <option value="paid">已付款 (PAID)</option>
                <option value="processing">處理中 (PROCESSING)</option>
                <option value="shipped">已出貨 (SHIPPED)</option>
                <option value="completed">已完成 (COMPLETED)</option>
                <option value="cancelled">已取消 (CANCELLED)</option>
              </select>
            </div>
            
            <div className={styles.orderDetailSection}>
              <h4>顧客與配送資訊</h4>
              <div className={styles.infoBlock}>
                <p><strong>顧客姓名：</strong> {selectedOrder.profiles?.name ?? 'Test User'}</p>
                <p><strong>下單時間：</strong> {new Date(selectedOrder.created_at).toLocaleString('zh-TW')}</p>
                <p><strong>付款方式：</strong> 貨到付款</p>
                <p style={{ marginTop: '0.5rem' }}><strong>配送地址：</strong><br/>{selectedOrder.shipping_address || '無收件人資訊'}</p>
              </div>
            </div>

            <div className={styles.orderDetailSection}>
              <h4>訂購商品清單</h4>
              <div className={styles.infoBlock}>
                <div className={styles.items}>
                  {selectedOrder.order_items?.map(item => (
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
                <hr style={{ border: 'none', borderTop: '1px dashed var(--border-subtle)', margin: '1rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>實收總額</strong>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold-light)' }}>
                    NT$ {Number(selectedOrder.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button className="btn btn-gold" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setSelectedOrder(null)}>
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
