const db = require("../../config/db");

// Create Order
const createOrder = async (order) => {

    const query = `INSERT INTO orders
          (
            user_id,
            address_id,
            total_amount,
            coupon_code,
            discount_amount,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(
        query,
        [
            order.user_id,
            order.address_id,
            order.total_amount,
            order.coupon_code || null,
            order.discount_amount || 0.00,
            "pending"
        ]
    );

    return result;
};

// Get Orders By User
const getOrdersByUserId = async (userId, page = null, limit = null) => {
    if (page && limit) {
        const p = Math.max(1, parseInt(page) || 1);
        const l = Math.max(1, parseInt(limit) || 10);
        const offset = (p - 1) * l;

        const [countRows] = await db.execute(
            "SELECT COUNT(*) AS total FROM orders WHERE user_id = ?",
            [userId]
        );
        const total = countRows[0] ? countRows[0].total : 0;

        const [rows] = await db.query(
            `SELECT o.*, p.payment_method, p.payment_status, p.transaction_id 
             FROM orders o 
             LEFT JOIN payments p ON o.id = p.order_id 
             WHERE o.user_id = ? 
             ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
            [userId, l, offset]
        );

        return {
            orders: rows,
            total,
            page: p,
            limit: l,
            totalPages: Math.ceil(total / l)
        };
    }

    const [rows] = await db.execute(
        `
        SELECT o.*, p.payment_method, p.payment_status, p.transaction_id
        FROM orders o
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
        `,
        [userId]
    );

    return rows;
};


// Get Order By Id
const getOrderById = async (id) => {

    const [rows] = await db.execute(
        `
        SELECT *
        FROM orders
        WHERE id=?
        `,
        [id]
    );

    return rows[0];
};

// Cancel Order
const cancelOrder = async (id) => {

    const [result] = await db.execute(
        `
        UPDATE orders
        SET status='cancelled'
        WHERE id=?
        `,
        [id]
    );

    return result;
};

module.exports = {
    createOrder,
    getOrdersByUserId,
    getOrderById,
    cancelOrder
};