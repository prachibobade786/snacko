const express = require("express");
const router = express.Router();

const smartCartController = require("./smartCartController");

router.post("/check-budget", smartCartController.checkBudget);
router.get("/alternatives/:productId", smartCartController.getAlternativesForProduct);

module.exports = router;
