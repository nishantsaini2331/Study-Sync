const router = require("express").Router();

const {
  register,
  deleteUser,
  getUser,
  login,
  logout,
  updateUser,
} = require("../controllers/user.controller");
const { auth } = require("../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", auth, logout);
router.get("/user", auth, getUser);
router.put("/user", auth, updateUser);
router.delete("/user", auth, deleteUser);

module.exports = router;
