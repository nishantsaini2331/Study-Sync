const Course = require("../models/course.model");
const User = require("../models/user.model");
async function addToCart(req, res) {
  try {
    const { courseId } = req.params;

    const student = await User.findById(req.user.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    student.cart.push(course._id);

    await student.save();

    res.status(200).json({ success: true, message: "Course added to cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ succes: false, message: "Internal server error " });
  }
}

async function removeFromCart(req, res) {
  try {
    const { courseId } = req.params;

    const student = await User.findById(req.user.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    student.cart = student.cart.filter(
      (courseId) => courseId.toString() !== course._id.toString()
    );

    await student.save();

    return res
      .status(200)
      .json({ success: true, message: "Course removed from cart" });
  } catch (error) {
    res.status(500).json({ succes: false, message: "Internal server error " });
  }
}

module.exports = { addToCart, removeFromCart };
