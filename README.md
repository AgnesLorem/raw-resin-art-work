# R.A.W - Resin Art Work

Website quảng bá và bán hàng cho dự án **R.A.W - Resin Art Work** — sản phẩm resin handmade cá nhân hóa.

**Domain:** [resinartworkshop.id.vn](https://resinartworkshop.id.vn)

---

## Tech Stack

- **Frontend:** React 18 + Vite 5
- **Routing:** React Router v6
- **Styling:** Vanilla CSS (CSS variables)
- **Cart:** localStorage
- **Deploy:** Cloudflare Pages
- **Data (Phase 1):** Local `src/data/products.js`

---

## Chạy local

```bash
# Cài dependencies
npm install

# Khởi động dev server
npm run dev
```

Dev server chạy tại `http://localhost:5173`

---

## Build production

```bash
npm run build
```

Output tại thư mục `dist/`. Preview build:

```bash
npm run preview
```

---

## Deploy lên Cloudflare Pages

### Lần đầu (qua Cloudflare Dashboard)

1. Push code lên GitHub
2. Vào [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
3. **Create a project** → Connect to Git → Chọn repo này
4. Cấu hình build:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Deploy

### Cấu hình branch

| Branch | Môi trường |
|--------|-----------|
| `main` | Production |
| `dev`  | Preview (auto-deploy) |

### SPA routing

File `public/_redirects` đã được tạo với nội dung:
```
/* /index.html 200
```
Đảm bảo refresh trên các route `/san-pham/...` không bị lỗi 404.

---

## Cấu trúc thư mục

```
src/
├── components/      # UI components
├── data/            # Local data (products, site content)
├── pages/           # Route-level components
├── services/        # cartService, priceService
├── App.jsx          # Router + layout
├── main.jsx         # Entry point
└── styles.css       # Global CSS + design tokens

public/
├── _redirects       # Cloudflare Pages SPA redirect
└── assets/          # Static images (khi có ảnh thật)

docs/
├── FUTURE_SCALE_PLAN.md    # Roadmap 4 phases
└── DATABASE_SCHEMA_DRAFT.md # Schema cho Phase 3
```

---

## Routes

| URL | Trang |
|-----|-------|
| `/` | Trang chủ |
| `/san-pham` | Danh sách sản phẩm |
| `/san-pham/:slug` | Chi tiết sản phẩm |
| `/thu-vien` | Thư viện ảnh |
| `/lien-he` | Liên hệ |

---

## Quy trình Git

```bash
# Tạo feature branch
git checkout -b feature/ten-tinh-nang

# Commit
git add .
git commit -m "feat: mô tả ngắn"

# Push lên GitHub
git push origin feature/ten-tinh-nang

# Merge vào dev → test
# Merge vào main → production deploy tự động
```

### Commit prefix convention

| Prefix | Dùng khi |
|--------|---------|
| `feat:` | Thêm tính năng mới |
| `fix:` | Sửa bug |
| `style:` | Thay đổi CSS/UI |
| `data:` | Thêm/sửa sản phẩm, nội dung |
| `docs:` | Cập nhật tài liệu |
| `refactor:` | Cải thiện code, không thêm tính năng |

---

## Thêm sản phẩm mới

Chỉnh sửa `src/data/products.js` — thêm một object vào array `products`:

```js
{
  id: 4,
  slug: 'ten-san-pham',       // URL-safe, không dấu
  name: 'Tên Sản Phẩm',
  category: 'Tên danh mục',
  priceVnd: 50000,
  shortDescription: '...',
  description: '...',
  images: [],                  // [] để dùng placeholder; hoặc ['/assets/products/abc.webp']
  materials: ['...'],
  dimensions: '...',
  customizable: true,
  options: [
    { name: 'Tên option', priceDeltaVnd: 10000 },
  ],
  tags: ['tag1', 'tag2'],
}
```

---

## Contact

Email: [tainh.ce190387@gmail.com](mailto:tainh.ce190387@gmail.com)

*(Lưu ý: Các liên kết mạng xã hội trong `src/data/siteContent.js` hiện tại đang là `#`, hãy cập nhật link thật khi có)*

---

## Roadmap

Xem [docs/FUTURE_SCALE_PLAN.md](./docs/FUTURE_SCALE_PLAN.md) để biết chi tiết về Phase 2–4.
