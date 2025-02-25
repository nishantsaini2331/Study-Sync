const Course = require("../models/course.model");
const ReviewAndRating = require("../models/reviewAndRating.model");

async function getReviewAndRating(req, res) {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    const reviewAndRating = await ReviewAndRating.findOne({
      student: req.user.id,
      course: course._id,
    })
      .populate({
        path: "student",
        select: "name photoUrl username -_id",
      })
      .populate({
        path: "course",
        select: "title courseId -_id",
      })
      .select("rating review createdAt -_id");

    if (reviewAndRating) {
      return res.status(200).json({
        success: true,
        data: reviewAndRating,
      });
    }
    return res.status(200).json({
      success: false,
      data: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function addReviewAndRating(req, res) {
  try {
    const { courseId } = req.params;
    const { rating, review } = req.body;

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    const reviewAndRating = await ReviewAndRating.findOne({
      student: req.user.id,
      course: course._id,
    });

    if (reviewAndRating) {
      return res.status(400).json({
        status: "error",
        message: "You have already reviewed this course",
      });
    }
    const newReviewAndRating = await ReviewAndRating.create({
      student: req.user.id,
      course: course._id,
      rating,
      review,
    });

    await newReviewAndRating.populate("student", "name photoUrl username -_id");
    await newReviewAndRating.populate("course", "title courseId -_id");

    course.reviewAndRating.push(newReviewAndRating._id);
    await course.save();

    return res.status(201).json({
      success: true,
      data: newReviewAndRating,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function updateReviewAndRating(req, res) {
  try {
    const { courseId } = req.params;
    const { rating, review } = req.body;

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    const reviewAndRating = await ReviewAndRating.findOne({
      student: req.user.id,
      course: course._id,
    });

    await reviewAndRating.populate("student", "name photoUrl username -_id");
    await reviewAndRating.populate("course", "title courseId -_id");
    if (!reviewAndRating) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    reviewAndRating.rating = rating;
    reviewAndRating.review = review;
    await reviewAndRating.save();

    return res.status(200).json({
      success: true,
      data: reviewAndRating,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function deleteReviewAndRating(req, res) {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    const reviewAndRating = await ReviewAndRating.findOne({
      student: req.user.id,
      course: course._id,
    });

    if (!reviewAndRating) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }

    course.reviewAndRating = course.reviewAndRating.filter(
      (id) => id.toString() !== reviewAndRating._id.toString()
    );
    await course.save();

    await ReviewAndRating.findByIdAndDelete(reviewAndRating._id);

    return res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

module.exports = {
  getReviewAndRating,
  addReviewAndRating,
  updateReviewAndRating,
  deleteReviewAndRating,
};
