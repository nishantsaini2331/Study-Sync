const express = require("express");
const {
  auth,
  instructor,
  student,
  isInstructorOrAdmin,
} = require("../middlewares/auth");
const {
  instructorDashboard,
  instructorCourses,
  studentsDetails,
  courseDetailStats,
  getLectures,
  getLectureComments,
  canInstructorCreateCourse,
} = require("../controllers/instructor.controller");

const router = express.Router();

router.get(
  "/dashboard/:username",
  auth,
  isInstructorOrAdmin,
  instructorDashboard
);
router.get("/courses", auth, instructor, instructorCourses);
router.get("/students-details", auth, instructor, studentsDetails);
router.get("/course-detail-stats/:id", auth, instructor, courseDetailStats);
router.get("/lectures/:courseId", auth, instructor, getLectures);
router.get(
  "/lecture-comments/:lectureId",
  auth,
  instructor,
  getLectureComments
);

router.get(
  "/can-instructor-create-course",
  auth,
  instructor,
  canInstructorCreateCourse
);

module.exports = router;
