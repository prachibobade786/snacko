const express = require("express");
const router = express.Router();

const deliveryController = require("./deliveryController");

router.post("/check-zone", deliveryController.checkDeliveryZone);
router.post("/assign-order", deliveryController.assignDeliveryToOrder);
router.get("/tracking/:orderId", deliveryController.getOrderTracking);
router.patch("/status/:orderId", deliveryController.updateDeliveryStatus);

module.exports = router;
