const express = require("express");
const router = express.Router();

const addressController = require("../address/addresscontroller");

const verifyToken = require("../../middleware/authmiddleware");

router.post("/", verifyToken, addressController.addAddress);

router.get("/", verifyToken, addressController.getUserAddresses);

router.get("/:id", verifyToken, addressController.getAddress);

router.put("/:id", verifyToken, addressController.updateAddress);

router.delete("/:id", verifyToken, addressController.deleteAddress);

module.exports = router;