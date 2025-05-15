const express = require("express");
const router = express.Router();
const {
  adminDashboard,
  searchForStudentOrInstructor,
  getUserData,
  userVerification,
  getAllCourses,
  getAllCategories,
  getAllTestimonials,
} = require("../controllers/admin.controller");
const { auth, admin } = require("../middlewares/auth");

router.get("/dashboard", auth, admin, adminDashboard);
router.get("/users", auth, admin, searchForStudentOrInstructor);
router.get("/user/:username", auth, admin, getUserData);
router.patch(
  "/user/:username/toggle-verification",
  auth,
  admin,
  userVerification
);

router.get("/all-courses", auth, admin, getAllCourses);
router.get("/all-categories", auth, admin, getAllCategories);
router.get("/all-testimonials", auth, admin, getAllTestimonials);

module.exports = router;
