import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '未登入' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: '無權限' }, { status: 403 });

    const { role_id, permission_id } = await req.json();
    if (!role_id || !permission_id) return NextResponse.json({ error: '缺少參數' }, { status: 400 });

    const { error } = await supabase
      .from('role_permissions')
      .insert({ role_id, permission_id });

    if (error?.code === '23505') {
      return NextResponse.json({ error: '已存在此權限' }, { status: 409 });
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '未登入' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: '無權限' }, { status: 403 });

    const { role_id, permission_id } = await req.json();
    if (!role_id || !permission_id) return NextResponse.json({ error: '缺少參數' }, { status: 400 });

    // Prevent removing admin's last permission (admin should always keep all)
    if (role_id === 'admin') {
      return NextResponse.json({ error: '系統管理員的權限不可變更' }, { status: 400 });
    }

    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', role_id)
      .eq('permission_id', permission_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}