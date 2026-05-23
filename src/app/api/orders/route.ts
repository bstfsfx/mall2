// filepath: src/app/api/orders/route.ts
/**
 * Orders API Route - Example of CSRF-protected endpoint
 * 
 * This demonstrates how to protect your API routes with CSRF validation.
 * All state-changing operations (POST, PUT, DELETE) require a valid CSRF token.
 * 
 * Usage:
 * 1. Ensure CSRF token is fetched on page load (AuthContext does this automatically)
 * 2. Use the csrfFetch from useAuth() or useCSRF() hook for requests
 * 3. The server will automatically validate the token
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCSRFValidation } from '@/lib/csrf-middleware';
import { supabase } from '@/lib/supabase';

// GET /api/orders - List user's orders (no CSRF needed for read operations)
export async function GET(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // RLS will handle data access control
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}

// POST /api/orders - Create new order (CSRF protected)
export async function POST(request: NextRequest) {
  // Validate CSRF token for state-changing operation
  const csrfValidation = await withCSRFValidation(request);

  if (!csrfValidation.valid) {
    return NextResponse.json(
      { error: csrfValidation.error ?? 'CSRF validation failed' },
      { status: 403 }
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items, shipping_address, payment_method } = body;

    // Calculate total
    let total_amount = 0;
    for (const item of items) {
      total_amount += item.price * item.quantity;
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount,
        shipping_address,
        payment_method,
        status: 'pending',
        payment_status: 'unpaid',
        shipping_status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Rollback order
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// PUT /api/orders - Update order (CSRF protected)
export async function PUT(request: NextRequest) {
  const csrfValidation = await withCSRFValidation(request);

  if (!csrfValidation.valid) {
    return NextResponse.json(
      { error: csrfValidation.error ?? 'CSRF validation failed' },
      { status: 403 }
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { order_id, ...updates } = body;

    // Verify ownership
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', order_id)
      .single();

    if (!existingOrder || existingOrder.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: data });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}