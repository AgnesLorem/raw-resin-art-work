# R.A.W - Resin Art Work | Future Scale Plan

> Tài liệu này mô tả lộ trình phát triển từ landing page demo (Phase 1) lên hệ thống thương mại điện tử thật (Phase 4).
> Mục đích: Mỗi phase là incremental — không đập đi làm lại.

---

## Phase 1 — Static Demo (Hiện tại ✅)

**Mục tiêu:** Website quảng bá cho EXE101, chứng minh concept.

| Thành phần | Giải pháp |
|---|---|
| Frontend | React + Vite |
| Data | Local `src/data/products.js` |
| Cart | localStorage |
| Checkout | Gửi email qua `mailto:` |
| Deploy | Cloudflare Pages (free) |
| Storage | GitHub repo |

**Deliverables:**
- [ ] Landing page hoàn chỉnh
- [ ] Trang sản phẩm + filter
- [ ] Trang chi tiết + cá nhân hóa
- [ ] Giỏ hàng localStorage
- [ ] Trang liên hệ

---

## Phase 2 — Product Catalog + Order Form

**Mục tiêu:** Thật sự nhận đơn hàng, không cần backend phức tạp.

| Thành phần | Giải pháp |
|---|---|
| Data | Vẫn `products.js` hoặc JSON file trong repo |
| Cart | Giữ nguyên localStorage |
| Checkout | Form điền thông tin → gửi qua Formspree / Web3Forms |
| Images | Upload thật vào `public/assets/products/` |
| Payment | Chuyển khoản thủ công + QR code tĩnh (VietQR) |

**Upgrade tasks:**
- Thêm OrderForm component với validation
- Thêm order confirmation email (via Formspree)
- Thêm trang `/cam-on` (Order Success)
- Thêm Google Analytics / Cloudflare Web Analytics
- SEO: sitemap.xml, robots.txt

**Migration note:**
- `cartService.js` đã tách biệt → chỉ cần thêm `submitOrder()` function

---

## Phase 3 — Real Backend (Cloudflare Stack)

**Mục tiêu:** Tự động hóa đơn hàng, quản lý sản phẩm qua admin, lưu trữ ảnh trên cloud.

| Thành phần | Giải pháp |
|---|---|
| Database | Cloudflare D1 (SQLite, free 5GB) |
| Image Storage | Cloudflare R2 (free 10GB) |
| API | Cloudflare Pages Functions (`/functions/api/`) |
| Auth (admin) | Cloudflare Access hoặc simple JWT |
| Payment | payOS (Việt Nam) hoặc VNPAY |

**API endpoints cần build:**
```
GET  /api/products          → Danh sách sản phẩm
GET  /api/products/:slug    → Chi tiết sản phẩm
POST /api/orders            → Tạo đơn hàng
GET  /api/orders/:id        → Tra cứu đơn hàng (by token)
POST /api/payments/create   → Tạo link thanh toán
POST /api/payments/webhook  → Nhận webhook từ payment gateway
```

**Frontend migration:**
- `src/data/products.js` → `src/services/productService.js` với API calls
- Component code không cần thay đổi nếu interface giữ nguyên

**Database schema:** Xem `DATABASE_SCHEMA_DRAFT.md`

---

## Phase 4 — Full eCommerce

**Mục tiêu:** Admin dashboard, quản lý tồn kho, review, marketing.

| Thành phần | Giải pháp |
|---|---|
| Admin UI | Thêm route `/admin` với React protected routes |
| Order Management | CRUD orders, status tracking, email notification |
| Product Customizer | Drag & drop builder cho tùy chỉnh phức tạp |
| Reviews | Rating + review per product |
| Inventory | Stock tracking per SKU |
| Marketing | Coupon codes, newsletter (Resend/Mailchimp) |
| Analytics | Order analytics dashboard |

**Advanced features:**
- Wishlist (synced với account, Phase 4)
- Loyalty points
- Bulk order discount
- Product bundles

---

## Architectural Principles (Giữ xuyên suốt các phase)

1. **Data layer separation**: Components không biết data đến từ đâu (local file hay API).
2. **Service abstraction**: `cartService`, `priceService`, `productService` — swap implementation, không swap interface.
3. **No hardcoded prices**: Mọi tính toán qua `priceService.js`.
4. **Route-first design**: URL structure đã được thiết kế cho SEO từ Phase 1.
5. **Progressive enhancement**: Mỗi phase thêm tính năng, không rewrite cũ.

---

## Timeline Estimate (Ước tính)

| Phase | Thời gian | Milestone |
|---|---|---|
| Phase 1 | 1–2 tuần | EXE101 demo |
| Phase 2 | 2–4 tuần | Nhận đơn hàng thật |
| Phase 3 | 1–2 tháng | eCommerce thật |
| Phase 4 | 3–6 tháng | Full platform |
