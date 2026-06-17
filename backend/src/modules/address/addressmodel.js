const db = require("../../config/db");

// Add Address
const createAddress = async (address) => {

    const query = `
        INSERT INTO addresses
        (
            user_id,
            address_line1,
            address_line2,
            city,
            state,
            pincode,
            country,
            is_default
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
        address.user_id,
        address.address_line1,
        address.address_line2,
        address.city,
        address.state,
        address.pincode,
        address.country,
        address.is_default || false
    ]);

    return result;
};

// Get All Addresses of User

const getAddressesByUserId = async (userId) => {

    const [rows] = await db.execute(
        "SELECT * FROM addresses WHERE user_id = ?",
        [userId]
    );

    return rows;
};

// Get Address By ID

const getAddressById = async (id) => {

    const [rows] = await db.execute(
        "SELECT * FROM addresses WHERE id = ?",
        [id]
    );

    return rows[0];
};

// Update Address

const updateAddress = async (id, address) => {

    const query = `
        UPDATE addresses
        SET
            address_line1 = ?,
            address_line2 = ?,
            city = ?,
            state = ?,
            pincode = ?,
            country = ?
        WHERE id = ?
    `;

    const [result] = await db.execute(query, [
        address.address_line1,
        address.address_line2,
        address.city,
        address.state,
        address.pincode,
        address.country,
        id
    ]);

    return result;
};

// Delete Address

const deleteAddress = async (id) => {

    const [result] = await db.execute(
        "DELETE FROM addresses WHERE id = ?",
        [id]
    );

    return result;
};

module.exports = {
    createAddress,
    getAddressesByUserId,
    getAddressById,
    updateAddress,
    deleteAddress
};