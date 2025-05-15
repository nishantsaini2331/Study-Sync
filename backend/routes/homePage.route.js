const router = require("express").Router();
const {
//   createHomePage,
  getHomePage,
  addHomePageCategory,
  removeHomePageCategory,
  addHomePageCourse,
  removeHomePageCourse
//   updateHomePage,
} = require("../controllers/homePage.controller");

// router.post("/", createHomePage);

router.get("/", getHomePage);
router.post("/categories/:categoryId", addHomePageCategory);
router.delete("/categories/:categoryId", removeHomePageCategory);

router.post("/featured-courses/:courseId", addHomePageCourse);
router.delete("/featured-courses/:courseId", removeHomePageCourse);

// router.put("/", updateHomePage);

module.exports = router;
