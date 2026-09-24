# Admin, Payment & Cart Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng trọn gói phân hệ Quản trị Admin Dashboard, Đa dạng hóa 3 phương thức thanh toán (PayOS, COD, VietQR), Nâng cấp Giỏ hàng (Cart Drawer) kèm ghi chú cá nhân hóa cho từng sản phẩm resin & voucher giảm giá, Tính phí ship thông minh và Trang tra cứu tiến độ đơn hàng cho khách.

**Architecture:** Mở rộng Cloudflare D1 schema và Cloudflare Pages Functions (`functions/api/`) với cơ chế xác thực Web Crypto HMAC an toàn cho Admin. Phía Frontend (React 18 + Vite) xây dựng các trang chuyên biệt `/admin`, `/admin/login`, `/tra-cuu-don-hang`, đồng thời nâng cấp `cartService`, `priceService`, `CartDrawer`, `CheckoutPage` và `PaymentSuccessPage`.

**Tech Stack:** React 18, React Router v6, Cloudflare Pages Functions, Cloudflare D1 (SQLite), Web Crypto API (HMAC-SHA256), VietQR API (chuẩn Napas247), CSS Variables.

**Spec:** [docs/FUTURE_SCALE_PLAN.md](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/FUTURE_SCALE_PLAN.md) và quyết định kiến trúc đã chốt qua `/grill-me`.

## Global Constraints
- Tất cả API endpoints chạy trên Cloudflare Pages Functions runtime (V8 serverless, tương thích hoàn toàn `crypto.subtle`, `Response`, `Request`).
- Server Authoritative: Phí vận chuyển, giảm giá voucher và giá sản phẩm/option bắt buộc tính lại và xác thực trên server.
- Đặc thù resin handmade: Hỗ trợ ghi chú cá nhân hóa (`customizationNote`: chữ khắc tên, màu sắc, charm yêu cầu) cho từng sản phẩm riêng biệt trong giỏ và đơn hàng.
- Giữ nguyên thiết kế responsive và design tokens (`--bg-primary: #FAF7F2`, `--forest: #2D5A43`, `--burgundy: #4A1525`, `--amber: #D48B47`).

---

### Task 1: Database Schema & Migration (Add Payment Methods & Shipping Region)

**Files:**
- Modify: `db/schema.sql`
- Create: `db/migrations/0002_add_payment_method_and_region.sql`

**Interfaces:**
- Consumes: Bảng `orders`, `order_items`, `payments` hiện có.
- Produces: Cột `payment_method TEXT DEFAULT 'payos'` và `shipping_region TEXT DEFAULT 'can_tho'` trong bảng `orders`.

- [ ] **Step 1: Create migration file**

Tạo file `db/migrations/0002_add_payment_method_and_region.sql`:
```sql
-- db/migrations/0002_add_payment_method_and_region.sql
ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'payos';
ALTER TABLE orders ADD COLUMN shipping_region TEXT DEFAULT 'can_tho';
```

- [ ] **Step 2: Update db/schema.sql with the new columns**

Cập nhật bảng `orders` trong `db/schema.sql`:
```sql
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_code INTEGER UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  subtotal_vnd INTEGER NOT NULL CHECK(subtotal_vnd >= 0),
  shipping_fee_vnd INTEGER DEFAULT 0 CHECK(shipping_fee_vnd >= 0),
  discount_vnd INTEGER DEFAULT 0 CHECK(discount_vnd >= 0),
  total_vnd INTEGER NOT NULL CHECK(total_vnd >= 0),
  payment_method TEXT DEFAULT 'payos',
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'new',
  shipping_region TEXT DEFAULT 'can_tho',
  payos_payment_link_id TEXT,
  payos_checkout_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

- [ ] **Step 3: Verification**

Kiểm tra cú pháp SQL hợp lệ không có lỗi syntax.

---

### Task 2: Admin Security & Session Management (HMAC Web Crypto)

**Files:**
- Create: `functions/_shared/admin-auth.js`

**Interfaces:**
- Consumes: `context.env.ADMIN_SECRET` hoặc fallback secret key `raw_admin_secret_su26`.
- Produces: `generateAdminToken(env)` và `verifyAdminToken(request, env)`.

- [ ] **Step 1: Implement Web Crypto HMAC token generation and verification**

Tạo file `functions/_shared/admin-auth.js`:
```javascript
// functions/_shared/admin-auth.js

const DEFAULT_SECRET = 'raw_admin_secret_su26';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecret(env) {
  return (env && env.ADMIN_SECRET) ? env.ADMIN_SECRET : DEFAULT_SECRET;
}

async function getCryptoKey(secretStr) {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secretStr),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function arrayBufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToArrayBuffer(hex) {
  const typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
  return typedArray.buffer;
}

/**
 * Generate a signed session token: <timestamp>.<signature>
 */
export async function generateAdminToken(env) {
  const secret = getSecret(env);
  const key = await getCryptoKey(secret);
  const now = Date.now();
  const payload = `admin_${now}`;
  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const sigHex = arrayBufferToHex(signature);
  const token = `${now}.${sigHex}`;
  return {
    token,
    expiresAt: now + TOKEN_TTL_MS,
  };
}

/**
 * Verify request Authorization header: Bearer <token>
 */
export async function verifyAdminToken(request, env) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'MISSING_OR_INVALID_AUTH_HEADER' };
    }
    const token = authHeader.slice(7).trim();
    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'MALFORMED_TOKEN' };
    }
    const [timestampStr, sigHex] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      return { valid: false, error: 'INVALID_TIMESTAMP' };
    }
    // Check expiration
    if (Date.now() - timestamp > TOKEN_TTL_MS) {
      return { valid: false, error: 'TOKEN_EXPIRED' };
    }
    const secret = getSecret(env);
    const key = await getCryptoKey(secret);
    const payload = `admin_${timestamp}`;
    const enc = new TextEncoder();
    const sigBuffer = hexToArrayBuffer(sigHex);
    const isValid = await crypto.subtle.verify('HMAC', key, sigBuffer, enc.encode(payload));
    if (!isValid) {
      return { valid: false, error: 'SIGNATURE_MISMATCH' };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
```

- [ ] **Step 2: Verification**

Kiểm tra cú pháp module JavaScript export đúng chuẩn ES modules.

---

### Task 3: Admin Auth API Endpoint

**Files:**
- Create: `functions/api/admin/login.js`

**Interfaces:**
- Consumes: `generateAdminToken` từ `functions/_shared/admin-auth.js`.
- Produces: `POST /api/admin/login`.

- [ ] **Step 1: Implement Admin Login endpoint**

Tạo `functions/api/admin/login.js`:
```javascript
// functions/api/admin/login.js
import { generateAdminToken } from '../../_shared/admin-auth.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const { secretKey } = body;

    const expectedSecret = context.env.ADMIN_SECRET || 'raw_admin_secret_su26';

    if (!secretKey || secretKey.trim() !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Khóa quản trị (Admin Key) không chính xác.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const session = await generateAdminToken(context.env);

    return new Response(
      JSON.stringify({
        success: true,
        token: session.token,
        expiresAt: session.expiresAt,
        message: 'Đăng nhập trang quản trị thành công.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

---

### Task 4: Admin Orders & Stats APIs

**Files:**
- Create: `functions/api/admin/orders.js`
- Create: `functions/api/admin/stats.js`

**Interfaces:**
- Consumes: `verifyAdminToken`, Cloudflare D1 binding `context.env.DB`.
- Produces: `GET /api/admin/orders`, `PATCH /api/admin/orders`, `GET /api/admin/stats`.

- [ ] **Step 1: Implement Admin Orders API**

Tạo `functions/api/admin/orders.js`:
```javascript
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
  if (search) {
    query += ` AND (order_code LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += ` ORDER BY created_at DESC LIMIT 100`;

  const { results: orders } = await db.prepare(query).bind(...params).all();

  // Load items for each order
  const orderIds = (orders || []).map(o => o.id);
  let itemsMap = {};
  if (orderIds.length > 0) {
    const placeholders = orderIds.map(() => '?').join(',');
    const { results: items } = await db.prepare(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders})`
    ).bind(...orderIds).all();

    for (const item of (items || [])) {
      if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
      itemsMap[item.order_id].push({
        ...item,
        selectedOptions: item.selected_options_json ? JSON.parse(item.selected_options_json) : [],
      });
    }
  }

  const enrichedOrders = (orders || []).map(o => ({
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
    return new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'DATABASE_UNAVAILABLE' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
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
    return new Response(JSON.stringify({ error: 'NO_CHANGES' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
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
```

- [ ] **Step 2: Implement Admin Stats API**

Tạo `functions/api/admin/stats.js`:
```javascript
// functions/api/admin/stats.js
import { verifyAdminToken } from '../../_shared/admin-auth.js';

export async function onRequestGet(context) {
  const auth = await verifyAdminToken(context.request, context.env);
  if (!auth.valid) {
    return new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'DATABASE_UNAVAILABLE' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }

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
}
```

---

### Task 5: Public Order Lookup API

**Files:**
- Create: `functions/api/orders/lookup.js`

**Interfaces:**
- Consumes: Cloudflare D1 binding `context.env.DB`.
- Produces: `GET /api/orders/lookup?query=<orderCode_or_phone>`.

- [ ] **Step 1: Implement lookup endpoint**

Tạo `functions/api/orders/lookup.js`:
```javascript
// functions/api/orders/lookup.js

export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'DATABASE_UNAVAILABLE', message: 'Hệ thống tra cứu đang bận.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(context.request.url);
  const query = (url.searchParams.get('query') || '').trim();

  if (!query || query.length < 4) {
    return new Response(JSON.stringify({ error: 'VALIDATION_FAILED', message: 'Vui lòng nhập Mã đơn hàng hoặc Số điện thoại hợp lệ.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check if query is numeric orderCode or phone
  let orders = [];
  const isOrderCode = /^\d{6,15}$/.test(query);

  if (isOrderCode) {
    const { results } = await db.prepare(`SELECT * FROM orders WHERE order_code = ?`).bind(Number(query)).all();
    orders = results || [];
  } else {
    const { results } = await db.prepare(`SELECT * FROM orders WHERE customer_phone LIKE ? ORDER BY created_at DESC LIMIT 5`).bind(`%${query}%`).all();
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
    itemsMap[item.order_id].push({
      productName: item.product_name,
      productSlug: item.product_slug,
      quantity: item.quantity,
      unitPriceVnd: item.unit_price_vnd,
      selectedOptions: item.selected_options_json ? JSON.parse(item.selected_options_json) : [],
      customizationNote: item.customization_note,
    });
  }

  // Sanitize customer data for public view (mask phone and address)
  const sanitizedOrders = orders.map(o => {
    const phone = o.customer_phone || '';
    const maskedPhone = phone.length > 4 ? `${phone.slice(0, 3)}****${phone.slice(-3)}` : '***';
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
      createdAt: o.created_at,
      items: itemsMap[o.id] || [],
    };
  });

  return new Response(JSON.stringify({ orders: sanitizedOrders }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

---

### Task 6: Enhanced Checkout API (COD, Bank Transfer, Server Shipping & Vouchers)

**Files:**
- Modify: `functions/api/payments/create.js`

**Interfaces:**
- Consumes: `customer`, `items`, `paymentMethod`, `shippingRegion`, `voucherCode`, `orderCode`.
- Produces: `POST /api/payments/create` returns `{ orderCode, checkoutUrl, paymentMethod }`.

- [ ] **Step 1: Update functions/api/payments/create.js**

Cập nhật logic:
1. Nhận `paymentMethod` (`payos`, `cod`, `bank_transfer`), mặc định là `payos`.
2. Tính phí ship chuẩn server:
   - `can_tho`: 15.000đ
   - `nationwide`: 30.000đ
   - Nếu `serverSubtotal >= 250000`: `serverShippingFee = 0` (Freeship).
3. Xác thực mã voucher chuẩn server:
   - `RAWWELCOME`: giảm 10% `serverSubtotal`.
   - `FREESHIP`: giảm phí vận chuyển về 0đ.
   - `RESINLOVE`: giảm trực tiếp 20.000đ.
4. Lưu đầy đủ `payment_method`, `shipping_region`, `discount_vnd`, `shipping_fee_vnd` vào bảng `orders`.
5. Lưu `customization_note` riêng của từng sản phẩm vào bảng `order_items`.
6. Nếu `paymentMethod !== 'payos'`:
   - Trực tiếp trả về `checkoutUrl: /thanh-toan-thanh-cong?orderCode=${orderCode}&method=${paymentMethod}` mà không cần tạo link PayOS.

---

### Task 7: Frontend Cart Service & CartDrawer Pro

**Files:**
- Modify: `src/services/cartService.js`
- Modify: `src/services/priceService.js`
- Modify: `src/components/CartDrawer.jsx`

**Interfaces:**
- Consumes: `products`, `localStorage`.
- Produces:
  - `updateItemCustomization(key, note)`
  - `applyVoucher(code)`, `getAppliedVoucher()`, `removeVoucher()`
  - `calculateShippingFee(subtotal, region)`
  - `calculateDiscount(subtotal, voucher, shippingFee)`
  - Thumbnail ảnh trong CartDrawer và khung note riêng từng món.

- [ ] **Step 1: Update src/services/priceService.js with shipping & voucher rules**

Thêm vào `src/services/priceService.js`:
```javascript
export const VOUCHERS = {
  RAWWELCOME: { code: 'RAWWELCOME', type: 'percent', value: 10, label: 'Giảm 10% đơn hàng chào bạn mới' },
  FREESHIP: { code: 'FREESHIP', type: 'shipping', value: 100, label: 'Miễn phí vận chuyển toàn quốc' },
  RESINLOVE: { code: 'RESINLOVE', type: 'fixed', value: 20000, label: 'Giảm 20.000đ cho tín đồ resin' },
};

export function calculateShippingFee(subtotal, region = 'can_tho') {
  if (subtotal >= 250000) return 0;
  return region === 'can_tho' ? 15000 : 30000;
}

export function calculateDiscount(subtotal, voucherCode, shippingFee = 0) {
  if (!voucherCode) return 0;
  const v = VOUCHERS[voucherCode.toUpperCase()];
  if (!v) return 0;
  if (v.type === 'percent') return Math.round((subtotal * v.value) / 100);
  if (v.type === 'fixed') return Math.min(v.value, subtotal);
  if (v.type === 'shipping') return shippingFee;
  return 0;
}
```

- [ ] **Step 2: Update src/services/cartService.js**

Bổ sung quản lý `customizationNote` cho từng item và quản lý voucher lưu trữ qua `localStorage` (`raw_voucher_v1`).

- [ ] **Step 3: Update src/components/CartDrawer.jsx**

Hiển thị ảnh thumbnail sản phẩm (fallback placeholder nếu chưa có ảnh), cho phép nhập ghi chú cá nhân hóa cho từng món (ví dụ: "Khắc chữ Linh & An"), và ô nhập voucher giảm giá.

---

### Task 8: Frontend Checkout Page Upgrade (Payment Selector & Options)

**Files:**
- Modify: `src/pages/CheckoutPage.jsx`

**Interfaces:**
- Consumes: `cartItems`, `getAppliedVoucher()`, `calculateShippingFee()`.
- Produces: Form chọn khu vực (Cần Thơ / Toàn quốc) và phương thức thanh toán (`payos`, `cod`, `bank_transfer`).

- [ ] **Step 1: Add Shipping Region and Payment Method Selectors**

Trong `CheckoutPage.jsx`:
- Thêm state `shippingRegion` ('can_tho' / 'nationwide').
- Thêm state `paymentMethod` ('payos' / 'cod' / 'bank_transfer').
- Hiển thị bảng tổng kết rõ ràng: Tạm tính, Phí ship (thông báo miễn phí ship nếu >= 250k), Giảm giá voucher, Tổng thanh toán.
- Gửi đầy đủ `shippingRegion`, `paymentMethod`, `voucherCode`, và `customizationNote` từng món lên `/api/payments/create`.

---

### Task 9: Frontend Payment Confirmation with Dynamic VietQR

**Files:**
- Modify: `src/pages/PaymentSuccessPage.jsx`

**Interfaces:**
- Consumes: `orderCode`, `method` từ URL searchParams, API `/api/orders/lookup`.
- Produces: Màn hình thành công thích ứng cho PayOS, COD, hoặc Direct Bank Transfer kèm mã VietQR Napas247 chuẩn.

- [ ] **Step 1: Implement Dynamic VietQR generator and copy helper**

Cấu hình VietQR QuickLink:
```text
https://img.vietqr.io/image/MB-0901234567-compact2.png?amount=${totalVnd}&addInfo=RAW%20${orderCode}&accountName=RESIN%20ART%20WORK
```
Hiển thị đầy đủ thông tin:
- Ngân hàng, Số tài khoản, Tên chủ tài khoản, Số tiền, Nội dung chuyển khoản.
- Nút "Sao chép số tài khoản" và "Sao chép nội dung".
- Nút "Tra cứu tiến độ đơn hàng" chuyển sang `/tra-cuu-don-hang?code=${orderCode}`.

---

### Task 10: Customer Order Tracking Page

**Files:**
- Create: `src/pages/OrderLookupPage.jsx`

**Interfaces:**
- Consumes: API `GET /api/orders/lookup?query=...`.
- Produces: Route `/tra-cuu-don-hang`.

- [ ] **Step 1: Implement OrderLookupPage component**

Tạo `src/pages/OrderLookupPage.jsx` với:
- Ô tìm kiếm nhập Mã đơn hoặc Số điện thoại.
- Visual Timeline 5 bước:
  1. `new`: Đặt hàng thành công 📝
  2. `confirmed`: Xưởng đã tiếp nhận đơn ✨
  3. `producing`: Đang đổ resin & chế tác thủ công 🎨
  4. `shipped`: Đang giao hàng 🚚
  5. `delivered`: Đã giao thành công 🎁
- Card hiển thị chi tiết các sản phẩm kèm chữ khắc và tùy chọn đã yêu cầu.

---

### Task 11: Admin Portal UI (Login & Dashboard)

**Files:**
- Create: `src/pages/AdminLoginPage.jsx`
- Create: `src/pages/AdminDashboardPage.jsx`

**Interfaces:**
- Consumes: APIs `/api/admin/login`, `/api/admin/orders`, `/api/admin/stats`.
- Produces: Route `/admin/login` và `/admin`.

- [ ] **Step 1: Implement AdminLoginPage**

Tạo form nhập Master Admin Key, gọi `/api/admin/login`, lưu token vào `sessionStorage` (`raw_admin_token`) và chuyển hướng sang `/admin`.

- [ ] **Step 2: Implement AdminDashboardPage**

Xây dựng:
- Header Admin có logo R.A.W, badge trạng thái và nút Đăng xuất.
- 4 thẻ KPI: Tổng đơn, Đơn mới, Đơn đang chế tác resin (`producing`), Tổng doanh thu.
- Thanh công cụ: Tìm kiếm (Mã đơn, tên khách, SĐT) + Bộ lọc trạng thái đơn và thanh toán.
- Bảng danh sách đơn hàng với badge màu sắc trực quan (`new` xanh lá, `producing` cam amber, `shipped` xanh dương, v.v.).
- Modal xem chi tiết đơn: Hiện danh sách sản phẩm và **Ghi chú cá nhân hóa từng món**.
- Dropdown cập nhật nhanh trạng thái đơn hàng và trạng thái thanh toán trực tiếp từ bảng/modal.

---

### Task 12: Header, App Router & Global Styling Integration

**Files:**
- Modify: `src/components/Header.jsx`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: Các components trang mới tạo.
- Produces: Navigation hoàn chỉnh và giao diện responsive cho toàn bộ tính năng.

- [ ] **Step 1: Update src/components/Header.jsx**

Thêm link "Tra cứu đơn" vào thanh menu chính và mobile menu.

- [ ] **Step 2: Update src/App.jsx**

Thêm routes:
```jsx
<Route path="/tra-cuu-don-hang" element={<OrderLookupPage />} />
<Route path="/admin/login" element={<AdminLoginPage />} />
<Route path="/admin" element={<AdminDashboardPage />} />
```

- [ ] **Step 3: Update src/styles.css**

Bổ sung toàn bộ style CSS cho:
- Admin Login & Admin Dashboard (bảng, KPI cards, modal, status tags).
- Timeline Tra cứu đơn hàng.
- VietQR card & copy buttons.
- Cart Drawer thumbnails & voucher tags.

---

### Task 13: End-to-End Build & Verification

**Files:**
- Test all components and build assets.

- [ ] **Step 1: Run Vite Build**

```bash
npm run build
```
Đảm bảo build hoàn tất thành công 100% không có cảnh báo syntax hay lỗi import.

- [ ] **Step 2: Verify git status and changes**

Kiểm tra tất cả các file đã được tạo mới và chỉnh sửa đúng vị trí.
