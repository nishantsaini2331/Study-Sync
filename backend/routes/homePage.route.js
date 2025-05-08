const router = require("express").Router();
const {
//   createHomePage,
  getHomePage,
//   updateHomePage,
} = require("../controllers/homePage.controller");

// router.post("/", createHomePage);

router.get("/", getHomePage);

// router.put("/", updateHomePage);

module.exports = router;
