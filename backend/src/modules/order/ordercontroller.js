const orderService = require("../order/orderservices");

// Place Order
const placeOrder = async (req,res) => {

    try {

        const data = {
            ...req.body,
            user_id:req.user.id
        };

        const result =
        await orderService.placeOrder(
            data
        );

        res.status(201).json({
            success:true,
            message:
            "Order Placed Successfully",
            data:result
        });

    } catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }
};

// Get All Orders
const getOrders = async (
    req,
    res
) => {

    try {
        const { page, limit } = req.query;

        const result =
        await orderService.getOrders(
            req.user.id,
            page,
            limit
        );

        if (page && limit) {
            return res.status(200).json({
                success: true,
                data: result.orders,
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            });
        }

        res.status(200).json({
            success:true,
            data:result
        });

    } catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }
};

// Get Order By Id
const getOrder = async (
    req,
    res
) => {

    try {

        const order =
        await orderService.getOrder(
            req.params.id
        );

        res.status(200).json({
            success:true,
            data:order
        });

    } catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }
};

// Cancel Order
const cancelOrder = async (
    req,
    res
) => {

    try {

        await orderService.removeOrder(
            req.params.id,
            req.user
        );

        res.status(200).json({
            success:true,
            message:
            "Order Cancelled Successfully"
        });

    } catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }
};

module.exports = {
    placeOrder,
    getOrders,
    getOrder,
    cancelOrder
};