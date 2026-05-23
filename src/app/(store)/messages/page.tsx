'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
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
  open: { label: '等待回覆', color: '#f59e0b' },
  replied: { label: '已回覆', color: '#10b981' },
  closed: { label: '已關閉', color: '#6b7280' },
};

export default function CustomerMessages() {
  const { user, profile, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login?redirect=/messages';
    }
  }, [user, authLoading]);

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('cs_conversations')
      .select('*')
      .eq('user_email', user.email)
      .order('last_message_at', { ascending: false });
    setConversations(data ?? []);
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
      .eq('is_read', false)
      .eq('sender_type', 'admin');
  };

  useEffect(() => { if (user) fetchConversations(); }, [user]);

  useEffect(() => {
    if (selected) {
      fetchMessages(selected.id);
    } else setMessages([]);
  }, [selected?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    setSending(true);
    setError(null);
    try {
      if (!selected && !showNew) {
        setError('請先選擇或開啟一個對話');
        setSending(false);
        return;
      }
      const conv = selected || (showNew && newSubject.trim() ? await startConversation() : null);
      if (!conv) throw new Error('無法建立對話');

      const { error: insertError } = await supabase.from('cs_messages').insert({
        conversation_id: conv.id,
        sender_type: 'user',
        sender_id: user?.id,
        message: newMsg.trim(),
        is_read: false,
      });
      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('cs_conversations')
        .update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', conv.id);
      if (updateError) throw updateError;

      await fetchMessages(conv.id);
      setNewMsg('');
      if (showNew && !selected) {
        setShowNew(false);
        setSelected(conv);
      }
      await fetchConversations();
    } catch (err: any) {
      setError(err?.message ?? '發送失敗');
    } finally {
      setSending(false);
    }
  };

  const startConversation = async () => {
    if (!newSubject.trim() || !user) return null;
    const { data, error: createError } = await supabase
      .from('cs_conversations')
      .insert({
        user_id: user.id,
        user_name: profile?.name || user.email?.split('@')[0] || '會員',
        user_email: user.email,
        subject: newSubject.trim(),
        status: 'open',
      })
      .select()
      .single();
    if (createError) throw createError;
    return data;
  };

  if (authLoading || !user) {
    return <div className={styles.loading}><div className="spinner" /></div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>💬 客服訊息</h1>
        <button
          className="btn btn-gold"
          style={{ fontSize: '0.85rem', padding: '6px 18px' }}
          onClick={() => { setShowNew(true); setSelected(null); setMessages([]); }}
        >
          + 新對話
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.layout}>
        {/* Conversation list */}
        <div className={`glass ${styles.list}`}>
          {loading ? (
            <div className={styles.loading}><div className="spinner" /></div>
          ) : conversations.length === 0 ? (
            <div className={styles.empty}>尚無客服對話記錄</div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                className={`${styles.listItem} ${selected?.id === conv.id ? styles.listItemActive : ''}`}
                onClick={() => { setSelected(conv); setShowNew(false); }}
              >
                <div className={styles.listItemTop}>
                  <span className={styles.listItemName}>{conv.subject || '新對話'}</span>
                  <span style={{ fontSize: '0.7rem', color: STATUS_LABELS[conv.status].color }}>
                    {STATUS_LABELS[conv.status].label}
                  </span>
                </div>
                <div className={styles.listItemMeta}>
                  {new Date(conv.last_message_at).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message area */}
        <div className={`glass ${styles.thread}`}>
          {showNew ? (
            <div className={styles.newConv}>
              <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--gold-light)' }}>開啟新對話</h2>
              <input
                className={styles.subjectInput}
                placeholder="主旨（選填）"
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
              />
              <textarea
                className={styles.msgInput}
                placeholder="請輸入您的問題或需求..."
                rows={5}
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
              />
              <div className={styles.replyActions}>
                <button className="btn btn-outline" style={{ fontSize: '0.85rem' }} onClick={() => setShowNew(false)}>取消</button>
                <button
                  className="btn btn-gold"
                  style={{ fontSize: '0.85rem' }}
                  onClick={handleSend}
                  disabled={sending || !newMsg.trim()}
                >
                  {sending ? '發送中...' : '發送'}
                </button>
              </div>
            </div>
          ) : selected ? (
            <>
              <div className={styles.threadHeader}>
                <div className={styles.threadTitle}>{selected.subject || '客服對話'}</div>
                <div className={styles.threadMeta} style={{ color: STATUS_LABELS[selected.status].color }}>
                  {STATUS_LABELS[selected.status].label}
                </div>
              </div>
              <div className={styles.messages}>
                {messages.length === 0 && <div className={styles.msgSystem}>尚無訊息，請稍後等待回覆</div>}
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={msg.sender_type === 'user' ? styles.msgUser : msg.sender_type === 'system' ? styles.msgSystem : styles.msgAdmin}
                  >
                    <div>{msg.message}</div>
                    <div className={styles.msgMeta}>
                      {new Date(msg.created_at).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {selected.status !== 'closed' ? (
                <div className={styles.replyBox}>
                  <textarea
                    rows={3}
                    placeholder="輸入訊息...（Ctrl+Enter 發送）"
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend(); }}
                  />
                  <div className={styles.replyActions}>
                    <button className="btn btn-gold" style={{ fontSize: '0.85rem' }} onClick={handleSend} disabled={sending || !newMsg.trim()}>
                      {sending ? '發送中...' : '發送'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '1rem' }}>此對話已關閉</div>
              )}
            </>
          ) : (
            <div className={styles.empty} style={{ padding: '3rem' }}>選擇對話或開啟新對話</div>
          )}
        </div>
      </div>
    </div>
  );
}