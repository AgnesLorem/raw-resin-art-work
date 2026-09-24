// functions/api/orders/lookup.js

export async function onRequestGet(context) {
  const db = context.env.DB || context.env.raw_db || context.env.RAW_DB || context.env.d1 || context.env.D1;
  if (!db) {
    return new Response(JSON.stringify({ error: 'DATABASE_UNAVAILABLE', message: 'Hệ thống tra cứu đang bận.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(context.request.url);
  const rawQuery = (url.searchParams.get('query') || '').trim();

  // Strip common separators (spaces, dots, hyphens)
  const cleanQuery = rawQuery.replace(/[\s\-\.]/g, '');

  if (!cleanQuery || cleanQuery.length < 6) {
    return new Response(JSON.stringify({
      error: 'VALIDATION_FAILED',
      message: 'Vui lòng nhập Mã đơn hàng (tối thiểu 6 số) hoặc Số điện thoại đặt hàng đầy đủ.'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    let orders = [];
    const isOrderCode = /^\d{6,15}$/.test(cleanQuery);
    const isPhone = /^(0|\+?84)?\d{9,11}$/.test(cleanQuery);

    if (isOrderCode) {
      // First try by order_code
      const { results } = await db.prepare(`SELECT * FROM orders WHERE order_code = ?`).bind(Number(cleanQuery)).all();
      orders = results || [];
    }

    // If no order code match and query matches phone format, look up by exact phone
    if (orders.length === 0 && isPhone) {
      const normalizedPhone = cleanQuery.startsWith('+84')
        ? '0' + cleanQuery.slice(3)
        : cleanQuery.startsWith('84') && cleanQuery.length > 9
        ? '0' + cleanQuery.slice(2)
        : cleanQuery;

      const { results } = await db.prepare(
        `SELECT * FROM orders 
         WHERE customer_phone = ? 
            OR REPLACE(REPLACE(customer_phone, ' ', ''), '-', '') = ? 
            OR customer_phone = ?
         ORDER BY created_at DESC LIMIT 5`
      ).bind(rawQuery, cleanQuery, normalizedPhone).all();
      orders = results || [];
    }

    if (orders.length === 0) {
      return new Response(JSON.stringify({ orders: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const orderIds = orders.map(o => o.id);
    const placeholders = orderIds.map(() => '?').join(',');
    const { results: items } = await db.prepare(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders})`
    ).bind(...orderIds).all();

    const itemsMap = {};
    for (const item of (items || [])) {
      if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
      let parsedOptions = [];
      try {
        parsedOptions = item.selected_options_json ? JSON.parse(item.selected_options_json) : [];
      } catch {
        parsedOptions = [];
      }
      itemsMap[item.order_id].push({
        productName: item.product_name,
        productSlug: item.product_slug,
        quantity: item.quantity,
        unitPriceVnd: item.unit_price_vnd,
        selectedOptions: parsedOptions,
        customizationNote: item.customization_note,
      });
    }

    // Sanitize customer data for public view (mask phone and exclude full raw address)
    const sanitizedOrders = orders.map(o => {
      const phone = o.customer_phone || '';
      const maskedPhone = phone.length > 6 ? `${phone.slice(0, 3)}****${phone.slice(-3)}` : '***';
      return {
        orderCode: o.order_code,
        customerName: o.customer_name,
        customerPhoneMasked: maskedPhone,
        subtotalVnd: o.subtotal_vnd,
        shippingFeeVnd: o.shipping_fee_vnd,
        discountVnd: o.discount_vnd,
        totalVnd: o.total_vnd,
        paymentMethod: o.payment_method || 'payos',
        paymentStatus: o.payment_status,
        orderStatus: o.order_status,
        shippingRegion: o.shipping_region || 'can_tho',
        createdAt: o.created_at,
        items: itemsMap[o.id] || [],
      };
    });

    return new Response(JSON.stringify({ orders: sanitizedOrders }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'LOOKUP_FAILED', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
