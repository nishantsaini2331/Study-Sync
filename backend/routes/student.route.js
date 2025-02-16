const express = require("express");

const router = express.Router();

const { auth, student } = require("../middlewares/auth");
const { getStudentCourseById } = require("../controllers/student.controller");

router.route("/:id/learn").get(auth, student, getStudentCourseById);

module.exports = router;
