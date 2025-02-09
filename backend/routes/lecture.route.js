const router = require("express").Router();

const {
  createLecture,
  updateLecture,
  getLecture,
  deleteLecture,
} = require("../controllers/lecture.controller");
const { auth, instructor } = require("../middlewares/auth");
const upload = require("../utils/multer");

router.post("/:id", auth, instructor, upload.single("video"), createLecture);

router.get("/:id", auth, instructor, getLecture);

router.patch("/:id", auth, instructor, upload.single("video"), updateLecture);

router.delete("/:id", auth, instructor, deleteLecture);

module.exports = router;
