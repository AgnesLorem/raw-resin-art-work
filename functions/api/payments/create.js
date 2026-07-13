// functions/api/payments/create.js
import { createPaymentLink } from '../../_shared/payos.js';
import { products } from '../../../src/data/products.js';

export async function onRequestPost(context) {
  try {
    const requestBody = await context.request.json();
    const { customer, items, orderCode: clientOrderCode } = requestBody;

    // 1. Validate customer info
    if (!customer || typeof customer.name !== 'string' || !customer.name.trim() ||
        typeof customer.phone !== 'string' || !customer.phone.trim()) {
      return new Response(
        JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Vui lòng điền đầy đủ họ tên và số điện thoại giao hàng.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Protect against overflow payloads
    if (customer.name.length > 100) {
      return new Response(
        JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Họ tên quá dài (tối đa 100 ký tự).' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (customer.phone.length > 20) {
      return new Response(
        JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Số điện thoại quá dài (tối đa 20 ký tự).' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (customer.email) {
      if (customer.email.length > 255) {
        return new Response(
          JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Địa chỉ email quá dài (tối đa 255 ký tự).' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customer.email)) {
        return new Response(
          JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Địa chỉ email không hợp lệ.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (customer.address && customer.address.length > 500) {
      return new Response(
        JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Địa chỉ quá dài (tối đa 500 ký tự).' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (clientOrderCode && (typeof clientOrderCode !== 'number' || !Number.isSafeInteger(clientOrderCode) || clientOrderCode <= 0)) {
      return new Response(
        JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Mã đơn hàng không hợp lệ.' }),
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
    let serverSubtotal = 0;
    let serverOptionTotal = 0;
    const serverShippingFee = 0; // Free shipping
    const validatedItems = [];

    for (const item of items) {
      const dbProduct = products.find((p) => p.slug === item.slug);
      if (!dbProduct) {
        return new Response(
          JSON.stringify({ error: 'PRODUCT_NOT_FOUND', message: `Sản phẩm "${item.name}" không tồn tại trên hệ thống.` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Validate quantity
      if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        return new Response(
          JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Số lượng sản phẩm không hợp lệ.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Validate unitPrice (product base price)
      if (typeof dbProduct.priceVnd !== 'number' || dbProduct.priceVnd <= 0) {
        return new Response(
          JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Giá sản phẩm không hợp lệ.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Calculate option price delta and validate options
      let itemOptionDelta = 0;
      const itemOptions = item.selectedOptions || [];
      for (const opt of itemOptions) {
        const dbOpt = (dbProduct.options || []).find((o) => o.name === opt.name);
        if (dbOpt) {
          if (typeof dbOpt.priceDeltaVnd !== 'number' || isNaN(dbOpt.priceDeltaVnd)) {
            return new Response(
              JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Tùy chọn sản phẩm có giá không hợp lệ.' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
          }
          itemOptionDelta += dbOpt.priceDeltaVnd;
        } else {
          return new Response(
            JSON.stringify({ error: 'VALIDATION_FAILED', message: `Tùy chọn "${opt.name}" không hợp lệ cho sản phẩm này.` }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      const productSubtotal = dbProduct.priceVnd * item.quantity;
      const productOptionTotal = itemOptionDelta * item.quantity;

      serverSubtotal += productSubtotal;
      serverOptionTotal += productOptionTotal;

      const unitPrice = dbProduct.priceVnd + itemOptionDelta;

      validatedItems.push({
        slug: dbProduct.slug,
        name: dbProduct.name,
        quantity: item.quantity,
        unitPriceVnd: unitPrice,
        selectedOptions: itemOptions,
        customizationNote: item.customizationNote || '',
      });
    }

    const serverTotal = serverSubtotal + serverOptionTotal + serverShippingFee;

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

    // 6. Generate a unique integer orderCode
    const orderCode = clientOrderCode || Date.now();

    // Idempotency check: If this orderCode has already been processed and successfully created, return the existing checkoutUrl
    try {
      const existingOrder = await db.prepare(
        'SELECT order_code, payos_checkout_url FROM orders WHERE order_code = ?'
      ).bind(orderCode).first();

      if (existingOrder && existingOrder.payos_checkout_url) {
        return new Response(
          JSON.stringify({
            orderCode: existingOrder.order_code,
            checkoutUrl: existingOrder.payos_checkout_url,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (checkErr) {
      console.error('Idempotency check database error:', checkErr);
    }

    // 7. Insert order and order items into database
    let orderId;
    try {
      const orderInsertResult = await db.prepare(
        `INSERT INTO orders (order_code, customer_name, customer_email, customer_phone, customer_address, subtotal_vnd, shipping_fee_vnd, total_vnd, payment_status, order_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'new')`
      ).bind(
        orderCode,
        customer.name.trim(),
        customer.email ? customer.email.trim() : null,
        customer.phone.trim(),
        customer.address ? customer.address.trim() : null,
        serverSubtotal + serverOptionTotal,
        serverShippingFee,
        serverTotal
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
      amount: serverTotal,
      description: description,
      cancelUrl: cancelUrl,
      returnUrl: returnUrl,
      buyerName: customer.name.trim(),
      buyerPhone: customer.phone.trim(),
      buyerEmail: customer.email ? customer.email.trim() : undefined,
      buyerAddress: customer.address ? customer.address.trim() : undefined,
    };

    let payosData;
    try {
      payosData = await createPaymentLink(context.env, payosPayload);
    } catch (payosErr) {
      // Mark order as failed in database instead of deleting to allow auditing/debugging
      try {
        await db.prepare(
          `UPDATE orders
           SET payment_status = 'failed', order_status = 'cancelled', updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        ).bind(orderId).run();
      } catch (dbErr) {
        console.error('Failed to mark order as failed on PayOS link error:', dbErr);
      }

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

    // Log the created order (audit logging, safe from leaks)
    const logData = {
      event: 'CREATE_PAYMENT_LINK',
      cfRay: context.request.headers.get('cf-ray') || 'unknown',
      orderCode: orderCode,
      orderId: orderId,
      amount: serverTotal,
      paymentStatus: 'pending',
      ip: context.request.headers.get('CF-Connecting-IP') || 'unknown',
      userAgent: context.request.headers.get('User-Agent') || 'unknown',
      timestamp: new Date().toISOString()
    };
    console.log(JSON.stringify(logData));

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
