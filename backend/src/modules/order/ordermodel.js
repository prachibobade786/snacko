const db = require("../../config/db");

// Create Order
const createOrder = async (order) => {

    const query = `INSERT INTO orders
          (
            user_id,
            address_id,
            total_amount,
            status
        )
        VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(
        query,
        [
            order.user_id,
            order.address_id,
            order.total_amount,
            "pending"
        ]
    );

    return result;
};

// Get Orders By User
const getOrdersByUserId = async (userId) => {

    const [rows] = await db.execute(
        `
        SELECT *
        FROM orders
        WHERE user_id=?
        ORDER BY created_at DESC
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