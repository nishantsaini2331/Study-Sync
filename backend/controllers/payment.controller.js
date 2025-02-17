const razorpayInstance = require("../config/razorpayInstance");
const crypto = require("crypto");
const Payment = require("../models/payment.model");
const Course = require("../models/course.model");
const User = require("../models/user.model");
const { RAZORPAY_SECRET } = require("../config/dotenv");
const { default: mongoose } = require("mongoose");
const CourseProgress = require("../models/courseProgress.model");
const transporter = require("../utils/transporter");
const paymentSuccessfullTemplate = require("../mail/paymentSuccessfullTemplate");

async function createOrder(req, res) {
  try {
    const { amount, courseId } = req.body;

    const course = await Course.findOne({ courseId });
    const user = req.user;

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.enrolledStudents.includes(user.id)) {
      return res.status(400).json({
        success: false,
        message: "You have already enrolled in this course",
      });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function verifyPayment(req, res) {
  const session = await mongoose.startSession();

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      courseId,
    } = req.body;

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !courseId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment information",
      });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    await session.startTransaction();

    // const user = req.user;

    const user = await User.findById(req.user.id)
      .select("email name")
      .session(session);

    const existingPayment = await Payment.findOne({
      razorpay_payment_id,
      status: "successful",
    }).session(session);

    if (existingPayment) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Payment already processed",
      });
    }

    const course = await Course.findOne({ courseId })
      .populate({
        path: "lectures",
        select: "order",
      })
      .session(session);

    if (!course) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const alreadyPurchased = await Payment.findOne({
      user: user._id,
      course: course._id,
      status: "successful",
    }).session(session);

    if (alreadyPurchased) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Course already purchased",
      });
    }

    const razorpayPayment = await razorpayInstance.payments.fetch(
      razorpay_payment_id
    );

    if (razorpayPayment.amount / 100 !== course.price) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch",
      });
    }

    const payment = await Payment.create(
      [
        {
          user: user._id,
          course: course._id,
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          amount: course.price,
          status: "successful",
          paymentMethod: razorpayPayment?.method || "unknown",
        },
      ],
      { session }
    );

    await Course.findByIdAndUpdate(
      course._id,
      {
        $addToSet: { enrolledStudents: user._id },
        $inc: {
          "courseStats.totalStudents": 1,
          "courseStats.totalRevenue": course.price,
        },
      },
      { session }
    );

    await User.findByIdAndUpdate(
      user._id,
      {
        $addToSet: { purchasedCourse: course._id },
        $push: { paymentHistory: payment[0]._id },
        $pull: { cart: course._id },
      },
      { session }
    );

    const instructorId = course.instructor;

    const previousPurchase = await Payment.findOne({
      user: user._id,
      status: "successful",
      course: {
        $in: await Course.find({ instructor: instructorId }).distinct("_id"),
      },
    }).session(session);

    if (!previousPurchase) {
      await User.findByIdAndUpdate(
        instructorId,
        {
          $inc: { "intructorProfile.totalStudents": 1 },
        },
        { session }
      );
    }

    await User.findByIdAndUpdate(
      instructorId,
      {
        $inc: { "intructorProfile.totalEarnings": course.price * 0.7 },
      },
      { session }
    );

    const sortedLectures = course.lectures.sort((a, b) => a.order - b.order);

    const newProgress = await CourseProgress.create({
      student: user._id,
      course: course._id,
      lectureProgress: sortedLectures.map((lecture) => ({
        lecture: lecture._id,
        isUnlocked: lecture.order === 1,
        quizAttempts: [],
        isCompleted: false,
      })),
      currentLecture: sortedLectures[0]._id,
    });

    try {
      const message = {
        from: "Study Sync",
        to: user.email,
        subject: "Payment Successfull",
        html: paymentSuccessfullTemplate(
          course.title,
          course.courseId,
          course.price,
          user.name,
          razorpay_payment_id,
          payment[0].createdAt.toString(),
          razorpay_order_id
        ),
      };
      const response = await transporter.sendMail(message);

      await session.commitTransaction();
    } catch (emailError) {
      console.error("Error sending success email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        paymentId: razorpay_payment_id,
        courseId: course._id,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
}

module.exports = {
  createOrder,
  verifyPayment,
};
