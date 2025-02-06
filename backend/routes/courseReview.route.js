const express = require("express");
const { auth, instructor, admin } = require("../middlewares/auth");
const {
  createCourseReview,
  getCourseReviews,
} = require("../controllers/courseReview.controller");

const router = express.Router();

router.post("/", auth, instructor, createCourseReview);
router.get("/", auth, admin, getCourseReviews);

module.exports = router;
