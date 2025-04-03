const express = require("express");
const router = express.Router();
const {
  adminDashboard,
  searchForStudentOrInstructor,
  getUserData,
  userVerification,
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

module.exports = router;
