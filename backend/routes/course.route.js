const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
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

router.get("/", auth, instructor, getCourses);

router.get("/:id", auth, isInstructorOrAdmin, getCourse);

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
