const orderModel = require("../order/ordermodel");

const addressService = require("../address/addressservices");

// Place Order
const placeOrder = async (orderData) => {

const address = await addressService.addressExists(orderData.address_id,orderData.user_id);

    if(!address){
        throw new Error(
            "Invalid Address"
        );
    }

    return await orderModel.createOrder(
        orderData
    );
};

// Get User Orders
const getOrders = async (
    userId
) => {

    return await orderModel
        .getOrdersByUserId(userId);
};

// Get Single Order
const getOrder = async (id) => {

    return await orderModel
        .getOrderById(id);
};

// Cancel Order
const removeOrder = async (id) => {

    return await orderModel
        .cancelOrder(id);
};

module.exports = {
    placeOrder,
    getOrders,
    getOrder,
    removeOrder
};