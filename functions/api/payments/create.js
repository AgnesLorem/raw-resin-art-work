// functions/api/payments/create.js
import { createPaymentLink } from '../../_shared/payos.js';
import { products } from '../../../src/data/products.js';

export async function onRequestPost(context) {
  try {
    const requestBody = await context.request.json();
    const { customer, items } = requestBody;

    // 1. Validate customer info
    if (!customer || !customer.name || !customer.phone) {
      return new Response(
        JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Vui lòng điền đầy đủ họ tên và số điện thoại giao hàng.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Giỏ hàng của bạn đang trống.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Recalculate total pricing on the server to prevent client-side tampering
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const dbProduct = products.find((p) => p.slug === item.slug);
      if (!dbProduct) {
        return new Response(
          JSON.stringify({ error: 'PRODUCT_NOT_FOUND', message: `Sản phẩm "${item.name}" không tồn tại trên hệ thống.` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Calculate options price delta
      let optionsDelta = 0;
      const itemOptions = item.selectedOptions || [];
      for (const opt of itemOptions) {
        const dbOpt = (dbProduct.options || []).find((o) => o.name === opt.name);
        if (dbOpt) {
          optionsDelta += dbOpt.priceDeltaVnd;
        }
      }

      const unitPrice = dbProduct.priceVnd + optionsDelta;
      const subtotal = unitPrice * item.quantity;
      calculatedTotal += subtotal;

      validatedItems.push({
        slug: dbProduct.slug,
        name: dbProduct.name,
        quantity: item.quantity,
        unitPriceVnd: unitPrice,
        selectedOptions: itemOptions,
        customizationNote: item.customizationNote || '',
      });
    }

    // 4. Check Cloudflare D1 Database Binding
    const db = context.env.DB;
    if (!db) {
      return new Response(
        JSON.stringify({
          error: 'DATABASE_BINDING_MISSING',
          message: 'Chức năng thanh toán trực tuyến đang chờ cấu hình (thiếu DB binding). Bạn vẫn có thể đặt hàng qua email.'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Check PayOS Environment Secrets
    const payosConfigured = context.env.PAYOS_CLIENT_ID && context.env.PAYOS_API_KEY && context.env.PAYOS_CHECKSUM_KEY;
    if (!payosConfigured) {
      return new Response(
        JSON.stringify({
          error: 'PAYOS_CONFIG_MISSING',
          message: 'Chức năng thanh toán trực tuyến đang chờ cấu hình (thiếu PayOS secrets). Bạn vẫn có thể đặt hàng qua email.'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 6. Generate a unique integer orderCode (must be positive integer, safe up to 9007199254740991)
    // Date.now() gives ~13 digits, completely safe and unique.
    const orderCode = Date.now();

    // 7. Insert order and order items into database
    let orderId;
    try {
      const orderInsertResult = await db.prepare(
        `INSERT INTO orders (order_code, customer_name, customer_email, customer_phone, customer_address, subtotal_vnd, total_vnd, payment_status, order_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'new')`
      ).bind(
        orderCode,
        customer.name,
        customer.email || null,
        customer.phone,
        customer.address || null,
        calculatedTotal,
        calculatedTotal
      ).run();

      orderId = orderInsertResult.meta.last_row_id;

      // Insert items using batch to make it transactional
      const statements = [];
      for (const item of validatedItems) {
        statements.push(
          db.prepare(
            `INSERT INTO order_items (order_id, product_slug, product_name, quantity, unit_price_vnd, selected_options_json, customization_note)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            orderId,
            item.slug,
            item.name,
            item.quantity,
            item.unitPriceVnd,
            JSON.stringify(item.selectedOptions),
            item.customizationNote || null
          )
        );
      }

      if (statements.length > 0) {
        await db.batch(statements);
      }
    } catch (dbErr) {
      return new Response(
        JSON.stringify({ error: 'DATABASE_ERROR', message: `Lỗi lưu đơn hàng vào hệ thống: ${dbErr.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 8. Call PayOS API to generate payment link
    const siteUrl = context.env.SITE_URL || 'https://raw-resin-art-work.pages.dev';
    const returnUrl = `${siteUrl}/thanh-toan-thanh-cong?orderCode=${orderCode}`;
    const cancelUrl = `${siteUrl}/thanh-toan-bi-huy?orderCode=${orderCode}`;

    // Description must be alphanumeric without special characters, max 25 chars
    const description = `RAW${orderCode}`.substring(0, 25);

    const payosPayload = {
      orderCode: orderCode,
      amount: calculatedTotal,
      description: description,
      cancelUrl: cancelUrl,
      returnUrl: returnUrl,
      buyerName: customer.name,
      buyerPhone: customer.phone,
      buyerEmail: customer.email || undefined,
      buyerAddress: customer.address || undefined,
    };

    let payosData;
    try {
      payosData = await createPaymentLink(context.env, payosPayload);
    } catch (payosErr) {
      // Cleanup order on PayOS link generation failure to avoid stale pending orders
      await db.prepare('DELETE FROM orders WHERE id = ?').bind(orderId).run();
      await db.prepare('DELETE FROM order_items WHERE order_id = ?').bind(orderId).run();

      return new Response(
        JSON.stringify({
          error: 'PAYOS_API_ERROR',
          message: `Không thể tạo link thanh toán từ PayOS: ${payosErr.message}. Vui lòng thử lại hoặc sử dụng Đặt qua email.`
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 9. Update order with PayOS link details
    try {
      await db.prepare(
        `UPDATE orders
         SET payos_payment_link_id = ?, payos_checkout_url = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).bind(payosData.paymentLinkId, payosData.checkoutUrl, orderId).run();
    } catch (updateErr) {
      // Log error but proceed since we already got the checkout URL and order is inserted
      console.error('Failed to update order with PayOS link info:', updateErr);
    }

    // 10. Return order details and redirect URL
    return new Response(
      JSON.stringify({
        orderCode: orderCode,
        checkoutUrl: payosData.checkoutUrl,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'INTERNAL_SERVER_ERROR', message: `Đã xảy ra lỗi hệ thống: ${err.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
