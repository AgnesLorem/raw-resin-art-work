// functions/api/admin/orders.js
import { verifyAdminToken } from '../../_shared/admin-auth.js';

export async function onRequestGet(context) {
  const auth = await verifyAdminToken(context.request, context.env);
  if (!auth.valid) {
    return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Phiên làm việc hết hạn hoặc không hợp lệ.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'DATABASE_UNAVAILABLE', message: 'Cloudflare D1 chưa được liên kết.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(context.request.url);
  const status = url.searchParams.get('orderStatus');
  const payment = url.searchParams.get('paymentStatus');
  const search = url.searchParams.get('search');

  let query = `SELECT * FROM orders WHERE 1=1`;
  const params = [];

  if (status && status !== 'all') {
    query += ` AND order_status = ?`;
    params.push(status);
  }
  if (payment && payment !== 'all') {
    query += ` AND payment_status = ?`;
    params.push(payment);
  }
  if (search && search.trim()) {
    query += ` AND (order_code LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)`;
    const s = `%${search.trim()}%`;
    params.push(s, s, s);
  }

  query += ` ORDER BY created_at DESC LIMIT 100`;

  const { results: orders } = await db.prepare(query).bind(...params).all();

  // Load items for each order
  const orderList = orders || [];
  const orderIds = orderList.map(o => o.id);
  const itemsMap = {};

  if (orderIds.length > 0) {
    const placeholders = orderIds.map(() => '?').join(',');
    const { results: items } = await db.prepare(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders})`
    ).bind(...orderIds).all();

    for (const item of (items || [])) {
      if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
      let parsedOptions = [];
      try {
        parsedOptions = item.selected_options_json ? JSON.parse(item.selected_options_json) : [];
      } catch {
        parsedOptions = [];
      }
      itemsMap[item.order_id].push({
        ...item,
        selectedOptions: parsedOptions,
      });
    }
  }

  const enrichedOrders = orderList.map(o => ({
    ...o,
    items: itemsMap[o.id] || [],
  }));

  return new Response(JSON.stringify({ orders: enrichedOrders }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPatch(context) {
  const auth = await verifyAdminToken(context.request, context.env);
  if (!auth.valid) {
    return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Phiên làm việc hết hạn hoặc không hợp lệ.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'DATABASE_UNAVAILABLE', message: 'Cloudflare D1 chưa được liên kết.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = await context.request.json().catch(() => ({}));
  const { orderCode, orderStatus, paymentStatus } = body;

  if (!orderCode) {
    return new Response(JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Thiếu mã đơn hàng.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const updates = [];
  const params = [];
  if (orderStatus) {
    updates.push('order_status = ?');
    params.push(orderStatus);
  }
  if (paymentStatus) {
    updates.push('payment_status = ?');
    params.push(paymentStatus);
  }

  if (updates.length === 0) {
    return new Response(JSON.stringify({ error: 'NO_CHANGES', message: 'Không có thông tin cần cập nhật.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(orderCode);

  const query = `UPDATE orders SET ${updates.join(', ')} WHERE order_code = ?`;
  await db.prepare(query).bind(...params).run();

  return new Response(JSON.stringify({ success: true, message: 'Cập nhật đơn hàng thành công.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
