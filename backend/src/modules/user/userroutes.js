const express = require("express");
const router = express.Router();

const userController = require("../user/usercontroller");

const verifyToken = require("../../middleware/authmiddleware");

router.post("/register", userController.register);

router.post("/login", userController.login);



module.exports = router;