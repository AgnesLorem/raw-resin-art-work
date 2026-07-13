-- db/seed.sql
-- Seed data for testing and QA purposes.
-- Inserts sample orders, order items, and payment transactions.

-- Enable foreign key constraints in sqlite session
PRAGMA foreign_keys = ON;

-- Delete any existing records to keep seed clean
DELETE FROM payments;
DELETE FROM order_items;
DELETE FROM orders;

-- Insert sample orders
-- Order 1: Success / Paid order
INSERT INTO orders (id, order_code, customer_name, customer_email, customer_phone, customer_address, subtotal_vnd, shipping_fee_vnd, discount_vnd, total_vnd, payment_status, order_status)
VALUES (1, 1720849200001, 'Nguyễn Văn Á', 'a@example.com', '0901234567', '123 Đường Lê Lợi, Quận 1, TP. HCM', 55000, 0, 0, 55000, 'paid', 'paid');

-- Order 2: Pending order
INSERT INTO orders (id, order_code, customer_name, customer_email, customer_phone, customer_address, subtotal_vnd, shipping_fee_vnd, discount_vnd, total_vnd, payment_status, order_status)
VALUES (2, 1720849200002, 'Trần Thị B', 'b@example.com', '0907654321', '456 Đường Nguyễn Huệ, Quận 1, TP. HCM', 105000, 0, 0, 105000, 'pending', 'new');

-- Insert sample order items
-- Order 1 items
INSERT INTO order_items (order_id, product_slug, product_name, quantity, unit_price_vnd, selected_options_json, customization_note)
VALUES (1, 'lot-ly-resin', 'Lót Ly Resin', 1, 55000, '[]', 'Khắc chữ Á');

-- Order 2 items
INSERT INTO order_items (order_id, product_slug, product_name, quantity, unit_price_vnd, selected_options_json, customization_note)
VALUES (2, 'moc-khoa-resin', 'Móc Khóa Resin', 3, 35000, '[]', 'Móc khóa tone xanh sage');

-- Insert sample payments
-- Payment for Order 1
INSERT INTO payments (order_id, provider, provider_payment_link_id, amount_vnd, status, raw_webhook_json)
VALUES (1, 'payos', 'pay_link_001', 55000, 'paid', '{"code":"00","desc":"success","data":{"orderCode":1720849200001,"amount":55000}}');
