const express = require("express");
const { student, auth } = require("../middlewares/auth");
const {
  getReviewAndRating,
  addReviewAndRating,
  updateReviewAndRating,
  deleteReviewAndRating
} = require("../controllers/reviewAndRating.controller");
const router = express.Router();

router.get("/:courseId", auth, student, getReviewAndRating);
router.post("/:courseId", auth, student, addReviewAndRating);
router.put("/:courseId", auth, student, updateReviewAndRating);
router.delete("/:courseId", auth, student, deleteReviewAndRating);
module.exports = router;
