const express = require("express");

const router = express.Router();

const { addToCart, removeFromCart } = require("../controllers/cart.controller");
const { auth, student } = require("../middlewares/auth");

router.post("/:courseId", auth, student, addToCart);

router.delete("/:courseId", auth, student, removeFromCart);

module.exports = router;
