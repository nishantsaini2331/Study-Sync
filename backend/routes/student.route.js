const express = require("express");

const router = express.Router();

const { auth, student } = require("../middlewares/auth");
const {
  getStudentCourseById,
  unlockLecture,
  getCurrentLecture,
} = require("../controllers/student.controller");

router.route("/:id/learn").get(auth, student, getStudentCourseById);

router
  .route("/:courseId/:lectureId/unlock-lecture")
  .patch(auth, student, unlockLecture);

router.get(
  "/current-lecture/:courseId/:lectureId",
  auth,
  student,
  getCurrentLecture
);

module.exports = router;
