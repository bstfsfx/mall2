'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  product_interest: string | null;
  message: string;
  status: 'pending' | 'replied' | 'closed';
  reply_message: string | null;
  replied_at: string | null;
  created_at: string;
}

const STATUS_LABELS = {
  pending: { label: '待回覆', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  replied: { label: '已回覆', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  closed: { label: '已關閉', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied' | 'closed'>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    setInquiries(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchInquiries(); }, []);

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    setReplying(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('inquiries')
        .update({
          status: 'replied',
          reply_message: reply.trim(),
          replied_at: new Date().toISOString(),
        })
        .eq('id', selected.id);

      if (updateError) throw updateError;
      await fetchInquiries();
      setSelected({ ...selected, status: 'replied', reply_message: reply.trim(), replied_at: new Date().toISOString() });
      setReply('');
    } catch (err: any) {
      setError(err?.message ?? '回覆失敗');
    } finally {
      setReplying(false);
    }
  };

  const handleClose = async (id: string) => {
    await supabase.from('inquiries').update({ status: 'closed' }).eq('id', id);
    await fetchInquiries();
    if (selected?.id === id) setSelected({ ...selected, status: 'closed' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此詢價單？')) return;
    await supabase.from('inquiries').delete().eq('id', id);
    await fetchInquiries();
    if (selected?.id === id) setSelected(null);
  };

  const filtered = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📧 詢價單管理</h1>
          <p className={styles.subtitle}>處理客戶的線上詢價與大宗採購需求</p>
        </div>
        <div className={styles.filters}>
          {(['all', 'pending', 'replied', 'closed'] as const).map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待回覆' : f === 'replied' ? '已回覆' : '已關閉'}
              {f !== 'all' && (
                <span className={styles.filterCount}>
                  {inquiries.filter(i => i.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.layout}>
        {/* List */}
        <div className={`glass ${styles.list}`}>
          {loading ? (
            <div className={styles.loading}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>暫無詢價單</div>
          ) : (
            filtered.map(inq => (
              <div
                key={inq.id}
                className={`${styles.inqItem} ${selected?.id === inq.id ? styles.inqItemActive : ''}`}
                onClick={() => setSelected(inq)}
              >
                <div className={styles.inqItemTop}>
                  <span className={styles.inqName}>{inq.name}</span>
                  <span
                    className={styles.inqBadge}
                    style={{ background: STATUS_LABELS[inq.status].bg, color: STATUS_LABELS[inq.status].color }}
                  >
                    {STATUS_LABELS[inq.status].label}
                  </span>
                </div>
                <p className={styles.inqPreview}>{inq.message.slice(0, 60)}{inq.message.length > 60 ? '...' : ''}</p>
                <p className={styles.inqMeta}>{new Date(inq.created_at).toLocaleString('zh-TW')} · {inq.email}</p>
              </div>
            ))
          )}
        </div>

        {/* Detail */}
        {selected ? (
          <div className={`glass ${styles.detail}`}>
            <div className={styles.detailHeader}>
              <div>
                <h2>{selected.name}</h2>
                <p>{selected.email} {selected.phone && `· ${selected.phone}`}</p>
                {selected.product_interest && (
                  <span className={styles.productTag}>商品: {selected.product_interest}</span>
                )}
              </div>
              <div className={styles.detailActions}>
                {selected.status !== 'closed' && (
                  <button className="btn btn-ghost btn-sm" onClick={() => handleClose(selected.id)}>結案</button>
                )}
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(selected.id)}>刪除</button>
              </div>
            </div>

            <div className={styles.messageBox}>
              <p className={styles.messageLabel}>💬 客戶詢問</p>
              <p className={styles.messageText}>{selected.message}</p>
            </div>

            {selected.reply_message && (
              <div className={`${styles.messageBox} ${styles.replyBox}`}>
                <p className={styles.messageLabel}>✅ 官方回覆</p>
                <p className={styles.messageText}>{selected.reply_message}</p>
                <p className={styles.replyTime}>
                  回覆時間：{selected.replied_at && new Date(selected.replied_at).toLocaleString('zh-TW')}
                </p>
              </div>
            )}

            {selected.status !== 'replied' && selected.status !== 'closed' && (
              <div className={styles.replyArea}>
                <label>回覆內容</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="請輸入回覆內容..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                />
                <button
                  className="btn btn-gold"
                  onClick={handleReply}
                  disabled={replying || !reply.trim()}
                >
                  {replying ? '傳送中...' : '發送回覆'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`glass ${styles.detail}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>👈 點選左側詢價單查看詳細內容</p>
          </div>
        )}
      </div>
    </div>
  );
}