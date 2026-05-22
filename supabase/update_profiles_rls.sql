-- ==========================================
-- mall2 Supabase Profiles RLS Policy Update
-- ==========================================

-- 1. Check if the update policy already exists (to avoid errors) and create it.
-- This policy permits users with role = 'admin' to run UPDATE commands on public.profiles.
-- It avoids infinite recursion by resolving SELECT permissions on the admin's own profile first.

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Note: Ensure this SQL is executed in your Supabase SQL Editor to allow role-toggling in `/admin/users`.
