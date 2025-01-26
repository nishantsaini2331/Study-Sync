const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/course.controller");
const { auth, instructor } = require("../middlewares/auth");
const upload = require("../utils/multer");

const router = require("express").Router();

router.post(
  "/create-course",
  auth,
  instructor,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "previewVideo", maxCount: 1 },
  ]),
  createCourse
);

router.get("/courses", auth, instructor, getCourses);

router.get("/course/:id", auth, instructor, getCourse);

router.patch(
  "/edit-course/:id",
  auth,
  instructor,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "previewVideo", maxCount: 1 },
  ]),
  updateCourse
);

router.delete("/course/:id", auth, instructor, deleteCourse);

module.exports = router;
