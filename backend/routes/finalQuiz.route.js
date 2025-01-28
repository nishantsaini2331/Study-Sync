const express = require("express");
const { createFinalQuiz ,getFinalQuiz} = require("../controllers/finalQuiz.controller");
const { auth, instructor } = require("../middlewares/auth");

const router = express.Router();

router.post("/:courseId", auth, instructor, createFinalQuiz);
router.get("/:courseId", auth, instructor, getFinalQuiz);

module.exports = router;
