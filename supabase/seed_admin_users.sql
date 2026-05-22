-- ==========================================
-- mall2 預設管理員帳號建立腳本
-- 請在 Supabase SQL Editor 中執行此腳本
-- ==========================================

DO $$
DECLARE
  admin_id     UUID := gen_random_uuid();
  marketing_id UUID := gen_random_uuid();
  cs_id        UUID := gen_random_uuid();
BEGIN

  -- ---- 1. admin@mall2.com ----
  INSERT INTO auth.users (
    instance_id, id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated', 'authenticated',
    'admin@mall2.com',
    crypt('admin1234', gen_salt('bf')),
    now(),
    '{"full_name": "Admin"}'::jsonb,
    now(), now(),
    '', '', '', ''
  );

  -- ---- 2. marketing@mall2.com ----
  INSERT INTO auth.users (
    instance_id, id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    marketing_id,
    'authenticated', 'authenticated',
    'marketing@mall2.com',
    crypt('admin1234', gen_salt('bf')),
    now(),
    '{"full_name": "Marketing"}'::jsonb,
    now(), now(),
    '', '', '', ''
  );

  -- ---- 3. cs@mall2.com ----
  INSERT INTO auth.users (
    instance_id, id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    cs_id,
    'authenticated', 'authenticated',
    'cs@mall2.com',
    crypt('admin1234', gen_salt('bf')),
    now(),
    '{"full_name": "Customer Service"}'::jsonb,
    now(), now(),
    '', '', '', ''
  );

  -- ---- 4. Set all profiles to admin role ----
  -- (The trigger `on_auth_user_created` should have auto-created the profile rows.
  --  We now upgrade their role to 'admin'.)
  UPDATE public.profiles SET role = 'admin', name = 'Admin'            WHERE id = admin_id;
  UPDATE public.profiles SET role = 'admin', name = 'Marketing'        WHERE id = marketing_id;
  UPDATE public.profiles SET role = 'admin', name = 'Customer Service' WHERE id = cs_id;

END $$;

-- ---- Verify: check the 3 accounts were created successfully ----
SELECT
  u.email,
  p.name,
  p.role,
  u.email_confirmed_at IS NOT NULL AS email_verified,
  u.created_at
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email IN ('admin@mall2.com', 'marketing@mall2.com', 'cs@mall2.com')
ORDER BY u.email;
