const express = require("express");

const router = express.Router();

const orderController =
require("../order/ordercontroller");

const verifyToken =
require("../../middleware/authmiddleware");

router.post(
    "/",
    verifyToken,
    orderController.placeOrder
);

router.get(
    "/",
    verifyToken,
    orderController.getOrders
);

router.get(
    "/:id",
    verifyToken,
    orderController.getOrder
);

router.patch(
    "/cancel/:id",
    verifyToken,
    orderController.cancelOrder
);

module.exports = router;