const express = require("express");

const {
  createOrder,
  verifyPayment,
} = require("../controllers/payment.controller");
const { auth, student } = require("../middlewares/auth");

const router = express.Router();

router.post("/create-order", auth, student, createOrder);
router.post("/verify-payment", auth, student, verifyPayment);

module.exports = router;
