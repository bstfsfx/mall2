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
  
  // Logistics & Payments fields
  shipping_method: 'blackcat' | 'hsinchu' | null;
  shipping_fee: number;
  payment_method: 'bank_transfer' | 'ecpay' | null;
  payment_status: 'unpaid' | 'paid' | 'refunding' | 'refunded';
  shipping_status: 'pending' | 'processing' | 'shipped' | 'delivered';
  tracking_number: string | null;
  payment_details: any;

  profiles: {
    name: string | null;
    id: string;
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

  // Editing tracking number state inside modal
  const [editTrackingNum, setEditTrackingNum] = useState('');

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
          shipping_method,
          shipping_fee,
          payment_method,
          payment_status,
          shipping_status,
          tracking_number,
          payment_details,
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

  // Update specific fields of an order
  const handleUpdateOrderDetails = async (
    orderId: string,
    updates: {
      status?: string;
      payment_status?: string;
      shipping_status?: string;
      tracking_number?: string | null;
    }
  ) => {
    try {
      const { error: updateErr } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      // Update local state
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, ...updates } as any : o))
      );
      
      // Update selected order if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updates } as any);
      }
      
    } catch (err: any) {
      console.error(err);
      alert(`更新失敗: ${err.message}`);
    }
  };

  // Pre-fill tracking number when selectedOrder is opened
  useEffect(() => {
    if (selectedOrder) {
      setEditTrackingNum(selectedOrder.tracking_number ?? '');
    } else {
      setEditTrackingNum('');
    }
  }, [selectedOrder]);

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

  const getLogisticsText = (method: string | null) => {
    if (method === 'blackcat') return '🐈 黑貓宅急便';
    if (method === 'hsinchu') return '🚛 新竹貨運';
    return '無指定';
  };

  const getPaymentText = (method: string | null) => {
    if (method === 'bank_transfer') return '🏦 銀行轉帳';
    if (method === 'ecpay') return '🛡️ 綠界信用卡';
    return '貨到付款';
  };

  const getPaymentStatusText = (status: string) => {
    if (status === 'paid') return '🟢 已付款';
    if (status === 'unpaid') return '🔴 未付款';
    if (status === 'refunding') return '🟡 退款中';
    if (status === 'refunded') return '⚪ 已退款';
    return '🔴 未付款';
  };

  const getShippingStatusText = (status: string) => {
    if (status === 'pending') return '⏳ 準備中';
    if (status === 'processing') return '📦 處理中';
    if (status === 'shipped') return '🚚 已出貨';
    if (status === 'delivered') return '✅ 已送達';
    return '⏳ 準備中';
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
                  <th>應付金額</th>
                  <th>金流方式</th>
                  <th>物流方案</th>
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
                      <td><span className={styles.paymentText}>{getPaymentText(order.payment_method)}</span></td>
                      <td><span className={styles.paymentText}>{getLogisticsText(order.shipping_method)}</span></td>
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
          <div className={`glass ${styles.formCard}`} onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className={styles.formHeader}>
              <h3>📝 訂單詳情 (VIBE-{selectedOrder.id.split('-')[0].toUpperCase()})</h3>
              <button className={styles.closeModal} onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <hr className="gold-divider" style={{ margin: '1rem 0' }} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Order Status Column */}
              <div className={styles.orderDetailSection}>
                <h4>⚙️ 變更訂單狀態</h4>
                <div className={styles.formGroup} style={{ marginBottom: '0.75rem' }}>
                  <label>主訂單狀態</label>
                  <select
                    value={selectedOrder.status}
                    onChange={e => handleUpdateOrderDetails(selectedOrder.id, { status: e.target.value })}
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

                <div className={styles.formGroup} style={{ marginBottom: '0.75rem' }}>
                  <label>金流收款狀態 ({getPaymentStatusText(selectedOrder.payment_status)})</label>
                  <select
                    value={selectedOrder.payment_status || 'unpaid'}
                    onChange={e => handleUpdateOrderDetails(selectedOrder.id, { payment_status: e.target.value })}
                    className={styles.select}
                  >
                    <option value="unpaid">🔴 未付款 (UNPAID)</option>
                    <option value="paid">🟢 已付款 (PAID)</option>
                    <option value="refunding">🟡 退款中 (REFUNDING)</option>
                    <option value="refunded">⚪ 已退款 (REFUNDED)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>物流出貨狀態 ({getShippingStatusText(selectedOrder.shipping_status)})</label>
                  <select
                    value={selectedOrder.shipping_status || 'pending'}
                    onChange={e => handleUpdateOrderDetails(selectedOrder.id, { shipping_status: e.target.value })}
                    className={styles.select}
                  >
                    <option value="pending">⏳ 準備中 (PENDING)</option>
                    <option value="processing">📦 處理中 (PROCESSING)</option>
                    <option value="shipped">🚚 已出貨 (SHIPPED)</option>
                    <option value="delivered">✅ 已送達 (DELIVERED)</option>
                  </select>
                </div>
              </div>

              {/* Logistics & Tracking Column */}
              <div className={styles.orderDetailSection}>
                <h4>📦 物流單號管理</h4>
                
                <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                  <label>物流方式</label>
                  <input type="text" className="input" value={getLogisticsText(selectedOrder.shipping_method)} disabled />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="trackingInput">物流配送單號 (Tracking Number)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      id="trackingInput"
                      type="text"
                      className="input"
                      placeholder="請輸入貨運追蹤單號..."
                      value={editTrackingNum}
                      onChange={e => setEditTrackingNum(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-gold btn-sm"
                      onClick={() => handleUpdateOrderDetails(selectedOrder.id, { tracking_number: editTrackingNum || null })}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                      更新
                    </button>
                  </div>
                </div>

                {selectedOrder.tracking_number && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '0.5rem' }}>
                    ✅ 已指派單號：<strong style={{ fontFamily: 'monospace' }}>{selectedOrder.tracking_number}</strong>
                  </p>
                )}
              </div>
            </div>
            
            <div className={styles.orderDetailSection} style={{ marginBottom: '1.5rem' }}>
              <h4>👤 顧客與收件資訊</h4>
              <div className={styles.infoBlock}>
                <p><strong>收件姓名：</strong> {selectedOrder.profiles?.name ?? '未知'}</p>
                <p><strong>金流管道：</strong> {getPaymentText(selectedOrder.payment_method)} ({selectedOrder.payment_status?.toUpperCase() || 'UNPAID'})</p>
                <p><strong>物流費用：</strong> NT$ {Number(selectedOrder.shipping_fee ?? 0).toLocaleString()} 元</p>
                <p style={{ marginTop: '0.5rem' }}><strong>收件地址：</strong><br/>{selectedOrder.shipping_address || '無收件人資訊'}</p>
              </div>
            </div>

            <div className={styles.orderDetailSection} style={{ marginBottom: '1rem' }}>
              <h4>🛍️ 訂購商品明細</h4>
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
                  <strong>應付總額 (含運費)</strong>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold-light)' }}>
                    NT$ {Number(selectedOrder.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button className="btn btn-gold" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setSelectedOrder(null)}>
              確認完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
