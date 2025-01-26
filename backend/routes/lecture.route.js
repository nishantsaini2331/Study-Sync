const router = require("express").Router();

const { createLecture, updateLecture, getLecture, deleteLecture } = require("../controllers/lecture.controller");
const { auth, instructor } = require("../middlewares/auth");
const upload = require("../utils/multer");

router.post(
  "/create-lecture/:id",
  auth,
  instructor,
  upload.single("video"),
  createLecture
);


router.get("/lecture/:id", auth, instructor, getLecture);

router.patch(
  "/edit-lecture/:id",
  auth,
  instructor,
  upload.single("video"),
  updateLecture
);

router.delete("/lecture/:id", auth, instructor, deleteLecture);

module.exports = router;
