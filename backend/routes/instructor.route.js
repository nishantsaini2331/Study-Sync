const express = require("express");
const { auth, instructor } = require("../middlewares/auth");
const {
  instructorDashboard,
  instructorCourses,
} = require("../controllers/instructor.controller");

const router = express.Router();

router.get("/dashboard", auth, instructor, instructorDashboard);
router.get("/courses", auth, instructor, instructorCourses);

module.exports = router;
