// functions/api/admin/stats.js
import { verifyAdminToken } from '../../_shared/admin-auth.js';

export async function onRequestGet(context) {
  const auth = await verifyAdminToken(context.request, context.env);
  if (!auth.valid) {
    return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Phiên làm việc hết hạn hoặc không hợp lệ.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const db = context.env.DB || context.env.db || context.env.raw_db || context.env.RAW_DB || context.env.d1 || context.env.D1;
  if (!db) {
    return new Response(JSON.stringify({ error: 'DATABASE_UNAVAILABLE', message: 'Cloudflare D1 chưa được liên kết.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const totalOrdersRes = await db.prepare(`SELECT COUNT(*) as count FROM orders`).first();
    const newOrdersRes = await db.prepare(`SELECT COUNT(*) as count FROM orders WHERE order_status = 'new'`).first();
    const producingRes = await db.prepare(`SELECT COUNT(*) as count FROM orders WHERE order_status = 'producing'`).first();
    const revenueRes = await db.prepare(`SELECT SUM(total_vnd) as revenue FROM orders WHERE payment_status = 'paid'`).first();

    return new Response(JSON.stringify({
      totalOrders: totalOrdersRes?.count || 0,
      newOrders: newOrdersRes?.count || 0,
      producingOrders: producingRes?.count || 0,
      totalRevenueVnd: revenueRes?.revenue || 0,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'QUERY_FAILED', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
