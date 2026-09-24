-- db/migrations/0002_add_payment_method_and_region.sql
ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'payos';
ALTER TABLE orders ADD COLUMN shipping_region TEXT DEFAULT 'can_tho';
