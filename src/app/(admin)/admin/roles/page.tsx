import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import RolesClient from './RolesClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/auth/login?redirect=/admin/roles');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/admin');

  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .order('id');

  const { data: permissions } = await supabase
    .from('permissions')
    .select('*')
    .order('category');

  const { data: rp } = await supabase
    .from('role_permissions')
    .select('role_id, permission_id');

  const rolesWithPerms = (roles || []).map(r => ({
    ...r,
    permissions: (rp || [])
      .filter(o => o.role_id === r.id)
      .map(o => permissions?.find(p => p.id === o.permission_id))
      .filter(Boolean),
  }));

  return { roles: rolesWithPerms, permissions: permissions || [] };
}

export default async function RolesPage() {
  const { roles, permissions } = await getData();
  return <RolesClient roles={roles} permissions={permissions} />;
}
