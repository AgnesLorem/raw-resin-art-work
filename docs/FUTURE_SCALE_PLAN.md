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

## Phase 2 — Checkout & PayOS Integration (Hiện tại ✅)

**Mục tiêu:** Nhận đơn hàng tự động thông qua cơ sở dữ liệu Cloudflare D1 và tích hợp thanh toán trực tuyến qua cổng PayOS.

| Thành phần | Giải pháp |
|---|---|
| Data | Vẫn `products.js` (local catalog) + `orders` (lưu vào D1) |
| Cart | localStorage |
| Checkout | Trang `/checkout` điền thông tin + nút thanh toán |
| Payment | Cổng thanh toán trực tuyến PayOS (Hosted Checkout) |
| Database | Cloudflare D1 (SQLite) lưu đơn hàng & thanh toán |
| Webhook | API webhook `/api/webhooks/payos` tự động cập nhật đơn hàng thành công |

**Upgrade tasks:**
- [x] Tạo cấu trúc Cloudflare Pages Functions (`functions/api/`)
- [x] Xây dựng Database Schema `db/schema.sql` cho D1 SQLite
- [x] Tích hợp PayOS REST API Helper (với Web Crypto API)
- [x] Implement API `/api/payments/create`, `/api/payments/status`, `/api/webhooks/payos`
- [x] Thiết kế giao diện Checkout Page, Payment Success Page, Payment Cancel Page
- [x] Cập nhật giỏ hàng hỗ trợ checkout trực tuyến và fallback đặt qua Email (mailto)

---

## Phase 3 — Product Management & Cloud Storage

**Mục tiêu:** Quản lý sản phẩm qua API động thay vì file static, lưu trữ hình ảnh trên Cloudflare R2.

| Thành phần | Giải pháp |
|---|---|
| Database | Di chuyển dữ liệu sản phẩm lên Cloudflare D1 |
| Image Storage | Cloudflare R2 (lưu trữ hình ảnh thực tế) |
| API | Nâng cấp các API `/api/products` và `/api/products/:slug` |
| Auth (admin) | Cloudflare Access hoặc Simple JWT để bảo vệ trang admin |

**API endpoints cần bổ sung:**
```
GET  /api/products          → Danh sách sản phẩm từ D1
GET  /api/products/:slug    → Chi tiết sản phẩm từ D1
```

**Frontend migration:**
- `src/data/products.js` → `src/services/productService.js` chuyển sang call API thực tế từ D1.
- Component code giữ nguyên giao diện, chỉ cập nhật hàm fetch dữ liệu.

**Database schema:** Chi tiết bảng sản phẩm nằm trong `docs/DATABASE_SCHEMA_DRAFT.md`

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
