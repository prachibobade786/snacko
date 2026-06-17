# Snacko Prachi APIs - Postman Guide

## Base URL

```text
{{baseUrl}} = http://localhost:4000/api
```

## Import in Postman

1. Open Postman.
2. Click **Import**.
3. Select this file:

```text
postman/Snacko_Prachi_APIs.postman_collection.json
```

4. Optional: also import environment:

```text
postman/Snacko_Local_Environment.postman_environment.json
```

## Run order

1. Start backend:

```bash
cd backend
npm install
copy .env.example .env
npm start
```

2. First run category APIs.
3. Then product APIs. Product needs category_id.
4. Then cart item APIs. Cart item needs user_id and product_id.
5. Then payment APIs. Payment needs order_id and user_id.

## Prachi API URLs

### Category

```text
POST   {{baseUrl}}/categories
GET    {{baseUrl}}/categories
GET    {{baseUrl}}/categories/{{categoryId}}
PUT    {{baseUrl}}/categories/{{categoryId}}
DELETE {{baseUrl}}/categories/{{categoryId}}
```

### Product

```text
POST   {{baseUrl}}/products
GET    {{baseUrl}}/products
GET    {{baseUrl}}/products/{{productId}}
GET    {{baseUrl}}/categories/{{categoryId}}/products
PUT    {{baseUrl}}/products/{{productId}}
DELETE {{baseUrl}}/products/{{productId}}
```

### Cart Item

```text
POST   {{baseUrl}}/cart-items
GET    {{baseUrl}}/cart-items
GET    {{baseUrl}}/cart-items/{{cartItemId}}
GET    {{baseUrl}}/users/{{userId}}/cart-items
PUT    {{baseUrl}}/cart-items/{{cartItemId}}
DELETE {{baseUrl}}/cart-items/{{cartItemId}}
```

### Payment

```text
POST   {{baseUrl}}/payments
GET    {{baseUrl}}/payments
GET    {{baseUrl}}/payments/{{paymentId}}
GET    {{baseUrl}}/users/{{userId}}/payments
GET    {{baseUrl}}/orders/{{orderId}}/payments
PUT    {{baseUrl}}/payments/{{paymentId}}
DELETE {{baseUrl}}/payments/{{paymentId}}
```
