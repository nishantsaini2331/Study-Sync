const express = require("express");
const { auth, instructor } = require("../middlewares/auth");
const { instructorDashboard } = require("../controllers/instructor.controller");

const router = express.Router();

router.get("/dashboard", auth, instructor, instructorDashboard);

module.exports = router;
