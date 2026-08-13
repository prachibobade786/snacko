const express = require("express");
const router = express.Router();

const userController = require("../user/usercontroller");

const verifyToken = require("../../middleware/authmiddleware");

router.post("/register", userController.register);

router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

router.get("/profile", verifyToken, userController.getProfile);
router.put("/profile", verifyToken, userController.updateProfile);

module.exports = router;