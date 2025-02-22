const Course = require("../models/course.model");
const User = require("../models/user.model");

async function instructorDashboard(req, res) {
  try {
    
    const instructor = await User.findById(req.user.id).select(
      "instructorProfile"
    );
    if (!instructor) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log(instructor);
    const courses = await Course.find({ instructor: instructor._id }).select(
      "title description category price courseId thumbnail status updatedAt -_id"
    );

    return res.status(200).json({
      success: true,
      courses,
      instructor: instructor.instructorProfile,
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  instructorDashboard,
};
