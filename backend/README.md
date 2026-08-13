# Snacko Backend

## Overview

This backend provides API endpoints for Snacko to manage users, authentication, addresses, orders, order items, categories, products, cart items, and payments.

Base URL: `http://localhost:4000/api`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the backend root with:
   ```env
   PORT=4000
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   JWT_SECRET=your_jwt_secret
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Health Check

- `GET /`
  - Response: `{ success: true, message: "Snacko backend is running" }`

## Authentication

- `POST /api/users/register`
  - Body: `{ name, email, password, mobile }`
  - Registers a new user.

- `POST /api/users/login`
  - Body: `{ email, password }`
  - Returns a JWT token.

- `GET /api/users/profile`
  - Header: `Authorization: Bearer <token>`
  - Returns the authenticated user's profile.

## Address APIs

All address endpoints require the `Authorization` header.

- `POST /api/address`
  - Body: `{ address_line1, address_line2, city, state, pincode, country, is_default }`
  - Creates a new address for the logged-in user.

- `GET /api/address`
  - Returns all addresses for the logged-in user.

- `GET /api/address/:id`
  - Returns a single address by ID.

- `PUT /api/address/:id`
  - Body: `{ address_line1, address_line2, city, state, pincode, country }`
  - Updates an address by ID.

- `DELETE /api/address/:id`
  - Deletes an address by ID.

## Order APIs

All order endpoints require the `Authorization` header.

- `POST /api/orders`
  - Body: `{ address_id, total_amount }`
  - Creates an order for the logged-in user.

- `GET /api/orders`
  - Returns all orders for the authenticated user.

- `GET /api/orders/:id`
  - Returns a specific order by ID.

- `PATCH /api/orders/cancel/:id`
  - Cancels an order by ID.

## Order Item APIs

All order item endpoints require the `Authorization` header.

- `POST /api/order-items`
  - Body: `{ order_id, product_name, quantity, price }`
  - Adds an order item.

- `GET /api/order-items`
  - Returns all order items.

- `GET /api/order-items/order/:orderId`
  - Returns order items for a specific order.

- `GET /api/order-items/:id`
  - Returns a single order item by ID.

- `PUT /api/order-items/:id`
  - Body: `{ quantity, price }`
  - Updates an order item.

- `DELETE /api/order-items/:id`
  - Deletes an order item by ID.

## Category APIs

- `POST /api/categories`
  - Body: `{ category_name, category_description, category_image, is_active }`
  - Creates a new category.

- `GET /api/categories`
  - Returns all categories.

- `GET /api/categories/:id`
  - Returns a category by ID.

- `PUT /api/categories/:id`
  - Body: `{ category_name, category_description, category_image, is_active }`
  - Updates a category.

- `DELETE /api/categories/:id`
  - Deletes a category by ID.

## Product APIs

- `POST /api/products`
  - Body: `{ category_id, product_name, product_description, price, stock_quantity, product_image, is_available }`
  - Creates a new product.

- `GET /api/products`
  - Returns all products.

- `GET /api/products/:id`
  - Returns a product by ID.

- `GET /api/categories/:categoryId/products`
  - Returns all products for a given category.

- `PUT /api/products/:id`
  - Body: `{ category_id, product_name, product_description, price, stock_quantity, product_image, is_available }`
  - Updates a product by ID.

- `DELETE /api/products/:id`
  - Deletes a product by ID.

## Cart Item APIs

- `POST /api/cart-items`
  - Body: `{ user_id, product_id, quantity }`
  - Adds an item to the cart.

- `GET /api/cart-items`
  - Returns all cart items.

- `GET /api/cart-items/:id`
  - Returns a cart item by ID.

- `GET /api/users/:userId/cart-items`
  - Returns all cart items for a specific user.

- `PUT /api/cart-items/:id`
  - Body: `{ quantity }`
  - Updates a cart item quantity.

- `DELETE /api/cart-items/:id`
  - Deletes a cart item by ID.

## Payment APIs

- `POST /api/payments`
  - Body: `{ order_id, user_id, amount, payment_method, payment_status, transaction_id }`
  - Creates a payment record.

- `GET /api/payments`
  - Returns all payments.

- `GET /api/payments/:id`
  - Returns a payment by ID.

- `GET /api/users/:userId/payments`
  - Returns all payments for a user.

- `GET /api/orders/:orderId/payments`
  - Returns all payments for an order.

- `PUT /api/payments/:id`
  - Body: `{ amount, payment_method, payment_status, transaction_id }`
  - Updates a payment.

- `DELETE /api/payments/:id`
  - Deletes a payment record.

## Admin Portal APIs

All admin portal endpoints are documented separately in the [Admin API Documentation](../docs/admin_api_docs.md) file. These endpoints are located under `/api/admin/*` and require a JWT token belonging to an authenticated user with the `admin` role.

## Notes

- Use `Authorization: Bearer <token>` for protected endpoints.
- The backend uses MySQL via `mysql2` and requires the DB connection details in `.env`.
- The server starts on `PORT` or defaults to `4000`.
