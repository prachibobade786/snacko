# Snacko Backend Refactor + Smart Feature Documentation

## 1. What changed in this project

This project has been updated in two major ways:

1. **Prachi's old modules were converted to Sanika's async/await style.**
2. **Two unique project features were added:**
   - Smart Cart Assistant
   - Smart Delivery Zone + ETA Estimator + Tracking Status

The backend now follows a cleaner and more professional flow:

```text
Routes → Controller → Service → Model → MySQL Database
```

All new and refactored database calls use:

```js
const [rows] = await db.execute(sql, values);
```

or for insert/update/delete:

```js
const [result] = await db.execute(sql, values);
```

This is the same async/await promise-based style used in Sanika's modules.

---

## 2. Why async/await style is better

Earlier, Prachi's modules used callback-style database queries like this:

```js
db.query(sql, values, (err, result) => {
  if (err) {
    return callback(err);
  }
  callback(null, result);
});
```

Now those modules use async/await:

```js
const [rows] = await db.execute(sql, values);
return rows;
```

### Benefits

- Code is easier to read.
- Error handling is cleaner using `try-catch`.
- It matches Sanika's code style.
- It is better for interview explanation.
- It avoids nested callbacks.
- It works directly with your current `mysql2/promise` database pool.

---

## 3. Files changed for async/await refactor

The following old Prachi modules were converted from callback style to async/await:

### Category module

```text
backend/src/modules/category/categoryModel.js
backend/src/modules/category/categoryService.js
backend/src/modules/category/categoryController.js
```

### Product module

```text
backend/src/modules/product/productModel.js
backend/src/modules/product/productService.js
backend/src/modules/product/productController.js
```

### Cart Item module

```text
backend/src/modules/cartItem/cartItemModel.js
backend/src/modules/cartItem/cartItemService.js
backend/src/modules/cartItem/cartItemController.js
```

### Payment module

```text
backend/src/modules/payment/paymentModel.js
backend/src/modules/payment/paymentService.js
backend/src/modules/payment/paymentController.js
```

Routes did not need major logic changes because they only connect endpoint paths to controller functions.

---

## 4. Database connection file

Your current database file is already suitable:

```text
backend/src/config/db.js
```

It uses:

```js
const mysql = require("mysql2/promise");
```

This means it supports:

```js
await db.execute(sql, values);
```

So we kept your current `db.js`. No need to replace it.

---

# 5. Feature 1: Smart Cart Assistant

## 5.1 Feature idea

Normal grocery apps only allow users to add products to cart and checkout. Our project adds a **Smart Cart Assistant**.

This feature helps users:

- Check whether the cart is within budget.
- Know how much the cart exceeds the budget.
- Get cheaper alternatives from the same category.
- Get available alternatives when a cart product is out of stock.

This makes Snacko different from a basic grocery app.

---

## 5.2 Real-world example

Suppose the user has these items in cart:

```text
Premium Chips: ₹40 × 2 = ₹80
Lays Chips: ₹22 × 2 = ₹44
Cart Total = ₹124
```

User enters budget:

```text
Budget = ₹100
```

The system responds:

```text
Your cart exceeds your budget by ₹24.
Suggested replacement:
Replace Premium Chips with Budget Chips and save money.
```

---

## 5.3 Backend files added

New folder:

```text
backend/src/modules/smartCart/
```

Files added:

```text
smartCartModel.js
smartCartService.js
smartCartController.js
smartCartRoutes.js
```

---

## 5.4 Smart Cart API endpoints

The Smart Cart routes are added in `server.js` like this:

```js
app.use("/api/smart-cart", smartCartRoutes);
```

### API 1: Check budget

```text
POST /api/smart-cart/check-budget
```

### API 2: Get alternatives for one product

```text
GET /api/smart-cart/alternatives/:productId
```

---

## 5.5 Smart Cart logic flow

### Step 1: User sends budget

Postman body:

```json
{
  "user_id": 1,
  "budget": 100
}
```

### Step 2: Controller validates request

`smartCartController.js` checks:

```text
user_id is present
budget is present
budget is not negative
```

If missing:

```json
{
  "success": false,
  "message": "user_id and budget are required"
}
```

### Step 3: Service asks model for cart items

`smartCartService.js` calls:

```js
const cartItems = await smartCartModel.getCartItemsWithProducts(userId);
```

### Step 4: Model gets cart data with product and category details

`smartCartModel.js` uses SQL join:

```sql
SELECT
  ci.cart_item_id,
  ci.user_id,
  ci.product_id,
  ci.quantity,
  p.product_name,
  p.price,
  p.stock_quantity,
  p.category_id,
  p.is_available,
  c.category_name
FROM cart_items ci
JOIN products p ON ci.product_id = p.product_id
JOIN categories c ON p.category_id = c.category_id
WHERE ci.user_id = ?
```

This query is important because Smart Cart needs:

- Cart quantity from `cart_items`
- Price and stock from `products`
- Category from `categories`

### Step 5: Service calculates cart total

For every cart item:

```js
cartTotal += price * quantity;
```

Example:

```text
price = 40
quantity = 2
total = 40 × 2 = 80
```

### Step 6: Service checks out-of-stock products

The product is considered unavailable when:

```text
stock_quantity <= 0
or
is_available = false
```

If unavailable, the system searches alternatives.

### Step 7: Service searches cheaper alternatives

Logic:

```text
same category
not same product
price less than current product
stock available
product active
category active
```

SQL:

```sql
SELECT
  p.product_id,
  p.product_name,
  p.product_description,
  p.price,
  p.stock_quantity,
  p.category_id,
  c.category_name
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.category_id = ?
  AND p.product_id != ?
  AND p.price < ?
  AND p.stock_quantity > 0
  AND p.is_available = TRUE
  AND c.is_active = TRUE
ORDER BY p.price ASC
LIMIT 1
```

This means the app suggests the cheapest available item from the same category.

### Step 8: Service calculates budget result

```text
If cartTotal > budget:
  exceededBy = cartTotal - budget
else:
  remainingBudget = budget - cartTotal
```

### Step 9: Response is sent

Example response:

```json
{
  "success": true,
  "message": "Smart cart budget checked successfully",
  "data": {
    "cartTotal": 124,
    "budget": 100,
    "exceededBy": 24,
    "remainingBudget": 0,
    "message": "Your cart exceeds your budget by ₹24",
    "cheaperSuggestions": [
      {
        "currentProduct": "Premium Chips",
        "currentPrice": 40,
        "suggestedProduct": "Budget Chips",
        "suggestedPrice": 15,
        "category": "Snacks",
        "quantity": 2,
        "savingPerItem": 25,
        "totalSaving": 50
      }
    ],
    "outOfStockSuggestions": []
  }
}
```

---

# 6. Feature 2: Smart Delivery Zone + ETA Estimator + Tracking Status

## 6.1 Feature idea

Since Snacko is a delivery app, we added delivery intelligence.

This feature checks:

- Is delivery available at the user address?
- Which warehouse is nearest?
- What is the distance?
- What is the estimated delivery time?
- What is the delivery charge?
- What is the current delivery status?

---

## 6.2 Why this feature is unique

Many student projects stop at order placement. This feature makes the app more realistic because it connects order placement with delivery planning.

Interview line:

> We added Smart Delivery Zone and ETA Estimator. The backend uses the user's address coordinates and warehouse coordinates to calculate the nearest warehouse, estimated delivery time, delivery charge, and delivery tracking status.

---

## 6.3 Backend files added

New folder:

```text
backend/src/modules/delivery/
```

Files added:

```text
deliveryModel.js
deliveryService.js
deliveryController.js
deliveryRoutes.js
```

---

## 6.4 Delivery API endpoints

Routes added in `server.js`:

```js
app.use("/api/delivery", deliveryRoutes);
```

### API 1: Check delivery zone

```text
POST /api/delivery/check-zone
```

### API 2: Assign delivery details to order

```text
POST /api/delivery/assign-order
```

### API 3: Get order tracking

```text
GET /api/delivery/tracking/:orderId
```

### API 4: Update delivery status

```text
PATCH /api/delivery/status/:orderId
```

---

## 6.5 Delivery calculation logic

We did not use paid Google Maps API. For CDAC project, we used latitude and longitude stored in database.

The backend calculates distance using the Haversine formula.

### Why Haversine formula?

Latitude and longitude are points on Earth. Haversine formula calculates approximate distance between two coordinates.

In our code, it is written in:

```text
backend/src/modules/delivery/deliveryService.js
```

Function:

```js
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadiusKm = 6371;
  ...
  return earthRadiusKm * c;
};
```

The result is distance in kilometers.

---

## 6.6 Delivery rule table

We added simple rules:

| Distance | Delivery Available | ETA | Delivery Charge |
|---:|---|---:|---:|
| 0 to 3 km | Yes | 15 minutes | ₹10 |
| 3 to 6 km | Yes | 25 minutes | ₹20 |
| 6 to 10 km | Yes | 35 minutes | ₹30 |
| Above 10 km | No | Not applicable | Not applicable |

Code:

```js
const calculateDeliveryRules = (distanceKm) => {
  if (distanceKm <= 3) {
    return { deliveryAvailable: true, estimatedTime: 15, deliveryCharge: 10 };
  }

  if (distanceKm <= 6) {
    return { deliveryAvailable: true, estimatedTime: 25, deliveryCharge: 20 };
  }

  if (distanceKm <= 10) {
    return { deliveryAvailable: true, estimatedTime: 35, deliveryCharge: 30 };
  }

  return { deliveryAvailable: false, estimatedTime: null, deliveryCharge: null };
};
```

---

## 6.7 Delivery status values

Allowed statuses:

```text
PLACED
CONFIRMED
PACKED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

When status is updated, the system inserts one record into `order_tracking_history`.

Example:

```text
OUT_FOR_DELIVERY → Order is out for delivery
```

This helps show tracking history step by step.

---

# 7. Database changes added

New SQL file:

```text
database/smart_features.sql
```

Run this file after your normal database files.

## 7.1 Product table change

Added optional discount column:

```sql
ALTER TABLE products
ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0.00;
```

This is for future offers/smart suggestions.

## 7.2 Address table changes

Added:

```sql
ALTER TABLE addresses
ADD COLUMN latitude DECIMAL(10,8);

ALTER TABLE addresses
ADD COLUMN longitude DECIMAL(11,8);
```

Reason:

- User address needs coordinates.
- Delivery zone feature calculates distance using these values.

## 7.3 New warehouses table

```sql
CREATE TABLE IF NOT EXISTS warehouses (
    warehouse_id INT PRIMARY KEY AUTO_INCREMENT,
    warehouse_name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Reason:

- Delivery should start from a warehouse/store.
- The app finds nearest active warehouse.

## 7.4 Orders table changes

Added:

```sql
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
```

Reason:

- `warehouse_id`: nearest warehouse assigned to order
- `delivery_distance_km`: calculated delivery distance
- `estimated_delivery_time`: delivery ETA in minutes
- `delivery_charge`: delivery fee
- `delivery_status`: current delivery status

## 7.5 New order tracking table

```sql
CREATE TABLE IF NOT EXISTS order_tracking_history (
    tracking_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

Reason:

- To maintain history of every status update.
- Example: PLACED → CONFIRMED → PACKED → OUT_FOR_DELIVERY → DELIVERED

---

# 8. Address module update

Small change was made in Sanika's address model to support latitude and longitude.

Changed file:

```text
backend/src/modules/address/addressmodel.js
```

Now address insert supports:

```text
latitude
longitude
```

This was necessary because delivery feature cannot work without address coordinates.

Example address body:

```json
{
  "address_type": "HOME",
  "address_line1": "Flat 101",
  "address_line2": "Near D Mart",
  "city": "Pune",
  "state": "Maharashtra",
  "pincode": "411057",
  "country": "India",
  "is_default": true,
  "latitude": 18.4575,
  "longitude": 73.8677
}
```

---

# 9. How to run database changes

Open MySQL terminal or MySQL Workbench.

Run database files in this order:

```sql
CREATE DATABASE IF NOT EXISTS snacko_db;
USE snacko_db;
```

Then import existing files:

```text
backend/db.sql
```

Then import Prachi tables:

```text
database/prachi.sql
```

Then import new smart feature changes:

```text
database/smart_features.sql
```

Command-line example:

```bash
mysql -u root -p snacko_db < backend/db.sql
mysql -u root -p snacko_db < database/prachi.sql
mysql -u root -p snacko_db < database/smart_features.sql
```

Important: Run `smart_features.sql` only once. If you run it again, MySQL may show duplicate column errors for the `ALTER TABLE` queries.

---

# 10. How to run backend

Go to backend folder:

```bash
cd D:\Snacko_Project\CDAC_Projects\snacko\backend
```

Install packages if needed:

```bash
npm install
```

Start server:

```bash
node server.js
```

Expected output:

```text
Database connection established
Server listening on port 4000
```

---

# 11. Postman testing step-by-step

Base URL:

```text
http://localhost:4000
```

---

## 11.1 Test old refactored APIs first

These prove your old modules still work after conversion.

### Add category

Method:

```text
POST
```

URL:

```text
http://localhost:4000/api/categories
```

Body:

```json
{
  "category_name": "Snacks",
  "category_description": "Chips and quick snacks",
  "category_image": "snacks.jpg",
  "is_active": true
}
```

Expected:

```json
{
  "success": true,
  "message": "Category added successfully",
  "category_id": 1
}
```

### Get categories

```text
GET http://localhost:4000/api/categories
```

### Add product

```text
POST http://localhost:4000/api/products
```

Body:

```json
{
  "category_id": 1,
  "product_name": "Premium Chips",
  "product_description": "Premium salted chips",
  "price": 40,
  "stock_quantity": 30,
  "product_image": "premium_chips.jpg",
  "is_available": true
}
```

Add another cheaper product:

```json
{
  "category_id": 1,
  "product_name": "Budget Chips",
  "product_description": "Affordable salted chips",
  "price": 15,
  "stock_quantity": 50,
  "product_image": "budget_chips.jpg",
  "is_available": true
}
```

### Add cart item

```text
POST http://localhost:4000/api/cart-items
```

Body:

```json
{
  "user_id": 1,
  "product_id": 1,
  "quantity": 2
}
```

### Get user cart items

```text
GET http://localhost:4000/api/users/1/cart-items
```

---

## 11.2 Test Smart Cart Assistant

### Check budget

Method:

```text
POST
```

URL:

```text
http://localhost:4000/api/smart-cart/check-budget
```

Body:

```json
{
  "user_id": 1,
  "budget": 100
}
```

Expected response:

```json
{
  "success": true,
  "message": "Smart cart budget checked successfully",
  "data": {
    "cartTotal": 124,
    "budget": 100,
    "exceededBy": 24,
    "remainingBudget": 0,
    "message": "Your cart exceeds your budget by ₹24",
    "cheaperSuggestions": [],
    "outOfStockSuggestions": []
  }
}
```

Your exact cart total depends on the products and quantities in your database.

### Get alternatives for product

```text
GET http://localhost:4000/api/smart-cart/alternatives/1
```

Expected:

```json
{
  "success": true,
  "message": "Alternative products fetched successfully",
  "data": {
    "currentProduct": {
      "product_id": 1,
      "product_name": "Premium Chips"
    },
    "alternatives": [
      {
        "product_name": "Budget Chips",
        "price": "15.00",
        "stock_quantity": 50
      }
    ]
  }
}
```

---

## 11.3 Test Delivery Zone + ETA

### Step 1: Make sure address has latitude and longitude

Using SQL:

```sql
UPDATE addresses
SET latitude = 18.45750000,
    longitude = 73.86770000
WHERE id = 1;
```

### Step 2: Check delivery zone

Method:

```text
POST
```

URL:

```text
http://localhost:4000/api/delivery/check-zone
```

Body:

```json
{
  "address_id": 1
}
```

Expected:

```json
{
  "success": true,
  "message": "Delivery zone checked successfully",
  "data": {
    "deliveryAvailable": true,
    "message": "Delivery is available at this location",
    "nearestWarehouse": {
      "warehouse_id": 2,
      "warehouse_name": "Katraj Warehouse"
    },
    "distance": 0,
    "estimatedTime": 15,
    "deliveryCharge": 10
  }
}
```

Distance can change based on coordinates.

---

## 11.4 Assign delivery to order

Use this after an order is created.

Method:

```text
POST
```

URL:

```text
http://localhost:4000/api/delivery/assign-order
```

Body:

```json
{
  "order_id": 1,
  "address_id": 1
}
```

Expected:

```json
{
  "success": true,
  "message": "Delivery assigned successfully",
  "data": {
    "deliveryAvailable": true,
    "message": "Delivery details assigned to order successfully",
    "orderId": 1,
    "distance": 0,
    "estimatedTime": 15,
    "deliveryCharge": 10,
    "deliveryStatus": "PLACED"
  }
}
```

This updates the `orders` table:

```text
warehouse_id
delivery_distance_km
estimated_delivery_time
delivery_charge
delivery_status
```

It also adds one record in:

```text
order_tracking_history
```

---

## 11.5 Update delivery status

Method:

```text
PATCH
```

URL:

```text
http://localhost:4000/api/delivery/status/1
```

Body:

```json
{
  "status": "OUT_FOR_DELIVERY"
}
```

Allowed values:

```text
PLACED
CONFIRMED
PACKED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

Expected:

```json
{
  "success": true,
  "message": "Delivery status updated successfully",
  "data": {
    "orderId": "1",
    "status": "OUT_FOR_DELIVERY",
    "description": "Order is out for delivery"
  }
}
```

---

## 11.6 Get order tracking

Method:

```text
GET
```

URL:

```text
http://localhost:4000/api/delivery/tracking/1
```

Expected:

```json
{
  "success": true,
  "message": "Order tracking fetched successfully",
  "data": {
    "order": {
      "order_id": 1,
      "delivery_status": "OUT_FOR_DELIVERY",
      "delivery_distance_km": "0.00",
      "estimated_delivery_time": 15,
      "delivery_charge": "10.00",
      "warehouse_name": "Katraj Warehouse"
    },
    "trackingHistory": [
      {
        "status": "PLACED",
        "description": "Order placed and delivery details assigned successfully"
      },
      {
        "status": "OUT_FOR_DELIVERY",
        "description": "Order is out for delivery"
      }
    ]
  }
}
```

---

# 12. Postman recommended collection order

Test in this order:

```text
1. GET /                  → backend running check
2. POST /api/categories  → add category
3. POST /api/products    → add expensive product
4. POST /api/products    → add cheaper alternative product
5. POST /api/cart-items  → add product to cart
6. POST /api/smart-cart/check-budget
7. GET /api/smart-cart/alternatives/:productId
8. POST /api/delivery/check-zone
9. POST /api/delivery/assign-order
10. PATCH /api/delivery/status/:orderId
11. GET /api/delivery/tracking/:orderId
```

---

# 13. Interview explanation

Use this answer:

> Our project Snacko is a smart quick commerce grocery delivery application. Along with normal features like products, categories, cart, orders and payments, we added two unique features. First is Smart Cart Assistant, which compares the user's cart total with their budget and suggests cheaper products from the same category. Second is Smart Delivery Zone with ETA Estimator and Tracking Status. It uses latitude and longitude of user address and warehouses to calculate nearest warehouse, distance, estimated delivery time, delivery charge and order tracking status. We implemented this using Node.js, Express.js, MySQL and async/await database queries with `db.execute()`.

---

# 14. Teacher evaluation points

You can highlight these points:

```text
1. Backend converted to clean async/await style.
2. Used MySQL2 promise pool.
3. Used layered architecture: routes, controller, service, model.
4. Used SQL joins for cart, products and categories.
5. Added smart budget calculation.
6. Added cheaper alternative suggestion logic.
7. Added out-of-stock alternative logic.
8. Added warehouses table.
9. Added address latitude and longitude.
10. Added delivery distance calculation using coordinates.
11. Added ETA and delivery charge rule engine.
12. Added delivery status tracking history.
```

---

# 15. Files added summary

```text
backend/src/modules/smartCart/smartCartModel.js
backend/src/modules/smartCart/smartCartService.js
backend/src/modules/smartCart/smartCartController.js
backend/src/modules/smartCart/smartCartRoutes.js

backend/src/modules/delivery/deliveryModel.js
backend/src/modules/delivery/deliveryService.js
backend/src/modules/delivery/deliveryController.js
backend/src/modules/delivery/deliveryRoutes.js

database/smart_features.sql

docs/SMART_FEATURES_AND_REFACTOR_DOCUMENTATION.md
```

---

# 16. Files updated summary

```text
backend/server.js
backend/src/modules/category/categoryModel.js
backend/src/modules/category/categoryService.js
backend/src/modules/category/categoryController.js
backend/src/modules/product/productModel.js
backend/src/modules/product/productService.js
backend/src/modules/product/productController.js
backend/src/modules/cartItem/cartItemModel.js
backend/src/modules/cartItem/cartItemService.js
backend/src/modules/cartItem/cartItemController.js
backend/src/modules/payment/paymentModel.js
backend/src/modules/payment/paymentService.js
backend/src/modules/payment/paymentController.js
backend/src/modules/address/addressmodel.js
```

---

# 17. Git commands after you test locally

After testing, push changes like this:

```bash
git status
git add backend/src/modules/category backend/src/modules/product backend/src/modules/cartItem backend/src/modules/payment
git add backend/src/modules/smartCart backend/src/modules/delivery
git add backend/src/modules/address/addressmodel.js backend/server.js database/smart_features.sql docs/SMART_FEATURES_AND_REFACTOR_DOCUMENTATION.md
git commit -m "Refactor backend modules and add smart cart delivery features"
git push origin prachi-backend-part
```

Do not use force push.

---

# 18. Final project unique feature line

Use this line in your PPT:

> Snacko is a smart quick commerce grocery delivery app with Smart Cart Assistant for budget-friendly shopping and Smart Delivery Zone with ETA and tracking for realistic delivery flow.
