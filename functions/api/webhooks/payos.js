// functions/api/webhooks/payos.js
import { verifyPayosWebhook } from '../../_shared/payos.js';

export async function onRequestPost(context) {
  try {
    const requestBody = await context.request.json();

    // 1. Verify Cloudflare D1 Database Binding
    const db = context.env.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ error: 'DATABASE_BINDING_MISSING', message: 'DB binding is missing on Cloudflare' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verify signature using PAYOS_CHECKSUM_KEY
    let isValidSignature = false;
    try {
      isValidSignature = await verifyPayosWebhook(context.env, requestBody);
    } catch (verifyErr) {
      return new Response(
        JSON.stringify({ error: 'VERIFICATION_ERROR', message: verifyErr.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidSignature) {
      return new Response(
        JSON.stringify({ error: 'INVALID_SIGNATURE', message: 'Chữ ký webhook không hợp lệ.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Process payment status
    const { data } = requestBody;
    if (!data || data.orderCode === undefined || data.orderCode === null || data.amount === undefined || data.amount === null) {
      return new Response(
        JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Dữ liệu webhook thiếu trường bắt buộc (orderCode/amount).' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const orderCode = data.orderCode;
    const amount = data.amount;
    const isSuccess = requestBody.code === '00'; // PayOS code '00' indicates success

    // Look up the order in the database
    const order = await db.prepare(
      'SELECT id, total_vnd, payment_status FROM orders WHERE order_code = ?'
    ).bind(orderCode).first();

    if (!order) {
      return new Response(
        JSON.stringify({ error: 'ORDER_NOT_FOUND', message: `Không tìm thấy đơn hàng với mã ${orderCode}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Webhook idempotency safeguard: If the order has already been marked as paid, return 200 immediately
    if (order.payment_status === 'paid') {
      return new Response(
        JSON.stringify({ ok: true, message: 'Đơn hàng đã được xử lý thanh toán trước đó.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const orderId = order.id;

    if (isSuccess) {
      // Update order status to paid
      await db.prepare(
        `UPDATE orders
         SET payment_status = 'paid', order_status = 'paid', updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).bind(orderId).run();

      // Log payment history
      await db.prepare(
        `INSERT INTO payments (order_id, provider, provider_payment_link_id, amount_vnd, status, raw_webhook_json)
         VALUES (?, 'payos', ?, ?, 'paid', ?)`
      ).bind(
        orderId,
        data.paymentLinkId || null,
        amount,
        JSON.stringify(requestBody)
      ).run();
    } else {
      // Update order status to failed/cancelled
      await db.prepare(
        `UPDATE orders
         SET payment_status = 'failed', order_status = 'cancelled', updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).bind(orderId).run();

      // Log failed payment history
      await db.prepare(
        `INSERT INTO payments (order_id, provider, provider_payment_link_id, amount_vnd, status, raw_webhook_json)
         VALUES (?, 'payos', ?, ?, 'failed', ?)`
      ).bind(
        orderId,
        data.paymentLinkId || null,
        amount,
        JSON.stringify(requestBody)
      ).run();
    }

    // Log webhook call (audit logging, safe from leaks)
    const logData = {
      event: 'PAYOS_WEBHOOK',
      orderCode: orderCode,
      orderId: orderId,
      amount: amount,
      paymentStatus: isSuccess ? 'paid' : 'failed',
      ip: context.request.headers.get('CF-Connecting-IP') || 'unknown',
      userAgent: context.request.headers.get('User-Agent') || 'unknown',
      timestamp: new Date().toISOString()
    };
    console.log(JSON.stringify(logData));

    // 4. Return success response to PayOS
    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'INTERNAL_SERVER_ERROR', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
