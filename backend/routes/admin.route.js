const express = require("express");
const router = express.Router();
const { adminDashboard } = require("../controllers/admin.controller");
const { auth, admin } = require("../middlewares/auth");

router.get("/dashboard", auth, admin, adminDashboard);

module.exports = router;
