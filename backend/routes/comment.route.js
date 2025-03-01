const express = require("express");

const router = express.Router();
const { auth, instructor, student } = require("../middlewares/auth");
const {
  addComment,
  editComment,
  likeDislikeComment,
  deleteComment,
  addNestedComment,
} = require("../controllers/comment.controller");

router.post("/:lectureId", auth, student, addComment);
router.delete("/:id", auth, student, deleteComment);
router.put("/:id", auth, student, editComment);
router.patch("/:id", auth, student, likeDislikeComment);
router.post("/reply/:id", auth, student, addNestedComment);

module.exports = router;
