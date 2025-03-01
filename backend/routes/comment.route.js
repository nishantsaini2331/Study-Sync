const express = require("express");

const router = express.Router();
const {
  auth,
  instructor,
  student,
  isInstructorOrStudent,
} = require("../middlewares/auth");
const {
  addComment,
  editComment,
  likeDislikeComment,
  deleteComment,
  addNestedComment,
  pinComment
} = require("../controllers/comment.controller");

router.post("/:lectureId", auth, isInstructorOrStudent, addComment);
router.delete("/:id", auth, isInstructorOrStudent, deleteComment);
router.put("/:id", auth, student, editComment);
router.patch("/:id", auth, student, likeDislikeComment);
router.post("/reply/:id", auth, isInstructorOrStudent, addNestedComment);
router.patch("/pin/:id", auth, instructor, pinComment);

module.exports = router;
