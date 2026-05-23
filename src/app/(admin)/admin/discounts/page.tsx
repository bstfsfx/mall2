'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface DiscountCode {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';

const TYPE_LABELS: Record<DiscountType, string> = {
  percentage: '百分比折扣 (%)',
  fixed_amount: '固定金額折抵 (NT$)',
  free_shipping: '免運費',
};

const TYPE_COLORS: Record<DiscountType, string> = {
  percentage: '#6366f1',
  fixed_amount: '#10b981',
  free_shipping: '#f59e0b',
};

export default function AdminDiscounts() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [maxUses, setMaxUses] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const fetchCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCodes(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? '載入失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setCode('');
    setName('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinOrderAmount(0);
    setMaxUses('');
    setStartDate(new Date().toISOString().slice(0, 16));
    setEndDate('');
    setIsActive(true);
    setShowModal(true);
  };

  const openEdit = (item: DiscountCode) => {
    setEditingId(item.id);
    setCode(item.code);
    setName(item.name);
    setDescription(item.description ?? '');
    setDiscountType(item.discount_type);
    setDiscountValue(Number(item.discount_value));
    setMinOrderAmount(Number(item.min_order_amount));
    setMaxUses(item.max_uses ?? '');
    setStartDate(item.start_date ? item.start_date.slice(0, 16) : '');
    setEndDate(item.end_date ? item.end_date.slice(0, 16) : '');
    setIsActive(item.is_active);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim() || null,
        discount_type: discountType,
        discount_value: discountValue,
        min_order_amount: minOrderAmount,
        max_uses: maxUses === '' ? null : Number(maxUses),
        start_date: startDate || new Date().toISOString(),
        end_date: endDate || null,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (editingId) {
        result = await supabase
          .from('discount_codes')
          .update(payload)
          .eq('id', editingId)
          .select()
          .single();
      } else {
        result = await supabase
          .from('discount_codes')
          .insert({ ...payload, used_count: 0 })
          .select()
          .single();
      }

      if (result.error) throw result.error;
      setShowModal(false);
      await fetchCodes();
    } catch (err: any) {
      setError(err?.message ?? '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: delError } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', id);
      if (delError) throw delError;
      setShowDeleteConfirm(null);
      await fetchCodes();
    } catch (err: any) {
      setError(err?.message ?? '刪除失敗');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(text);
      setTimeout(() => setCopyFeedback(null), 1500);
    } catch {
      // fallback
    }
  };

  const isExpired = (item: DiscountCode) => {
    if (!item.end_date) return false;
    return new Date(item.end_date) < new Date();
  };

  const isNotStarted = (item: DiscountCode) => {
    return new Date(item.start_date) > new Date();
  };

  const statusBadge = (item: DiscountCode) => {
    if (!item.is_active) return <span className={styles.badgeGray}>已停用</span>;
    if (isExpired(item)) return <span className={styles.badgeGray}>已過期</span>;
    if (isNotStarted(item)) return <span className={styles.badgeBlue}>待生效</span>;
    if (item.max_uses && item.used_count >= item.max_uses) return <span className={styles.badgeGray}>已用完</span>;
    return <span className={styles.badgeGreen}>啟用中</span>;
  };

  const discountLabel = (item: DiscountCode) => {
    if (item.discount_type === 'percentage') return `-${item.discount_value}%`;
    if (item.discount_type === 'fixed_amount') return `-NT$ ${item.discount_value}`;
    return '免運';
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>🎫 折扣碼管理</h1>
          <p className={styles.pageSubtitle}>建立並管理優惠折扣代碼，供消費者於結帳時使用</p>
        </div>
        <button className="btn btn-gold" onClick={openCreate}>
          + 新增折扣碼
        </button>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {loading ? (
        <div className={styles.loading}><div className="spinner" /></div>
      ) : codes.length === 0 ? (
        <div className={`glass ${styles.emptyCard}`}>
          <span style={{ fontSize: '3rem' }}>🎫</span>
          <h3>尚無折扣碼</h3>
          <p>點擊「新增折扣碼」建立第一個優惠活動</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {codes.map((item) => (
            <div key={item.id} className={`glass ${styles.card}`}>
              <div className={styles.cardTop}>
                <div>
                  <div className={styles.codeRow}>
                    <span className={styles.codeText} onClick={() => copyToClipboard(item.code)} title="點擊複製">
                      {item.code}
                    </span>
                    {copyFeedback === item.code && <span className={styles.copyBadge}>已複製!</span>}
                    <button className={styles.copyBtn} onClick={() => copyToClipboard(item.code)} title="複製代碼">📋</button>
                  </div>
                  <p className={styles.codeName}>{item.name}</p>
                </div>
                <div className={styles.discountPill} style={{ background: TYPE_COLORS[item.discount_type] }}>
                  {discountLabel(item)}
                </div>
              </div>

              {item.description && <p className={styles.desc}>{item.description}</p>}

              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>優惠類型</span>
                  <span className={styles.metaValue}>{TYPE_LABELS[item.discount_type]}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>最低消費</span>
                  <span className={styles.metaValue}>{item.min_order_amount > 0 ? `NT$ ${item.min_order_amount}` : '無限制'}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>使用次數</span>
                  <span className={styles.metaValue}>{item.max_uses ? `${item.used_count} / ${item.max_uses}` : `${item.used_count} 次`}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>有效期間</span>
                  <span className={styles.metaValue}>
                    {item.end_date
                      ? `${new Date(item.start_date).toLocaleDateString('zh-TW')} ~ ${new Date(item.end_date).toLocaleDateString('zh-TW')}`
                      : `${new Date(item.start_date).toLocaleDateString('zh-TW')} 起無限期`}
                  </span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div>{statusBadge(item)}</div>
                <div className={styles.cardActions}>
                  <button className={styles.actionBtn} onClick={() => openEdit(item)}>編輯</button>
                  <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setShowDeleteConfirm(item.id)}>刪除</button>
                </div>
              </div>

              {showDeleteConfirm === item.id && (
                <div className={styles.confirmBox}>
                  <p>確定刪除折扣碼 <strong>{item.code}</strong>？此操作不可撤銷。</p>
                  <div className={styles.confirmActions}>
                    <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(null)}>取消</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>確認刪除</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={`glass ${styles.modal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? '✏️ 編輯折扣碼' : '🆕 建立折扣碼'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              {error && <div className={styles.errorBanner}>{error}</div>}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>折扣碼代號 *</label>
                  <input className="input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} placeholder="例如: SUMMER20" maxLength={20} required />
                </div>
                <div className={styles.formGroup}>
                  <label>活動名稱 *</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如: 夏季滿千送百" required />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>說明描述</label>
                <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="(optional) 簡短說明此折扣碼的用途或注意事項" rows={2} />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>優惠類型 *</label>
                  <select className="input" value={discountType} onChange={(e) => setDiscountType(e.target.value as DiscountType)}>
                    <option value="percentage">百分比折扣 (%)</option>
                    <option value="fixed_amount">固定金額折抵 (NT$)</option>
                    <option value="free_shipping">免運費</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>{discountType === 'percentage' ? '折扣百分比 (%) *' : discountType === 'fixed_amount' ? '折抵金額 (NT$) *' : '無需設定'}</label>
                  {discountType !== 'free_shipping' ? (
                    <input className="input" type="number" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} min={0} max={discountType === 'percentage' ? 100 : 999999} required />
                  ) : (
                    <input className="input" value="—" disabled />
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>最低消費金額 (NT$)</label>
                  <input className="input" type="number" value={minOrderAmount} onChange={(e) => setMinOrderAmount(Number(e.target.value))} min={0} placeholder="0 = 無限制" />
                </div>
                <div className={styles.formGroup}>
                  <label>最大使用次數</label>
                  <input className="input" type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value ? Number(e.target.value) : '')} min={1} placeholder="空白 = 無限次" />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>開始時間 *</label>
                  <input className="input" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label>結束時間</label>
                  <input className="input" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="空白 = 不限時間" />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.toggleRow}>
                  <span>🔔 啟用此折扣碼</span>
                  <div className={`${styles.toggle} ${isActive ? styles.toggleOn : ''}`} onClick={() => setIsActive(!isActive)}>
                    <div className={styles.toggleThumb} />
                  </div>
                </label>
              </div>

              <div className={styles.formHint}>💡 折扣碼會自動根據有效期啟用，消費者於結帳時輸入代碼即可享有優惠</div>

              <div className={styles.modalActions}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>取消</button>
                <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? '儲存中...' : editingId ? '更新折扣碼' : '建立折扣碼'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
