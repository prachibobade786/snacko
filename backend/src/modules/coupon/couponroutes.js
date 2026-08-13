const express = require("express");
const router = express.Router();

const verifyToken = require("../../middleware/authmiddleware");
const isAdmin = require("../../middleware/adminmiddleware");
const couponController = require("./couponcontroller");

// Public/Authenticated Apply Coupon
router.post("/apply", verifyToken, couponController.applyCoupon);

// Admin/Warehouse Manager only CRUD endpoints
router.get("/", verifyToken, isAdmin, couponController.listCoupons);
router.post("/", verifyToken, isAdmin, couponController.createCoupon);
router.patch("/:id", verifyToken, isAdmin, couponController.updateCoupon);
router.delete("/:id", verifyToken, isAdmin, couponController.deleteCoupon);

module.exports = router;
