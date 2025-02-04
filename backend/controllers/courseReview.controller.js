const Course = require("../models/course.model");
const CourseReview = require("../models/courseReview.model");

async function createCourseReview(req, res) {
  try {
    const { courseId, comment } = req.body;
    const instructor = req.user.id;
    const course = await Course.find({ courseId, instructor });

    if (course.length === 0) {
      return res.status(404).send("Course not found");
    }

    const existingReview = await CourseReview.find({
      courseId: course[0]._id,
      instructor,
    });

    if (existingReview.length > 0) {
      return res.status(400).json({
        message: "You have already submitted a review for this course",
        success: false,
      });
    }

    const courseReview = await CourseReview.create({
      courseId: course[0]._id,
      instructor,
      status: "pending",
    });

    await Course.findOneAndUpdate(
      { courseId, instructor },
      {
        courseVerification: courseReview._id,
        status: "Under Review",
      }
    );

    res.status(201).json({
      message: "Course review created successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
}

async function getCourseReviews(req, res) {
  try {
    const courseReviews = await CourseReview.find();
    res.status(200).send(courseReviews);
  } catch (error) {
    res.status(500).send(error);
  }
}

module.exports = {
  createCourseReview,
  getCourseReviews,
};
