'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './InquiryForm.module.css';

interface InquiryFormProps {
  productInterest?: string;
  productName?: string;
}

export default function InquiryForm({ productInterest, productName }: InquiryFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('inquiries').insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        product_interest: productInterest || productName || null,
        message: message.trim(),
        status: 'pending',
      });

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message ?? '提交失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.success}>
        <span className={styles.successIcon}>✅</span>
        <h3>感謝您的詢價！</h3>
        <p>我們將於 1-2 個工作日內回覆您，請留意電子郵件。</p>
        <button className="btn btn-ghost" onClick={() => { setSubmitted(false); setName(''); setEmail(''); setPhone(''); setMessage(''); }}>
          再次詢問
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      {productName && (
        <div className={styles.productTag}>
          詢問商品：<strong>{productName}</strong>
        </div>
      )}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="inq-name">姓名 *</label>
          <input
            id="inq-name"
            className="input"
            type="text"
            placeholder="王大明"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="inq-email">電子信箱 *</label>
          <input
            id="inq-email"
            className="input"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="inq-phone">電話（選填）</label>
        <input
          id="inq-phone"
          className="input"
          type="tel"
          placeholder="0912-345-678"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="inq-message">詢問內容 *</label>
        <textarea
          id="inq-message"
          className="input"
          placeholder="請描述您想了解的資訊，例如：尺寸、顏色、材質、批發採購、数量等..."
          rows={5}
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-gold" disabled={loading} style={{ width: '100%' }}>
        {loading ? '提交中...' : '送出詢價'}
      </button>
    </form>
  );
}