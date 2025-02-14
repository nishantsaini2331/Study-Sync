const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getCoursesBySearchQuery,
  getCourseForStudent,
  checkStudentEnrollment,
} = require("../controllers/course.controller");
const {
  auth,
  instructor,
  admin,
  isInstructorOrAdmin,
} = require("../middlewares/auth");
const upload = require("../utils/multer");

const router = require("express").Router();

router.post(
  "/",
  auth,
  instructor,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "previewVideo", maxCount: 1 },
  ]),
  createCourse
);

router.get("/search", getCoursesBySearchQuery);

router.get("/check-enrolled/:id", auth, checkStudentEnrollment);

router.get("/", auth, instructor, getCourses);

router.get("/:id", auth, isInstructorOrAdmin, getCourse); // this is for instructor
router.get("/public/:id", getCourseForStudent); // this is for student

router.patch(
  "/:id",
  auth,
  instructor,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "previewVideo", maxCount: 1 },
  ]),
  updateCourse
);

router.delete("/:id", auth, instructor, deleteCourse);

module.exports = router;
