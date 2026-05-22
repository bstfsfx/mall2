'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

interface Profile {
  id: string;
  role: 'admin' | 'customer';
  name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setUsers(data ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '無法載入會員列表');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: 'admin' | 'customer') => {
    if (userId === currentUser?.id) {
      alert('為了安全起見，您不能修改自己的管理員權限！');
      return;
    }

    const nextRole = currentRole === 'admin' ? 'customer' : 'admin';
    const confirmMsg = nextRole === 'admin' 
      ? `確定要將此會員設為管理員嗎？此帳號將獲得完整的後台存取權限。`
      : `確定要取消此管理員的權限嗎？`;

    if (!confirm(confirmMsg)) return;

    setUpdatingId(userId);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ role: nextRole })
        .eq('id', userId);

      if (updateErr) throw updateErr;

      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u));
      setSuccessMsg('權限已成功更新');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? '更新權限失敗，可能是因為資料庫 RLS 權限限制。');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(u => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return (
      u.name?.toLowerCase().includes(s) ||
      u.id.toLowerCase().includes(s) ||
      u.phone?.toLowerCase().includes(s) ||
      u.address?.toLowerCase().includes(s)
    );
  });

  // Calculate statistics
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const customerCount = totalUsers - adminCount;

  return (
    <div className={styles.page}>
      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={`glass ${styles.statCard}`}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>👥 總註冊會員</span>
            <span className={styles.statVal}>{loading ? '...' : totalUsers} 人</span>
          </div>
        </div>
        <div className={`glass ${styles.statCard} ${styles.cardGold}`}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>🛡️ 管理員人數</span>
            <span className={styles.statVal}>{loading ? '...' : adminCount} 人</span>
          </div>
        </div>
        <div className={`glass ${styles.statCard} ${styles.cardPurple}`}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>🛍️ 一般會員人數</span>
            <span className={styles.statVal}>{loading ? '...' : customerCount} 人</span>
          </div>
        </div>
      </div>

      {/* Main glass box */}
      <div className={`glass ${styles.container}`}>
        <div className={styles.controlHeader}>
          <h3>👥 會員列表</h3>
          <div className={styles.searchWrap}>
            <input
              type="text"
              placeholder="搜尋姓名、電話、地址或 ID..."
              className="input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
          </div>
        </div>

        <hr className="gold-divider" style={{ margin: '1rem 0 1.5rem' }} />

        {error && <div className={styles.error}>{error}</div>}
        {successMsg && <div className={styles.success}>{successMsg}</div>}

        {loading ? (
          <div className={styles.loaderWrap}>
            <div className="spinner" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className={styles.empty}>找不到符合搜尋條件的會員</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>會員 ID</th>
                  <th>姓名</th>
                  <th>聯絡電話</th>
                  <th>預設配送地址</th>
                  <th>註冊日期</th>
                  <th>身分權限</th>
                  <th style={{ textAlign: 'center' }}>權限管理</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className={u.id === currentUser?.id ? styles.currentUserRow : ''}>
                    <td className={styles.userId} title={u.id}>
                      {u.id.slice(0, 8).toUpperCase()}...
                      {u.id === currentUser?.id && <span className={styles.selfBadge}>您</span>}
                    </td>
                    <td className={styles.userName}>{u.name ?? '未設定'}</td>
                    <td>{u.phone ?? '未設定'}</td>
                    <td className={styles.addressCell} title={u.address ?? ''}>
                      {u.address ? (u.address.length > 25 ? `${u.address.slice(0, 25)}...` : u.address) : '未設定'}
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString('zh-TW')}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleAdmin : styles.roleCustomer}`}>
                        {u.role === 'admin' ? '🛡️ 管理員' : '🛍️ 一般會員'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleRoleToggle(u.id, u.role)}
                        disabled={updatingId === u.id || u.id === currentUser?.id}
                        className={`btn btn-sm ${u.role === 'admin' ? 'btn-ghost' : 'btn-outline-gold'} ${styles.toggleBtn}`}
                      >
                        {updatingId === u.id ? (
                          <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1px' }} />
                        ) : u.role === 'admin' ? (
                          '🛡️ 取消權限'
                        ) : (
                          '💎 升為管理員'
                        )}
                      </button>
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
