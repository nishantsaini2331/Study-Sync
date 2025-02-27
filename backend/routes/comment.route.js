const express = require("express");

const router = express.Router();
const { auth, instructor, student } = require("../middlewares/auth");
const { addComment } = require("../controllers/comment.controller");
router.post("/:lectureId", auth , student , addComment);

module.exports = router;
