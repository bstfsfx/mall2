import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '未登入' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: '無權限' }, { status: 403 });

    // Fetch roles
    const { data: roles, error: rolesErr } = await supabase
      .from('roles')
      .select('*')
      .order('id');

    if (rolesErr) return NextResponse.json({ error: rolesErr.message }, { status: 500 });

    // Fetch permissions
    const { data: permissions, error: permErr } = await supabase
      .from('permissions')
      .select('*')
      .order('category');

    if (permErr) return NextResponse.json({ error: permErr.message }, { status: 500 });

    // Fetch role-permission mappings
    const { data: rp, error: rpErr } = await supabase
      .from('role_permissions')
      .select('role_id, permission_id');

    if (rpErr) return NextResponse.json({ error: rpErr.message }, { status: 500 });

    // Attach permissions to each role
    const rolesWithPerms = (roles || []).map(r => ({
      ...r,
      permissions: (rp || [])
        .filter(o => o.role_id === r.id)
        .map(o => permissions?.find(p => p.id === o.permission_id))
        .filter(Boolean),
    }));

    return NextResponse.json({ roles: rolesWithPerms, permissions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}