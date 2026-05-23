'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import Link from 'next/link';

interface SystemSettings {
  blackcat_fee: number;
  hsinchu_fee: number;
  free_shipping_threshold: number;
  blackcat_enabled: boolean;
  hsinchu_enabled: boolean;
  
  // Bank details
  bank_name: string | null;
  bank_code: string | null;
  bank_account: string | null;
  bank_recipient: string | null;

  // ECPay details
  ecpay_merchant_id: string | null;
}

export default function CheckoutPage() {
  const { user, profile, loading } = useAuth();
  const { items, total, clearCart } = useCart();
  const router = useRouter();

  // Form contact inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Shipping & Payment Selections
  const [shippingMethod, setShippingMethod] = useState<'blackcat' | 'hsinchu'>('blackcat');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'ecpay'>('bank_transfer');

  // ECPay Mock Dialog Form
  const [showECPayModal, setShowECPayModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('4311-9522-2222-2222');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [paying, setPaying] = useState(false);

  // System Settings state
  const [settings, setSettings] = useState<SystemSettings>({
    blackcat_fee: 120,
    hsinchu_fee: 100,
    free_shipping_threshold: 1500,
    blackcat_enabled: true,
    hsinchu_enabled: true,
    bank_name: '台灣銀行',
    bank_code: '004',
    bank_account: '1234-5678-9012',
    bank_recipient: '摩爾時尚股份有限公司',
    ecpay_merchant_id: '2000132'
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [successDetails, setSuccessDetails] = useState<{
    orderId: string;
    total: number;
    payment: string;
    shipping: string;
  } | null>(null);

  // Fetch standard logistics and payment settings
  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'global')
          .single();
        if (data && !error) {
          setSettings({
            blackcat_fee: Number(data.blackcat_fee ?? 120),
            hsinchu_fee: Number(data.hsinchu_fee ?? 100),
            free_shipping_threshold: Number(data.free_shipping_threshold ?? 1500),
            blackcat_enabled: data.blackcat_enabled !== false,
            hsinchu_enabled: data.hsinchu_enabled !== false,
            bank_name: data.bank_name ?? '台灣銀行',
            bank_code: data.bank_code ?? '004',
            bank_account: data.bank_account ?? '1234-5678-9012',
            bank_recipient: data.bank_recipient ?? '摩爾時尚股份有限公司',
            ecpay_merchant_id: data.ecpay_merchant_id ?? '2000132'
          });
          
          // Auto fallbacks if one shipping option is disabled
          if (data.blackcat_enabled === false && data.hsinchu_enabled !== false) {
            setShippingMethod('hsinchu');
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSystemSettings();
  }, []);

  // Autofill contact info if profile exists
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

  // Calculate fees dynamically
  const isFreeShipping = total >= settings.free_shipping_threshold;
  const activeShippingFee = isFreeShipping
    ? 0
    : shippingMethod === 'blackcat'
      ? settings.blackcat_fee
      : settings.hsinchu_fee;
  
  const grandTotal = total + activeShippingFee;

  // Checkout submission handler
  const handleCheckoutSubmit = async (e?: React.FormEvent, isECPayPaid = false) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // 1. Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: grandTotal,
          shipping_address: `${name} | ${phone} | ${address}`,
          status: isECPayPaid ? 'paid' : 'pending',
          shipping_method: shippingMethod,
          shipping_fee: activeShippingFee,
          payment_method: paymentMethod,
          payment_status: isECPayPaid ? 'paid' : 'unpaid',
          shipping_status: 'pending',
          payment_details: isECPayPaid ? { ecpay_auth: 'MOCK-ECPAY-SUCCESS', card: cardNumber.slice(-4) } : {}
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

      // 4. Success details
      setSuccessOrderId(order.id);
      setSuccessDetails({
        orderId: order.id,
        total: grandTotal,
        payment: paymentMethod === 'bank_transfer' ? '銀行轉帳/匯款' : '綠界線上信用卡',
        shipping: shippingMethod === 'blackcat' ? '黑貓宅急便' : '新竹貨運'
      });
      clearCart();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err?.message ?? '結帳時發生錯誤，請稍後再試。');
    } finally {
      setSubmitting(false);
      setShowECPayModal(false);
    }
  };

  // Click Submit checkout form
  const handleFormSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'ecpay') {
      setShowECPayModal(true);
    } else {
      handleCheckoutSubmit();
    }
  };

  // Mock ECPay Payment confirm handler
  const handleECPayPaymentConfirm = () => {
    setPaying(true);
    // Simulate gateway delay
    setTimeout(() => {
      setPaying(false);
      handleCheckoutSubmit(undefined, true);
    }, 2000);
  };

  // Render Success Page
  if (successOrderId && successDetails) {
    return (
      <div className={styles.page}>
        <div className={`container ${styles.successContainer}`}>
          <div className={`glass ${styles.successCard}`} style={{ maxWidth: '540px' }}>
            <span className={styles.successIcon}>🎉</span>
            <h1 className="gold-text">感謝您的訂購！</h1>
            <p className={styles.orderId}>訂單編號：{successDetails.orderId.toUpperCase()}</p>
            <p className={styles.successMsg}>我們已收到您的訂單，正在為您安排配送處理。</p>
            
            <div className={styles.bankCard}>
              <h3>📦 訂單明細資訊</h3>
              <div className={styles.bankRow}>
                <span>實收總額：</span>
                <span style={{ color: 'var(--gold-light)' }}>NT$ {successDetails.total.toLocaleString()} 元</span>
              </div>
              <div className={styles.bankRow}>
                <span>金流付款：</span>
                <span>{successDetails.payment}</span>
              </div>
              <div className={styles.bankRow}>
                <span>物流方式：</span>
                <span>{successDetails.shipping}</span>
              </div>

              {/* Show Bank Account details only if Bank Transfer is chosen */}
              {paymentMethod === 'bank_transfer' && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--border)' }}>
                  <h4 style={{ color: 'var(--gold)', fontSize: '0.92rem', marginBottom: '0.75rem' }}>🏦 匯款帳號資料</h4>
                  <div className={styles.bankRow}>
                    <span>匯款銀行：</span>
                    <span>{settings.bank_name} ({settings.bank_code})</span>
                  </div>
                  <div className={styles.bankRow}>
                    <span>收款帳號：</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{settings.bank_account}</span>
                  </div>
                  <div className={styles.bankRow}>
                    <span>帳戶戶名：</span>
                    <span>{settings.bank_recipient}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: '1.4' }}>
                    💡 溫馨提醒：請於 **3天內** 完成轉帳匯款，並至會員專區告知匯款帳號後五碼以利快速出貨。
                  </p>
                </div>
              )}
            </div>

            <div className={styles.promptBtns} style={{ marginTop: '2rem' }}>
              <Link href="/orders" className="btn btn-gold">查看訂單紀錄</Link>
              <Link href="/products" className="btn btn-ghost">繼續選購</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render empty cart prompt
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

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: '2.5rem' }}>
          確認 <span className="gold-text">訂單與結帳</span>
        </h1>

        <div className={styles.layout}>
          {/* Checkout Form */}
          <form onSubmit={handleFormSubmitClick} className={`glass ${styles.form}`}>
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

            {/* Logistics Carriers */}
            <div style={{ marginTop: '2.5rem' }}>
              <h2>🚚 配送物流選擇</h2>
              <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />
              <div className={styles.optionsGrid}>
                {settings.blackcat_enabled && (
                  <div
                    className={`${styles.optionCard} ${shippingMethod === 'blackcat' ? styles.optionCardActive : ''}`}
                    onClick={() => setShippingMethod('blackcat')}
                  >
                    <span className={styles.optionCardTitle}>🐈 黑貓宅急便</span>
                    <span className={styles.optionCardPrice}>
                      {isFreeShipping ? '免運費' : `運費 NT$ ${settings.blackcat_fee}`}
                    </span>
                    <span className={styles.optionCardDesc}>全台快速送達，精準溫控且最貼心的配送體驗。</span>
                  </div>
                )}
                {settings.hsinchu_enabled && (
                  <div
                    className={`${styles.optionCard} ${shippingMethod === 'hsinchu' ? styles.optionCardActive : ''}`}
                    onClick={() => setShippingMethod('hsinchu')}
                  >
                    <span className={styles.optionCardTitle}>🚛 新竹貨運</span>
                    <span className={styles.optionCardPrice}>
                      {isFreeShipping ? '免運費' : `運費 NT$ ${settings.hsinchu_fee}`}
                    </span>
                    <span className={styles.optionCardDesc}>穩定且高性價比的在地物流，配送快速、運費親民。</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{ marginTop: '1rem' }}>
              <h2>💳 付款管道選擇</h2>
              <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />
              <div className={styles.optionsGrid}>
                <div
                  className={`${styles.optionCard} ${paymentMethod === 'bank_transfer' ? styles.optionCardActive : ''}`}
                  onClick={() => setPaymentMethod('bank_transfer')}
                >
                  <span className={styles.optionCardTitle}>🏦 銀行ATM轉帳/匯款</span>
                  <span className={styles.optionCardPrice}>離線支付</span>
                  <span className={styles.optionCardDesc}>系統將提供虛擬帳號，您可隨時利用網路銀行或ATM進行匯款。</span>
                </div>
                <div
                  className={`${styles.optionCard} ${paymentMethod === 'ecpay' ? styles.optionCardActive : ''}`}
                  onClick={() => setPaymentMethod('ecpay')}
                >
                  <span className={styles.optionCardTitle}>🛡️ 綠界 ECPay 信用卡支付</span>
                  <span className={styles.optionCardPrice}>線上付款</span>
                  <span className={styles.optionCardDesc}>由綠界科技第三方安全防護，支援Visa, MasterCard, JCB即時刷卡。</span>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '1.5rem' }} disabled={submitting}>
              {submitting ? '正送出訂單...' : `確認付款並送出訂單 (NT$ ${grandTotal.toLocaleString()})`}
            </button>
          </form>

          {/* Cart Summary Panel */}
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
                <span>物流運費 ({shippingMethod === 'blackcat' ? '黑貓' : '新竹'})</span>
                <span className={isFreeShipping ? styles.freeShipping : ''}>
                  {isFreeShipping ? '免運費' : `NT$ ${activeShippingFee}`}
                </span>
              </div>
              
              {/* Free shipping progress notice */}
              {!isFreeShipping && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '-0.25rem' }}>
                  💡 再買 NT$ {(settings.free_shipping_threshold - total).toLocaleString()} 即享免運優惠！
                </p>
              )}

              <hr className="gold-divider" style={{ opacity: 0.3, margin: '1rem 0' }} />
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>總計金額</span>
                <span>NT$ {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Interactive ECPay Sandbox Payment Dialog Modal */}
      {showECPayModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.ecpayCard}>
            <div className={styles.ecpayHeader}>
              <span className={styles.ecpayLogo}>ECPay 綠界金流</span>
              <span className={styles.ecpayBadge}>測試沙盒環境 (Sandbox)</span>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', textAlign: 'left' }}>
              這是一個模擬綠界線上信用卡交易的防護視窗。請使用以下測試卡號完成訂單支付。
            </p>
            
            <div className={styles.bankCard} style={{ background: 'rgba(52, 211, 153, 0.03)', border: '1px solid rgba(52, 211, 153, 0.15)', marginBottom: '1.5rem' }}>
              <div className={styles.ecpayRow}>
                <span>特店編號：</span>
                <strong>{settings.ecpay_merchant_id}</strong>
              </div>
              <div className={styles.ecpayRow}>
                <span>交易金額：</span>
                <strong style={{ color: '#34d399', fontSize: '1.1rem' }}>NT$ {grandTotal.toLocaleString()} 元</strong>
              </div>
              <div className={styles.ecpayRow}>
                <span>消費明細：</span>
                <strong>mall2 時尚商品訂購</strong>
              </div>
            </div>

            <div className={styles.ecpayFormGroup}>
              <label>模擬信用卡號</label>
              <input
                type="text"
                className="input"
                style={{ borderColor: 'rgba(52, 211, 153, 0.3)', fontFamily: 'monospace' }}
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                placeholder="4311-9522-2222-2222"
                required
              />
            </div>

            <div className={styles.ecpayFormRow}>
              <div className={styles.ecpayFormGroup}>
                <label>卡片有效期限</label>
                <input
                  type="text"
                  className="input"
                  style={{ borderColor: 'rgba(52, 211, 153, 0.3)', fontFamily: 'monospace' }}
                  value={cardExpiry}
                  onChange={e => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div className={styles.ecpayFormGroup}>
                <label>安全碼 (CVV)</label>
                <input
                  type="text"
                  className="input"
                  style={{ borderColor: 'rgba(52, 211, 153, 0.3)', fontFamily: 'monospace' }}
                  value={cardCvv}
                  onChange={e => setCardCvv(e.target.value)}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              className={styles.ecpaySubmitBtn}
              onClick={handleECPayPaymentConfirm}
              disabled={paying}
            >
              {paying ? '🔐 正在進行安全交易驗證...' : `確認安全刷卡支付 NT$ ${grandTotal.toLocaleString()}`}
            </button>

            <button
              type="button"
              className={styles.ecpayCancelBtn}
              onClick={() => setShowECPayModal(false)}
              disabled={paying}
            >
              取消付款並返回
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
