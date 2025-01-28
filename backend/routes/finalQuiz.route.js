const express = require("express");
const { createFinalQuiz } = require("../controllers/finalQuiz.controller");
const { auth, instructor } = require("../middlewares/auth");

const router = express.Router();

router.post("/:courseId", auth, instructor, createFinalQuiz);

module.exports = router;
