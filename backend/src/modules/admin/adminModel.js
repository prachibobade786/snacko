const db = require("../../config/db");

// ==========================================
// Dashboard & Analytics Queries
// ==========================================

const getTotalSales = async () => {
  const query = "SELECT COALESCE(SUM(total_amount), 0) AS totalSales FROM orders WHERE status != 'cancelled'";
  const [rows] = await db.execute(query);
  return Number(rows[0].totalSales);
};

const getTotalOrdersCount = async () => {
  const query = "SELECT COUNT(*) AS totalOrders FROM orders";
  const [rows] = await db.execute(query);
  return rows[0].totalOrders;
};

const getTotalCustomersCount = async () => {
  const query = "SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'customer'";
  const [rows] = await db.execute(query);
  return rows[0].totalCustomers;
};

const getTotalProductsCount = async () => {
  const query = "SELECT COUNT(*) AS totalProducts FROM products";
  const [rows] = await db.execute(query);
  return rows[0].totalProducts;
};

const getOutOfStockCount = async () => {
  const query = "SELECT COUNT(*) AS outOfStock FROM products WHERE stock_quantity <= 0";
  const [rows] = await db.execute(query);
  return rows[0].outOfStock;
};

const getLowStockCount = async () => {
  const query = "SELECT COUNT(*) AS lowStock FROM products WHERE stock_quantity > 0 AND stock_quantity <= 5";
  const [rows] = await db.execute(query);
  return rows[0].lowStock;
};

const getCategoryRevenue = async () => {
  const query = `
    SELECT 
      c.category_id,
      c.category_name,
      COALESCE(SUM(oi.subtotal), 0) AS category_revenue
    FROM categories c
    LEFT JOIN products p ON c.category_id = p.category_id
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
    GROUP BY c.category_id, c.category_name
    ORDER BY category_revenue DESC
  `;
  const [rows] = await db.execute(query);
  return rows;
};

// ==========================================
// User Management Queries
// ==========================================

const getAllUsers = async (limit, offset, search = "") => {
  const searchPattern = `%${search}%`;
  const query = `
    SELECT id, name, email, mobile, role, created_at, updated_at
    FROM users
    WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ?
    ORDER BY created_at DESC
    LIMIT ${offset}, ${limit}
  `;
  const [rows] = await db.execute(query, [searchPattern, searchPattern, searchPattern]);
  return rows;
};

const getTotalUsersCountWithSearch = async (search = "") => {
  const searchPattern = `%${search}%`;
  const query = `
    SELECT COUNT(*) AS total
    FROM users
    WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ?
  `;
  const [rows] = await db.execute(query, [searchPattern, searchPattern, searchPattern]);
  return rows[0].total;
};

const updateUserRole = async (userId, role) => {
  const query = "UPDATE users SET role = ? WHERE id = ?";
  const [result] = await db.execute(query, [role, userId]);
  return result;
};

const deleteUser = async (userId) => {
  const query = "DELETE FROM users WHERE id = ?";
  const [result] = await db.execute(query, [userId]);
  return result;
};

// ==========================================
// Order Management Queries
// ==========================================

const getOrdersList = async (limit, offset, status = "", search = "") => {
  let query = `
    SELECT o.id AS order_id, o.user_id, u.name AS name, u.email AS email,
           o.address_id, o.total_amount, o.status, o.created_at AS order_date, o.updated_at,
           o.delivery_partner_name, o.delivery_partner_phone, o.estimated_delivery_minutes,
           a.pincode AS shipping_pincode
    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN addresses a ON o.address_id = a.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += " AND o.status = ?";
    params.push(status);
  }

  if (search) {
    query += " AND (u.name LIKE ? OR u.email LIKE ? OR CAST(o.id AS CHAR) = ?)";
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, search);
  }

  query += ` ORDER BY o.created_at DESC LIMIT ${offset}, ${limit}`;

  const [rows] = await db.execute(query, params);
  return rows;
};

const getOrdersCount = async (status = "", search = "") => {
  let query = `
    SELECT COUNT(*) AS total
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += " AND o.status = ?";
    params.push(status);
  }

  if (search) {
    query += " AND (u.name LIKE ? OR u.email LIKE ? OR CAST(o.id AS CHAR) = ?)";
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, search);
  }

  const [rows] = await db.execute(query, params);
  return rows[0].total;
};

const getOrderMainDetails = async (orderId) => {
  const query = `
    SELECT o.id AS order_id, o.user_id, u.name AS customer_name, u.email AS customer_email, u.mobile AS customer_mobile,
           o.total_amount, o.status, o.created_at, o.updated_at,
           o.delivery_partner_name, o.delivery_partner_phone, o.estimated_delivery_minutes,
           a.address_line1, a.address_line2, a.city, a.state, a.pincode, a.country
    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN addresses a ON o.address_id = a.id
    WHERE o.id = ?
  `;
  const [rows] = await db.execute(query, [orderId]);
  return rows[0];
};

const getOrderItemsList = async (orderId) => {
  const query = `
    SELECT id, product_id, product_name, quantity, price, subtotal
    FROM order_items
    WHERE order_id = ?
  `;
  const [rows] = await db.execute(query, [orderId]);
  return rows;
};

const updateOrderStatus = async (orderId, status) => {
  const query = "UPDATE orders SET status = ? WHERE id = ?";
  const [result] = await db.execute(query, [status, orderId]);
  return result;
};

const updateOrderDeliveryDetails = async (orderId, name, phone, minutes) => {
  const query = "UPDATE orders SET delivery_partner_name = ?, delivery_partner_phone = ?, estimated_delivery_minutes = ? WHERE id = ?";
  const [result] = await db.execute(query, [name, phone, minutes, orderId]);
  return result;
};

module.exports = {
  getTotalSales,
  getTotalOrdersCount,
  getTotalCustomersCount,
  getTotalProductsCount,
  getOutOfStockCount,
  getLowStockCount,
  getCategoryRevenue,
  getAllUsers,
  getTotalUsersCountWithSearch,
  updateUserRole,
  deleteUser,
  getOrdersList,
  getOrdersCount,
  getOrderMainDetails,
  getOrderItemsList,
  updateOrderStatus,
  updateOrderDeliveryDetails
};
