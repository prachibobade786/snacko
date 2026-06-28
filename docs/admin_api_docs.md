# Snacko Admin Portal Backend API Documentation

This document describes the administrative API endpoints for the Snacko eCommerce backend.

## Base URL
`http://localhost:4000/api`

## Authentication & Authorization
All admin endpoints require an `Authorization` header containing a JSON Web Token (JWT) belonging to a user with the `admin` role.

**Header Format:**
```http
Authorization: Bearer <your_admin_jwt_token>
```

---

## Table of Contents
1. [Dashboard & Analytics](#1-dashboard--analytics)
   - `GET /admin/dashboard/stats`
   - `GET /admin/dashboard/revenue-by-category`
2. [User Management](#2-user-management)
   - `GET /admin/users`
   - `PUT /admin/users/:id/role`
   - `DELETE /admin/users/:id`
3. [Order Management](#3-order-management)
   - `GET /admin/orders`
   - `GET /admin/orders/:id`
   - `PUT /admin/orders/:id/status`
4. [Secured Product & Category APIs](#4-secured-product--category-apis)
   - `POST /products`
   - `PUT /products/:id`
   - `DELETE /products/:id`
   - `POST /categories`
   - `PUT /categories/:id`
   - `DELETE /categories/:id`

---

## 1. Dashboard & Analytics

### `GET /admin/dashboard/stats`
Retrieves aggregated statistics for the ecommerce business.

- **URL:** `/api/admin/dashboard/stats`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalSales": 15430.50,
    "totalOrders": 128,
    "totalCustomers": 94,
    "totalProducts": 45,
    "stockStatus": {
      "outOfStock": 3,
      "lowStock": 8,
      "inStock": 42
    }
  }
}
```

### `GET /admin/dashboard/revenue-by-category`
Retrieves the total sales revenue grouped by product category.

- **URL:** `/api/admin/dashboard/revenue-by-category`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Category revenue retrieved successfully",
  "data": [
    {
      "category_id": 1,
      "category_name": "Chips & Crisps",
      "category_revenue": 8420.00
    },
    {
      "category_id": 2,
      "category_name": "Chocolates",
      "category_revenue": 4350.50
    },
    {
      "category_id": 3,
      "category_name": "Beverages",
      "category_revenue": 2660.00
    }
  ]
}
```

---

## 2. User Management

### `GET /admin/users`
Retrieves a paginated list of all users. Supports optional name/email/mobile search.

- **URL:** `/api/admin/users`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `page` *(optional, default: 1)*: Page number to retrieve.
  - `limit` *(optional, default: 10)*: Number of records per page.
  - `search` *(optional, default: "")*: Search string matching customer name, email, or mobile.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Users list retrieved successfully",
  "data": [
    {
      "id": 12,
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "mobile": "9876543210",
      "role": "customer",
      "created_at": "2026-06-15T10:30:00.000Z",
      "updated_at": "2026-06-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 94,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### `PUT /admin/users/:id/role`
Updates the role of a user to either `'admin'` or `'customer'`.

- **URL:** `/api/admin/users/:id/role`
- **Method:** `PUT`
- **Headers:** `Authorization: Bearer <token>`
- **Body (`application/json`):**
```json
{
  "role": "admin"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User role updated successfully to 'admin'"
}
```
- **Error Responses:**
  - `400 Bad Request` (Invalid role): `{"success": false, "message": "Invalid role. Role must be 'customer' or 'admin'"}`
  - `404 Not Found` (User not found): `{"success": false, "message": "User not found"}`

### `DELETE /admin/users/:id`
Deletes a user account from the system.

- **URL:** `/api/admin/users/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User account deleted successfully"
}
```

---

## 3. Order Management

### `GET /admin/orders`
Retrieves a paginated list of all orders, with filters for status and search terms (matches customer name, customer email, or exact Order ID).

- **URL:** `/api/admin/orders`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `page` *(optional, default: 1)*: Page number.
  - `limit` *(optional, default: 10)*: Page limit.
  - `status` *(optional)*: Filter by order status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`).
  - `search` *(optional)*: Search query matching customer name, email, or order ID.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Orders list retrieved successfully",
  "data": [
    {
      "id": 105,
      "user_id": 12,
      "customer_name": "Jane Doe",
      "customer_email": "jane.doe@example.com",
      "address_id": 4,
      "total_amount": 120.50,
      "status": "pending",
      "created_at": "2026-06-18T12:00:00.000Z",
      "updated_at": "2026-06-18T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 128,
    "page": 1,
    "limit": 10,
    "totalPages": 13
  }
}
```

### `GET /admin/orders/:id`
Retrieves detailed information of a single order, including its items and shipping address.

- **URL:** `/api/admin/orders/:id`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Order details retrieved successfully",
  "data": {
    "order_id": 105,
    "user_id": 12,
    "customer_name": "Jane Doe",
    "customer_email": "jane.doe@example.com",
    "customer_mobile": "9876543210",
    "total_amount": 120.50,
    "status": "pending",
    "created_at": "2026-06-18T12:00:00.000Z",
    "updated_at": "2026-06-18T12:00:00.000Z",
    "address_line1": "Flat 202, Sunshine Apts",
    "address_line2": "MG Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India",
    "items": [
      {
        "id": 201,
        "product_id": 5,
        "product_name": "Classic Potato Salted Chips",
        "quantity": 2,
        "price": 40.00,
        "subtotal": 80.00
      },
      {
        "id": 202,
        "product_id": 9,
        "product_name": "Spicy Peri Peri Sticks",
        "quantity": 1,
        "price": 40.50,
        "subtotal": 40.50
      }
    ]
  }
}
```

### `PUT /admin/orders/:id/status`
Updates the status of an order (e.g. shipping updates).

- **URL:** `/api/admin/orders/:id/status`
- **Method:** `PUT`
- **Headers:** `Authorization: Bearer <token>`
- **Body (`application/json`):**
```json
{
  "status": "shipped"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Order status updated successfully to 'shipped'"
}
```
- **Error Responses:**
  - `400 Bad Request` (Invalid status): `{"success": false, "message": "Invalid status. Allowed statuses are: pending, processing, shipped, delivered, cancelled"}`
  - `404 Not Found` (Order not found): `{"success": false, "message": "Order not found"}`

---

## 4. Secured Product & Category APIs
The following previously public endpoints have been secured to prevent unauthorized modification of the inventory.

### Products

#### `POST /products`
Creates a new product in the store database.
- **Headers:** `Authorization: Bearer <token>` *(Admin role required)*
- **Body:** `{ category_id, product_name, product_description, price, stock_quantity, product_image, is_available }`

#### `PUT /products/:id`
Updates product specifications or stock count.
- **Headers:** `Authorization: Bearer <token>` *(Admin role required)*
- **Body:** `{ category_id, product_name, product_description, price, stock_quantity, product_image, is_available }`

#### `DELETE /products/:id`
Deletes a product from database records.
- **Headers:** `Authorization: Bearer <token>` *(Admin role required)*

### Categories

#### `POST /categories`
Creates a new category.
- **Headers:** `Authorization: Bearer <token>` *(Admin role required)*
- **Body:** `{ category_name, category_description, category_image, is_active }`

#### `PUT /categories/:id`
Updates a category.
- **Headers:** `Authorization: Bearer <token>` *(Admin role required)*
- **Body:** `{ category_name, category_description, category_image, is_active }`

#### `DELETE /categories/:id`
Deletes a category.
- **Headers:** `Authorization: Bearer <token>` *(Admin role required)*
