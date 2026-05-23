'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface Conversation {
  id: string;
  user_id: string | null;
  user_name: string;
  user_email: string;
  order_id: string | null;
  subject: string | null;
  status: 'open' | 'replied' | 'closed';
  last_message_at: string;
  created_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_type: 'user' | 'admin' | 'system';
  message: string;
  is_read: boolean;
  created_at: string;
}

const STATUS_LABELS = {
  open: { label: '待回覆', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  replied: { label: '已回覆', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  closed: { label: '已關閉', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

export default function AdminMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'replied' | 'closed'>('all');
  const [stats, setStats] = useState({ open: 0, replied: 0, closed: 0, total: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('cs_conversations')
      .select('*')
      .order('last_message_at', { ascending: false });
    setConversations(data ?? []);
    const all = data ?? [];
    setStats({
      open: all.filter(c => c.status === 'open').length,
      replied: all.filter(c => c.status === 'replied').length,
      closed: all.filter(c => c.status === 'closed').length,
      total: all.length,
    });
    setLoading(false);
  };

  const fetchMessages = async (convId: string) => {
    const { data } = await supabase
      .from('cs_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    setMessages(data ?? []);
    await supabase.from('cs_messages')
      .update({ is_read: true })
      .eq('conversation_id', convId)
      .eq('is_read', false);
  };

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (selected) {
      fetchMessages(selected.id);
      setReply('');
    } else {
      setMessages([]);
    }
  }, [selected?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from('cs_messages').insert({
        conversation_id: selected.id,
        sender_type: 'admin',
        sender_id: null,
        message: reply.trim(),
        is_read: true,
      });
      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('cs_conversations')
        .update({
          status: 'replied',
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', selected.id);
      if (updateError) throw updateError;

      await fetchMessages(selected.id);
      await fetchConversations();
      setSelected(prev => prev ? { ...prev, status: 'replied', last_message_at: new Date().toISOString() } : null);
      setReply('');
    } catch (err: any) {
      setError(err?.message ?? '發送失敗');
    } finally {
      setSending(false);
    }
  };

  const handleClose = async (conv: Conversation) => {
    await supabase.from('cs_conversations').update({ status: 'closed' }).eq('id', conv.id);
    await fetchConversations();
    if (selected?.id === conv.id) setSelected(prev => prev ? { ...prev, status: 'closed' } : null);
  };

  const filtered = filter === 'all' ? conversations : conversations.filter(c => c.status === filter);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>💬 客服訊息</h1>
          <p className={styles.subtitle}>管理與客戶的即時對話</p>
        </div>
        <div className={styles.stats}>
          {(['open', 'replied', 'closed'] as const).map(s => (
            <div key={s} className={styles.statItem} onClick={() => setFilter(s)} style={{ cursor: 'pointer' }}>
              <div className={styles.num} style={{ color: STATUS_LABELS[s].color }}>{stats[s]}</div>
              <div className={styles.label}>{STATUS_LABELS[s].label}</div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.layout}>
        <div className={`glass ${styles.list}`}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            {(['all', 'open', 'replied', 'closed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: filter === f ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
                  color: filter === f ? '#000' : 'rgba(255,255,255,0.6)',
                  fontWeight: 600,
                }}
              >
                {f === 'all' ? '全部' : STATUS_LABELS[f].label}
                {f !== 'all' && ` (${stats[f]})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.loading}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>暫無對話</div>
          ) : (
            filtered.map(conv => (
              <div
                key={conv.id}
                className={`${styles.listItem} ${selected?.id === conv.id ? styles.listItemActive : ''}`}
                onClick={() => setSelected(conv)}
              >
                <div className={styles.listItemTop}>
                  <span className={styles.listItemName}>{conv.user_name}</span>
                  <span
                    className={styles.listItemBadge}
                    style={{ background: STATUS_LABELS[conv.status].bg, color: STATUS_LABELS[conv.status].color }}
                  >
                    {STATUS_LABELS[conv.status].label}
                  </span>
                </div>
                {conv.subject && <div className={styles.listItemSubj}>{conv.subject}</div>}
                <div className={styles.listItemMeta}>
                  {new Date(conv.last_message_at).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {' · '}{conv.user_email}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={`glass ${styles.thread}`}>
          {selected ? (
            <>
              <div className={styles.threadHeader}>
                <div className={styles.threadTitle}>{selected.subject || '新對話'}</div>
                <div className={styles.threadMeta}>
                  {selected.user_name} · {selected.user_email}
                  {selected.order_id && ` · 訂單 ${selected.order_id.slice(0, 8)}...`}
                </div>
              </div>
              <div className={styles.messages}>
                {messages.length === 0 && (
                  <div className={styles.msgSystem}>尚無訊息</div>
                )}
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={
                      msg.sender_type === 'user' ? styles.msgUser :
                      msg.sender_type === 'system' ? styles.msgSystem :
                      styles.msgAdmin
                    }
                  >
                    <div>{msg.message}</div>
                    <div className={styles.msgMeta}>
                      {new Date(msg.created_at).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className={styles.replyBox}>
                {selected.status !== 'closed' ? (
                  <>
                    <textarea
                      rows={3}
                      placeholder="輸入回覆內容..."
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSendReply();
                      }}
                    />
                    <div className={styles.replyActions}>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.82rem', padding: '6px 16px' }}
                        onClick={() => handleClose(selected)}
                      >
                        關閉對話
                      </button>
                      <button
                        className="btn btn-gold"
                        style={{ fontSize: '0.82rem', padding: '6px 16px' }}
                        onClick={handleSendReply}
                        disabled={sending || !reply.trim()}
                      >
                        {sending ? '發送中...' : '發送回覆'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '0.5rem' }}>
                    此對話已關閉
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.empty}>選擇一個對話查看詳情</div>
          )}
        </div>

        <div className={`glass ${styles.customer}`}>
          {selected ? (
            <>
              <div className={styles.customerHeader}>👤 客戶資訊</div>
              <div className={styles.customerField}>
                <div className={styles.label}>姓名</div>
                <div className={styles.value}>{selected.user_name}</div>
              </div>
              <div className={styles.customerField}>
                <div className={styles.label}>Email</div>
                <div className={styles.value}>{selected.user_email}</div>
              </div>
              {selected.order_id && (
                <div className={styles.customerField}>
                  <div className={styles.label}>關聯訂單</div>
                  <div className={styles.value} style={{ fontSize: '0.78rem' }}>{selected.order_id}</div>
                </div>
              )}
              <div className={styles.customerField}>
                <div className={styles.label}>建立時間</div>
                <div className={styles.value} style={{ fontSize: '0.8rem' }}>
                  {new Date(selected.created_at).toLocaleString('zh-TW')}
                </div>
              </div>
              <div className={styles.customerField}>
                <div className={styles.label}>狀態</div>
                <div className={styles.value}>
                  <span
                    style={{
                      background: STATUS_LABELS[selected.status].bg,
                      color: STATUS_LABELS[selected.status].color,
                      padding: '2px 10px',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    {STATUS_LABELS[selected.status].label}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.empty}>選擇對話查看客戶資訊</div>
          )}
        </div>
      </div>
    </div>
  );
}
