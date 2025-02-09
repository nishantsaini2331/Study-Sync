const express = require("express");
const { auth, instructor, admin } = require("../middlewares/auth");
const {
  createCourseVerify,
  getCourseVerifications,
  updateCourseVerification,
} = require("../controllers/courseVerify.controller");

const router = express.Router();

router.post("/", auth, instructor, createCourseVerify);
router.get("/", auth, admin, getCourseVerifications);
router.patch("/:courseId/:status", auth, admin, updateCourseVerification);

module.exports = router;
