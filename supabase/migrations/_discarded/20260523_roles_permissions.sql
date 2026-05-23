-- ==============================================
-- Roles & Permissions Module
-- Creates: roles, permissions, role_permissions
-- ==============================================

BEGIN;

-- Roles table (source of truth replacing hard-coded checks)
CREATE TABLE IF NOT EXISTS roles (
  id          TEXT PRIMARY KEY,  -- 'admin' | 'marketing' | 'cs' | 'customer'
  label       TEXT NOT NULL,     -- '系統管理員' | '行銷企劃' | '客服人員' | '一般會員'
  description TEXT,
  color       TEXT DEFAULT '#6b7280',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  label       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL,  -- 'products'|'orders'|'inquiries'|'messages'|'discounts'|'banners'|'articles'|'users'|'settings'|'roles'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Role-Permission junction
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id        TEXT REFERENCES roles(id) ON DELETE CASCADE,
  permission_id  UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ==============================================
-- Permissions Seed Data
-- ==============================================
INSERT INTO permissions (slug, label, description, category) VALUES
  -- Products
  ('products.view',      '檢視商品',         '檢視商品列表與詳情',         'products'),
  ('products.create',   '新增商品',         '新增商品',                   'products'),
  ('products.edit',     '編輯商品',         '編輯商品資訊',               'products'),
  ('products.delete',   '刪除商品',         '刪除商品',                   'products'),
  ('categories.manage', '管理分類',         '新增/編輯/刪除商品分類',      'products'),
  -- Orders
  ('orders.view',       '檢視訂單',         '檢視所有訂單',               'orders'),
  ('orders.edit',       '編輯訂單',         '更新訂單狀態與資訊',          'orders'),
  ('orders.export',     '匯出訂單',         '匯出訂單報表',               'orders'),
  -- Inquiries
  ('inquiries.view',    '檢視諮詢',         '檢視客戶諮詢',               'inquiries'),
  ('inquiries.reply',   '回覆諮詢',         '回覆客戶諮詢',               'inquiries'),
  ('inquiries.close',   '關閉諮詢',         '關閉諮詢對話',               'inquiries'),
  -- Messages
  ('messages.view',     '檢視客服訊息',     '檢視客服訊息記錄',           'messages'),
  ('messages.reply',    '回覆客服訊息',     '回覆客戶訊息',               'messages'),
  ('messages.close',    '關閉客服訊息',     '關閉客服對話',               'messages'),
  -- Discounts
  ('discounts.view',    '檢視優惠券',       '檢視優惠券列表',             'discounts'),
  ('discounts.create',  '新增優惠券',       '新增折扣碼',                 'discounts'),
  ('discounts.edit',    '編輯優惠券',       '編輯折扣碼',                 'discounts'),
  ('discounts.delete',  '刪除優惠券',       '刪除折扣碼',                 'discounts'),
  -- Banners
  ('banners.view',      '檢視橫幅',         '檢視首頁橫幅設定',           'banners'),
  ('banners.manage',    '管理橫幅',         '新增/編輯/刪除橫幅',         'banners'),
  -- Articles
  ('articles.view',     '檢視文章',         '檢視專業知識文章',           'articles'),
  ('articles.create',   '新增文章',         '新增文章',                   'articles'),
  ('articles.edit',     '編輯文章',         '編輯文章',                   'articles'),
  ('articles.delete',   '刪除文章',         '刪除文章',                   'articles'),
  -- Users
  ('users.view',        '檢視會員',         '檢視會員列表',               'users'),
  ('users.edit',        '編輯會員',         '編輯會員資料與角色',         'users'),
  ('users.assign_role', '指派角色',         '變更會員角色',               'users'),
  -- Settings
  ('settings.view',     '檢視設定',         '檢視網站設定',               'settings'),
  ('settings.edit',     '編輯設定',         '修改網站設定',               'settings'),
  -- Roles
  ('roles.view',        '檢視角色',         '檢視角色與權限',             'roles'),
  ('roles.manage',      '管理角色',         '新增/編輯/刪除角色與權限',   'roles')
ON CONFLICT (slug) DO NOTHING;

-- ==============================================
-- Role Seed Data & Default Permissions
-- ==============================================
INSERT INTO roles (id, label, description, color) VALUES
  ('admin',     '系統管理員', '完整系統存取權限', '#f59e0b'),
  ('marketing', '行銷企劃',   '行銷相關功能存取', '#3b82f6'),
  ('cs',        '客服人員',   '客服與訂單功能',   '#10b981'),
  ('customer',  '一般會員',  '一般消費者',        '#6b7280')
ON CONFLICT (id) DO NOTHING;

-- Admin: all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'admin', id FROM permissions
ON CONFLICT DO NOTHING;

-- Marketing: products, orders (view), discounts, banners, articles, settings (view)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'marketing', id FROM permissions
WHERE slug LIKE 'products%'
   OR slug LIKE 'categories%'
   OR slug = 'orders.view'
   OR slug LIKE 'discounts%'
   OR slug LIKE 'banners%'
   OR slug LIKE 'articles%'
   OR slug = 'settings.view'
ON CONFLICT DO NOTHING;

-- CS: orders, inquiries, messages, users (view)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'cs', id FROM permissions
WHERE slug LIKE 'orders%'
   OR slug LIKE 'inquiries%'
   OR slug LIKE 'messages%'
   OR slug IN ('users.view', 'products.view', 'categories.manage')
ON CONFLICT DO NOTHING;

-- Customer: no admin permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'customer', id FROM permissions
WHERE slug LIKE 'products.view'
   OR slug = 'categories.manage'
ON CONFLICT DO NOTHING;

-- ==============================================
-- Update profiles role_check constraint
-- ==============================================
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role = ANY (ARRAY['admin'::text, 'marketing'::text, 'cs'::text, 'customer'::text]));

-- ==============================================
-- RLS
-- ==============================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Admin-only write on roles/permissions tables
CREATE POLICY "Admins can manage roles" ON roles FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage permissions" ON permissions FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage role_permissions" ON role_permissions FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Everyone can read roles and permissions (needed for UI)
CREATE POLICY "Anyone can view roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Anyone can view permissions" ON permissions FOR SELECT USING (true);
CREATE POLICY "Anyone can view role_permissions" ON role_permissions FOR SELECT USING (true);

-- Drop old is_admin() if it conflicts — we now use the roles table
-- (keep is_admin() as it may be used elsewhere; it's harmless)

COMMIT;