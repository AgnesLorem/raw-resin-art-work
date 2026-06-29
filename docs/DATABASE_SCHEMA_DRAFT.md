# R.A.W - Database Schema Draft (Phase 3+)

> Draft schema cho Cloudflare D1 (SQLite dialect).
> Chưa được implement. Dùng làm tài liệu thiết kế để Phase 3 không cần mày mò lại.

---

## categories

```sql
CREATE TABLE categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);
```

---

## products

```sql
CREATE TABLE products (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT NOT NULL UNIQUE,
  category_id      INTEGER REFERENCES categories(id),
  name             TEXT NOT NULL,
  short_description TEXT,
  description      TEXT,
  price_vnd        INTEGER NOT NULL,
  materials        TEXT,         -- JSON array: ["resin","hoa khô"]
  dimensions       TEXT,
  customizable     INTEGER DEFAULT 1,  -- boolean
  is_active        INTEGER DEFAULT 1,
  tags             TEXT,         -- JSON array
  created_at       TEXT DEFAULT (datetime('now')),
  updated_at       TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active   ON products(is_active);
```

---

## product_images

```sql
CREATE TABLE product_images (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  r2_key     TEXT NOT NULL,    -- Cloudflare R2 object key
  cdn_url    TEXT,             -- public CDN URL (computed)
  alt_text   TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary INTEGER DEFAULT 0
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
```

---

## product_options

```sql
CREATE TABLE product_options (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  price_delta_vnd INTEGER DEFAULT 0,
  sort_order      INTEGER DEFAULT 0
);

CREATE INDEX idx_product_options_product ON product_options(product_id);
```

---

## customers

```sql
CREATE TABLE customers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  address    TEXT,
  note       TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
```

---

## orders

```sql
-- status values: pending | confirmed | producing | shipped | delivered | cancelled
CREATE TABLE orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  order_ref     TEXT NOT NULL UNIQUE,  -- e.g. RAW-2024-0001
  customer_id   INTEGER REFERENCES customers(id),
  status        TEXT DEFAULT 'pending',
  total_vnd     INTEGER NOT NULL,
  note          TEXT,
  shipping_name TEXT,
  shipping_addr TEXT,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_customer   ON orders(customer_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

---

## order_items

```sql
CREATE TABLE order_items (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id         INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       INTEGER NOT NULL REFERENCES products(id),
  product_name     TEXT NOT NULL,   -- snapshot at order time
  quantity         INTEGER NOT NULL DEFAULT 1,
  unit_price_vnd   INTEGER NOT NULL,
  selected_options TEXT,            -- JSON array of option names
  subtotal_vnd     INTEGER NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
```

---

## payments

```sql
-- provider values: payos | vnpay | momo | manual
-- status values: pending | success | failed | refunded
CREATE TABLE payments (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id       INTEGER NOT NULL REFERENCES orders(id),
  provider       TEXT NOT NULL DEFAULT 'manual',
  provider_ref   TEXT,           -- transaction ID from payment provider
  amount_vnd     INTEGER NOT NULL,
  status         TEXT DEFAULT 'pending',
  webhook_data   TEXT,           -- raw JSON from webhook
  paid_at        TEXT,
  created_at     TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_payments_order  ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
```

---

## Notes

- **D1 migration files** sẽ đặt tại `/migrations/NNNN_description.sql`
- **R2 bucket**: `raw-product-images` (production), `raw-product-images-dev` (development)
- **ID strategy**: autoincrement integer cho internal IDs; `order_ref` dạng `RAW-YYYY-NNNN` cho external display
- **JSON columns**: SQLite không có native JSON type; dùng TEXT + `JSON()` helper trong D1
- **Timestamps**: Lưu UTC ISO8601 string; format cho UI phía frontend
