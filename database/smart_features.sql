-- Snacko Smart Feature Database Changes
-- Run this file AFTER backend/db.sql and database/prachi.sql are already imported.
-- Run only once. If you run it again, MySQL may show duplicate column errors for ALTER statements.

USE snacko_db;

-- 1. Optional product discount column for future offers/smart suggestions.
ALTER TABLE products
ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0.00;

-- 2. Add latitude and longitude to user addresses.
-- These values help calculate nearest warehouse, delivery zone, distance, ETA and delivery charge.
ALTER TABLE addresses
ADD COLUMN latitude DECIMAL(10,8);

ALTER TABLE addresses
ADD COLUMN longitude DECIMAL(11,8);

-- 3. Warehouses table.
-- In real apps like Blinkit/BigBasket, products are delivered from a nearby store/warehouse.
CREATE TABLE IF NOT EXISTS warehouses (
    warehouse_id INT PRIMARY KEY AUTO_INCREMENT,
    warehouse_name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Add delivery details to orders table.
ALTER TABLE orders
ADD COLUMN warehouse_id INT;

ALTER TABLE orders
ADD COLUMN delivery_distance_km DECIMAL(6,2);

ALTER TABLE orders
ADD COLUMN estimated_delivery_time INT;

ALTER TABLE orders
ADD COLUMN delivery_charge DECIMAL(8,2) DEFAULT 0.00;

ALTER TABLE orders
ADD COLUMN delivery_status VARCHAR(50) DEFAULT 'PLACED';

-- 5. Tracking history table.
-- This stores step-by-step delivery updates such as PLACED, PACKED, OUT_FOR_DELIVERY, DELIVERED.
CREATE TABLE IF NOT EXISTS order_tracking_history (
    tracking_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 6. Sample warehouses for demo/testing in Pune.
INSERT INTO warehouses (warehouse_name, address, latitude, longitude, is_active)
VALUES
('Swargate Warehouse', 'Swargate, Pune', 18.50180000, 73.86360000, TRUE),
('Katraj Warehouse', 'Katraj, Pune', 18.45750000, 73.86770000, TRUE),
('Hadapsar Warehouse', 'Hadapsar, Pune', 18.50890000, 73.92590000, TRUE);

-- 7. Add demo coordinates to existing sample address.
-- Change id = 1 if your address id is different.
UPDATE addresses
SET latitude = 18.45750000,
    longitude = 73.86770000
WHERE id = 1;

-- 8. Optional sample products for smart cart testing.
-- These help demonstrate cheaper alternative suggestions inside the same category.
INSERT INTO products
(category_id, product_name, product_description, price, stock_quantity, product_image, is_available)
VALUES
(1, 'Premium Chips', 'Premium salted chips', 40.00, 30, 'premium_chips.jpg', TRUE),
(1, 'Budget Chips', 'Affordable salted chips', 15.00, 50, 'budget_chips.jpg', TRUE),
(1, 'Out of Stock Chips', 'Demo unavailable product', 25.00, 0, 'out_chips.jpg', TRUE);
