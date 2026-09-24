// functions/api/payments/create.js
import { createPaymentLink } from '../../_shared/payos.js';
import { products } from '../../../src/data/products.js';

export async function onRequestPost(context) {
  try {
    const requestBody = await context.request.json().catch(() => ({}));
    const {
      customer,
      items,
      orderCode: clientOrderCode,
      paymentMethod: rawPaymentMethod = 'payos',
      shippingRegion: rawShippingRegion = 'can_tho',
      voucherCode = '',
    } = requestBody;

    // Validate paymentMethod
    const validMethods = ['payos', 'cod', 'bank_transfer'];
    const paymentMethod = validMethods.includes(rawPaymentMethod) ? rawPaymentMethod : 'payos';

    // Validate shippingRegion
    const validRegions = ['can_tho', 'nationwide'];
    const shippingRegion = validRegions.includes(rawShippingRegion) ? rawShippingRegion : 'can_tho';

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
        customizationNote: typeof item.customizationNote === 'string' ? item.customizationNote.trim().slice(0, 500) : '',
      });
    }

    const serverBaseSubtotal = serverSubtotal + serverOptionTotal;

    // Server-authoritative shipping fee:
    // Can Tho: 15,000 VND; Nationwide: 30,000 VND; Free shipping for orders >= 250,000 VND
    let serverShippingFee = serverBaseSubtotal >= 250000 ? 0 : (shippingRegion === 'can_tho' ? 15000 : 30000);

    // Server-authoritative voucher validation
    let serverDiscount = 0;
    const cleanVoucher = typeof voucherCode === 'string' ? voucherCode.trim().toUpperCase() : '';

    if (cleanVoucher === 'RAWWELCOME') {
      serverDiscount = Math.round((serverBaseSubtotal * 10) / 100);
    } else if (cleanVoucher === 'FREESHIP') {
      serverDiscount = serverShippingFee;
    } else if (cleanVoucher === 'RESINLOVE') {
      serverDiscount = Math.min(20000, serverBaseSubtotal);
    }

    const serverTotal = Math.max(0, serverBaseSubtotal + serverShippingFee - serverDiscount);

    // 4. Check Cloudflare D1 Database Binding
    const db = context.env.DB || context.env.db || context.env.raw_db || context.env.RAW_DB || context.env.d1 || context.env.D1;
    if (!db) {
      return new Response(
        JSON.stringify({
          error: 'DATABASE_BINDING_MISSING',
          message: 'Chức năng thanh toán đang chờ cấu hình (thiếu DB binding). Bạn vẫn có thể đặt hàng qua email.'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Check PayOS Environment Secrets only if paymentMethod is payos
    if (paymentMethod === 'payos') {
      const payosConfigured = context.env.PAYOS_CLIENT_ID && context.env.PAYOS_API_KEY && context.env.PAYOS_CHECKSUM_KEY;
      if (!payosConfigured) {
        return new Response(
          JSON.stringify({
            error: 'PAYOS_CONFIG_MISSING',
            message: 'Cổng thanh toán PayOS đang chờ cấu hình. Bạn có thể chọn Chuyển khoản VietQR hoặc Thanh toán khi nhận hàng (COD).'
          }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 6. Generate a unique integer orderCode
    const orderCode = clientOrderCode || Date.now();

    // Idempotency check: If this orderCode has already been processed
    try {
      let existingOrder;
      try {
        existingOrder = await db.prepare(
          'SELECT order_code, payos_checkout_url, payment_method FROM orders WHERE order_code = ?'
        ).bind(orderCode).first();
      } catch {
        existingOrder = await db.prepare(
          'SELECT order_code, payos_checkout_url FROM orders WHERE order_code = ?'
        ).bind(orderCode).first().catch(() => null);
      }

      if (existingOrder) {
        const pMethod = existingOrder.payment_method || 'payos';
        const redirectUrl = pMethod === 'payos'
          ? existingOrder.payos_checkout_url
          : `/thanh-toan-thanh-cong?orderCode=${existingOrder.order_code}&method=${pMethod}`;

        if (redirectUrl) {
          return new Response(
            JSON.stringify({
              orderCode: existingOrder.order_code,
              checkoutUrl: redirectUrl,
              paymentMethod: pMethod,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch (checkErr) {
      console.error('Idempotency check database error:', checkErr);
    }

    // 7. Insert order and order items into database
    let orderId;
    try {
      let orderInsertResult;
      try {
        orderInsertResult = await db.prepare(
          `INSERT INTO orders (
             order_code, customer_name, customer_email, customer_phone, customer_address,
             subtotal_vnd, shipping_fee_vnd, discount_vnd, total_vnd,
             payment_method, payment_status, order_status, shipping_region
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'new', ?)`
        ).bind(
          orderCode,
          customer.name.trim(),
          customer.email ? customer.email.trim() : null,
          customer.phone.trim(),
          customer.address ? customer.address.trim() : null,
          serverBaseSubtotal,
          serverShippingFee,
          serverDiscount,
          serverTotal,
          paymentMethod,
          shippingRegion
        ).run();
      } catch (insertErr) {
        if (insertErr.message && (insertErr.message.includes('no such column') || insertErr.message.includes('has no column'))) {
          // Auto-apply missing migration 0002 columns to Cloudflare D1
          await db.prepare("ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'payos'").run().catch(() => {});
          await db.prepare("ALTER TABLE orders ADD COLUMN shipping_region TEXT DEFAULT 'can_tho'").run().catch(() => {});
          await db.prepare("ALTER TABLE order_items ADD COLUMN customization_note TEXT").run().catch(() => {});

          orderInsertResult = await db.prepare(
            `INSERT INTO orders (
               order_code, customer_name, customer_email, customer_phone, customer_address,
               subtotal_vnd, shipping_fee_vnd, discount_vnd, total_vnd,
               payment_method, payment_status, order_status, shipping_region
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'new', ?)`
          ).bind(
            orderCode,
            customer.name.trim(),
            customer.email ? customer.email.trim() : null,
            customer.phone.trim(),
            customer.address ? customer.address.trim() : null,
            serverBaseSubtotal,
            serverShippingFee,
            serverDiscount,
            serverTotal,
            paymentMethod,
            shippingRegion
          ).run();
        } else {
          throw insertErr;
        }
      }

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
        try {
          await db.batch(statements);
        } catch (itemErr) {
          if (itemErr.message && itemErr.message.includes('customization_note')) {
            await db.prepare("ALTER TABLE order_items ADD COLUMN customization_note TEXT").run().catch(() => {});
            await db.batch(statements);
          } else {
            throw itemErr;
          }
        }
      }
    } catch (dbErr) {
      return new Response(
        JSON.stringify({ error: 'DATABASE_ERROR', message: `Lỗi lưu đơn hàng vào hệ thống: ${dbErr.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 8. If non-PayOS (COD or Bank Transfer), redirect directly to success page
    if (paymentMethod !== 'payos') {
      const successUrl = `/thanh-toan-thanh-cong?orderCode=${orderCode}&method=${paymentMethod}`;

      return new Response(
        JSON.stringify({
          orderCode: orderCode,
          checkoutUrl: successUrl,
          paymentMethod: paymentMethod,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 9. Call PayOS API to generate payment link
    const siteUrl = context.env.SITE_URL || 'https://raw-resin-art-work.pages.dev';
    const returnUrl = `${siteUrl}/thanh-toan-thanh-cong?orderCode=${orderCode}&method=payos`;
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
          message: `Không thể tạo link thanh toán từ PayOS: ${payosErr.message}. Vui lòng thử Chuyển khoản VietQR hoặc Thanh toán khi nhận hàng (COD).`
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 10. Update order with PayOS link details
    try {
      await db.prepare(
        `UPDATE orders
         SET payos_payment_link_id = ?, payos_checkout_url = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).bind(payosData.paymentLinkId, payosData.checkoutUrl, orderId).run();
    } catch (updateErr) {
      console.error('Failed to update order with PayOS link info:', updateErr);
    }

    return new Response(
      JSON.stringify({
        orderCode: orderCode,
        checkoutUrl: payosData.checkoutUrl,
        paymentMethod: 'payos',
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
