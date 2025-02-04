const express = require("express");
const { auth, instructor } = require("../middlewares/auth");
const { createCourseReview } = require("../controllers/courseReview.controller");

const router = express.Router();

router.post("/", auth, instructor, createCourseReview);

module.exports = router;
