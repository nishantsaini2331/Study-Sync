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

router.get("/auth", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "name photoUrl username roles"
  );
  res.json({
    user,
    success: true,
    message: "Authorized access",
  });
});

module.exports = router;
