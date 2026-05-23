'use client';

import { useState, useCallback } from 'react';
import styles from './page.module.css';

type Permission = { id: string; slug: string; label: string; description: string | null; category: string };
type Role = { id: string; label: string; description: string | null; color: string; is_active: boolean; permissions: Permission[] };

const CATEGORY_LABELS: Record<string, string> = {
  products: '商品管理',
  orders: '訂單管理',
  inquiries: '線上諮詢',
  messages: '客服訊息',
  discounts: '優惠券',
  banners: '橫幅設定',
  articles: '專業知識',
  users: '會員管理',
  settings: '網站設定',
  roles: '角色權限',
};

const ROLE_COLORS: Record<string, string> = {
  admin: '#f59e0b',
  marketing: '#3b82f6',
  cs: '#10b981',
  customer: '#6b7280',
};

type Props = {
  roles: Role[];
  permissions: Permission[];
};

export default function RolesClient({ roles: initialRoles, permissions }: Props) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const togglePermission = async (roleId: string, permissionId: string, hasIt: boolean) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles/permissions', {
        method: hasIt ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_id: roleId, permission_id: permissionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '操作失敗');

      setRoles(prev => prev.map(r => {
        if (r.id !== roleId) return r;
        return {
          ...r,
          permissions: hasIt
            ? r.permissions.filter(p => p.id !== permissionId)
            : [...r.permissions, permissions.find(p => p.id === permissionId)!],
        };
      }));
      showToast(hasIt ? '已移除權限' : '已新增權限');
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setLoading(false);
    }
  };

  const groupedPermissions = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const hasPermission = (role: Role, slug: string) =>
    role.permissions.some(p => p.slug === slug);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>角色與權限</h1>
          <p className={styles.pageSubtitle}>管理系統角色及其可存取的權限</p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`}>
          {toast.msg}
        </div>
      )}

      {/* Roles Grid */}
      <div className={styles.rolesGrid}>
        {roles.filter(r => r.id !== 'customer').map(role => (
          <div key={role.id} className={`${styles.roleCard} ${expandedRole === role.id ? styles.roleCardExpanded : ''}`}>
            {/* Role Header */}
            <div className={styles.roleHeader} onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}>
              <div className={styles.roleInfo}>
                <div className={styles.roleNameRow}>
                  <span className={styles.roleBadge} style={{ background: role.color }}>
                    {role.label}
                  </span>
                  <span className={styles.roleId}>@{role.id}</span>
                </div>
                {role.description && (
                  <p className={styles.roleDesc}>{role.description}</p>
                )}
                <div className={styles.roleMeta}>
                  <span>{role.permissions.length} 項權限</span>
                  <span className={styles.expandIcon}>{expandedRole === role.id ? '▲' : '▼'}</span>
                </div>
              </div>
            </div>

            {/* Expanded Permissions */}
            {expandedRole === role.id && (
              <div className={styles.roleBody}>
                {Object.entries(groupedPermissions).map(([cat, perms]) => (
                  <div key={cat} className={styles.permGroup}>
                    <h4 className={styles.permGroupTitle}>{CATEGORY_LABELS[cat] || cat}</h4>
                    <div className={styles.permList}>
                      {perms.map(perm => {
                        const has = hasPermission(role, perm.slug);
                        return (
                          <button
                            key={perm.id}
                            className={`${styles.permChip} ${has ? styles.permChipActive : ''}`}
                            onClick={() => togglePermission(role.id, perm.id, has)}
                            disabled={loading || role.id === 'admin'} // admin always has all
                            title={perm.description || perm.label}
                          >
                            {has && <span>✓</span>}
                            {perm.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Permissions Reference */}
      <div className={styles.permRef}>
        <h3 className={styles.permRefTitle}>權限一覽</h3>
        <div className={styles.permRefGrid}>
          {Object.entries(groupedPermissions).map(([cat, perms]) => (
            <div key={cat} className={styles.permRefGroup}>
              <h4 className={styles.permRefGroupTitle}>{CATEGORY_LABELS[cat] || cat}</h4>
              {perms.map(p => (
                <div key={p.id} className={styles.permRefItem}>
                  <code className={styles.permSlug}>{p.slug}</code>
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}