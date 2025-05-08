const HomePage = require("../models/homePage.model");

async function getHomePage(req, res) {
  try {
    const homePage = await HomePage.findOne();
    if (!homePage) {
      return res.status(404).json({ message: "Home page not found" });
    }
    res.status(200).json(homePage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

async function updateHomePage(req, res) {
  try {
    const { courseCategories, featuredCourses, testimonials } = req.body;
    const homePage = await HomePage.findOneAndUpdate(
      {},
      { courseCategories, featuredCourses, testimonials },
      { new: true }
    );
    if (!homePage) {
      return res.status(404).json({ message: "Home page not found" });
    }
    res.status(200).json(homePage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

module.exports = {
  getHomePage,
  // createHomePage,
  // updateHomePage,
};
