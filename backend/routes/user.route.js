const router = require("express").Router();

const {
  register,
  deleteUser,
  getUser,
  login,
  logout,
  updateUser,
  verifyEmail,
  onboard,
  fetchProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyResetToken,
} = require("../controllers/user.controller");
const { auth } = require("../middlewares/auth");
const User = require("../models/user.model");
const upload = require("../utils/multer");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", auth, logout);
router.get("/user/:username", getUser);
router.patch("/user", auth, upload.single("photoUrl"), updateUser);
router.delete("/user", auth, deleteUser);
router.get("/verify-email/:verificationToken", verifyEmail);

router.post("/instructor/onboard", auth, onboard);
router.get("/profile/:username", fetchProfile);

router.post("/change-password", auth, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-reset-token/:token", verifyResetToken);

router.get("/auth", auth, async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("name photoUrl username roles email courseCreateLimit cart")
    .populate({ path: "cart", select: "courseId -_id" });

  const courseIds = user.cart.map((course) => course.courseId);

  res.json({
    user: {
      ...user.toObject(),
      cart: courseIds,
    },
    success: true,
    message: "Authorized access",
  });
});

module.exports = router;
