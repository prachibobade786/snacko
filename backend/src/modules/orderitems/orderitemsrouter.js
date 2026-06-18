const express = require("express");

const router = express.Router();

const orderItemController = require("../orderitems/orderitemscontroller");

const verifyToken = require("../../middleware/authmiddleware");

router.post("/", verifyToken, orderItemController.addItem);

router.get("/", verifyToken, orderItemController.getAllItems);

router.get("/order/:orderId", verifyToken, orderItemController.getItems);

router.get("/:id", verifyToken, orderItemController.getItem);

router.put("/:id", verifyToken, orderItemController.updateItem);

router.delete("/:id", verifyToken, orderItemController.deleteItem);

module.exports = router;
