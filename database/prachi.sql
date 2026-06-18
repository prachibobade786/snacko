-- Snacko My Part Tables Only
-- Use this file when Sanika's users and orders tables are already created.
-- This file creates only your assigned tables.

USE snacko_db;

CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL,
    category_description VARCHAR(255),
    category_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    product_description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    product_image VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(category_id)
    ON DELETE CASCADE
);

CREATE TABLE cart_items (
    cart_item_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE CASCADE
);

CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE,

    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);


INSERT INTO users (name, email, password, mobile, role)
VALUES ('Prachi Customer', 'prachi@gmail.com', '123456', '9876543210', 'customer');

INSERT INTO addresses 
(user_id, address_type, address_line1, address_line2, city, state, country, pincode, is_default)
VALUES
(1, 'HOME', 'Flat 101', 'Near D Mart', 'Pune', 'Maharashtra', 'India', '411057', true);

INSERT INTO categories 
(category_name, category_description, category_image, is_active)
VALUES 
('Snacks', 'Chips and quick snacks', 'snacks.jpg', true);

INSERT INTO products 
(category_id, product_name, product_description, price, stock_quantity, product_image, is_available)
VALUES 
(1, 'Lays Chips', 'Classic salted chips', 22.00, 50, 'lays.jpg', true);

INSERT INTO orders 
(user_id, address_id, total_amount, status)
VALUES
(1, 1, 44.00, 'pending');

INSERT INTO cart_items
(user_id, product_id, quantity)
VALUES
(1, 1, 2);

INSERT INTO payments
(order_id, user_id, amount, payment_method, payment_status, transaction_id)
VALUES
(1, 1, 44.00, 'COD', 'PENDING', NULL);