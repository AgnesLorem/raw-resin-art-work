// functions/api/payments/status.js

export async function onRequestGet(context) {
  try {
    const { searchParams } = new URL(context.request.url);
    const orderCodeStr = searchParams.get('orderCode');

    if (!orderCodeStr) {
      return new Response(
        JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Mã đơn hàng (orderCode) là bắt buộc.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const orderCode = Number(orderCodeStr);
    if (isNaN(orderCode)) {
      return new Response(
        JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Mã đơn hàng không hợp lệ.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify Cloudflare D1 Database Binding
    const db = context.env.DB;
    if (!db) {
      return new Response(
        JSON.stringify({
          error: 'DATABASE_BINDING_MISSING',
          message: 'Chức năng tra cứu đang chờ cấu hình (thiếu DB binding).'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Query order from database
    const order = await db.prepare(
      `SELECT order_code, payment_status, order_status, total_vnd
       FROM orders
       WHERE order_code = ?`
    ).bind(orderCode).first();

    if (!order) {
      return new Response(
        JSON.stringify({ error: 'ORDER_NOT_FOUND', message: `Không tìm thấy đơn hàng với mã ${orderCode}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log status check (audit logging, safe from leaks)
    const logData = {
      event: 'CHECK_STATUS',
      orderCode: orderCode,
      amount: order.total_vnd,
      paymentStatus: order.payment_status,
      ip: context.request.headers.get('CF-Connecting-IP') || 'unknown',
      userAgent: context.request.headers.get('User-Agent') || 'unknown',
      timestamp: new Date().toISOString()
    };
    console.log(JSON.stringify(logData));

    return new Response(
      JSON.stringify({
        orderCode: order.order_code,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        totalVnd: order.total_vnd,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'INTERNAL_SERVER_ERROR', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
