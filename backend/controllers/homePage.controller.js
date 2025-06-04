const Course = require("../models/course.model");
const HomePage = require("../models/homePage.model");

async function getHomePage(req, res) {
  try {
    const homePage = await HomePage.findOne()
      .populate({
        path: "courseCategories",
        select: "name description",
      })
      .populate({
        path: "featuredCourses",
        select: "title description thumbnail price courseId",
        populate: {
          path: "instructor",
          select: "name username photoUrl",
        },
      })
      .populate({
        path: "testimonials",
        // select: "name role content rating",
      });

    let data = {
      courseCategories: [],
      featuredCourses: [],
      testimonials: [],
    };
    if (homePage) {
      data.courseCategories = homePage.courseCategories;
      data.featuredCourses = homePage.featuredCourses;
      data.testimonials = homePage.testimonials;
    }
    res.status(200).json({
      success: true,
      message: "Home page data fetched successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

// async function addHomePageCategory(params) {
//   try {
//     const category = new Category(params);
//     await category.save();
//     return category;
//   } catch (error) {
//     console.error(error);
//     throw new Error("Failed to add category");
//   }
// }

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

async function addHomePageCategory(req, res) {
  try {
    const { categoryId } = req.params;
    const homePage = await HomePage.findOne();
    if (homePage) {
      homePage.courseCategories.push(categoryId);
      await homePage.save();
    } else {
      const newHomePage = new HomePage({
        courseCategories: [categoryId],
      });
      await newHomePage.save();
    }
    res.status(200).json({
      success: true,
      message: "Category added to home page successfully",
      data: homePage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

async function removeHomePageCategory(req, res) {
  try {
    const { categoryId } = req.params;
    const homePage = await HomePage.findOne();
    if (homePage) {
      homePage.courseCategories.pull(categoryId);
      await homePage.save();
    }
    res.status(200).json({
      success: true,
      message: "Category removed from home page successfully",
      data: homePage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

async function addHomePageCourse(req, res) {
  try {
    const { courseId } = req.params;
    const homePage = await HomePage.findOne();
    const course = await Course.findOne({ courseId });
    if (homePage && course) {
      homePage.featuredCourses.push(course._id);
      await homePage.save();
    } else {
      const newHomePage = new HomePage({
        featuredCourses: [course._id],
      });
      await newHomePage.save();
    }
    res.status(200).json({
      success: true,
      message: "Course added to home page successfully",
      data: homePage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}
async function removeHomePageCourse(req, res) {
  try {
    const { courseId } = req.params;
    const course = await Course.findOne({ courseId });
    const homePage = await HomePage.findOne();
    if (homePage && course) {
      homePage.featuredCourses.pull(course._id);
      await homePage.save();
    }
    res.status(200).json({
      success: true,
      message: "Course removed from home page successfully",
      data: homePage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

module.exports = {
  getHomePage,
  addHomePageCategory,
  removeHomePageCategory,
  addHomePageCourse,
  removeHomePageCourse,
  // createHomePage,
  // updateHomePage,
};
