const Course = require("../models/course.model");
const CourseVerify = require("../models/courseVerify.model");

async function createCourseVerify(req, res) {
  try {
    const { courseId } = req.body;
    const instructor = req.user.id;
    const course = await Course.find({ courseId, instructor });

    if (course.length === 0) {
      return res.status(404).send("Course not found");
    }

    const existingReview = await CourseVerify.find({
      courseId: course[0]._id,
      instructor,
    });

    if (existingReview.length > 0) {
      return res.status(400).json({
        message: "You have already submitted a review for this course",
        success: false,
      });
    }

    const courseVerify = await CourseVerify.create({
      course: course[0]._id,
      instructor,
      status: "pending",
    });

    await Course.findOneAndUpdate(
      { courseId, instructor },
      {
        courseVerification: courseVerify._id,
        status: "under review",
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

async function getCourseVerifications(req, res) {
  try {
    const courseVerifications = await CourseVerify.find()
      .populate({
        path: "course",
        select:
          "title status category createdAt instructor description courseId thumbnail",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .populate({
        path: "instructor",
        select: "name username",
      });
    res.status(200).json({ success: true, courseVerifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function updateCourseVerification(req, res) {
  try {
    const { courseId, status } = req.params;
    const { comment } = req.body;

    const course = await Course.findOne({ courseId });
    if (!course) {
      return res.status(404).send("Course not found");
    }

    const courseVerify = await CourseVerify.findOne({
      course: course._id,
    });

    if (!courseVerify) {
      return res.status(404).send("Course review not found");
    }

    // if (
    //   courseVerify.status === "approved" ||
    //   courseVerify.status === "rejected"
    // ) {
    //   return res.status(400).json({
    //     message: "Course review has already been reviewed",
    //     success: false,
    //   });
    // }

    await CourseVerify.findOneAndUpdate(
      { course: course._id },
      {
        status,
        comment,
        approvedAt: status === "approved" ? new Date() : null,
      }
    );

    await Course.findOneAndUpdate(
      { courseId, instructor: course.instructor },
      {
        status: status === "approved" ? "published" : "rejected",
      }
    );

    res.status(200).json({
      message: "Course review updated successfully",
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

module.exports = {
  createCourseVerify,
  getCourseVerifications,
  updateCourseVerification,
};
