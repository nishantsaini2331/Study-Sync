const Category = require("../models/category.model");
const Course = require("../models/course.model");
const Payment = require("../models/payment.model");
const ReviewAndRating = require("../models/reviewAndRating.model");
const User = require("../models/user.model");

async function adminDashboard(req, res) {
  try {
    const { timeFilter = "all" } = req.query;

    const admin = await User.findById(req.user.id);

    if (!admin || !admin.roles.includes("admin")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Admin access required.",
      });
    }

    const currentDate = new Date();
    let startDate = new Date(2000, 0, 1);

    if (timeFilter === "30days") {
      startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - 30);
    } else if (timeFilter === "90days") {
      startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - 90);
    } else if (timeFilter === "365days") {
      startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - 365);
    }

    const revenueData = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: currentDate },
          status: "successful",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          platformRevenue: { $sum: { $multiply: ["$amount", 0.3] } },
          instructorRevenue: { $sum: { $multiply: ["$amount", 0.7] } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          platformRevenue: { $round: ["$platformRevenue", 2] },
          instructorRevenue: { $round: ["$instructorRevenue", 2] },
          enrollmentCount: "$count",
        },
      },
    ]);

    const topCourses = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: currentDate },
          status: "successful",
        },
      },
      {
        $group: {
          _id: "$course",
          enrollmentCount: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      { $unwind: "$courseDetails" },
      {
        $lookup: {
          from: "users",
          localField: "courseDetails.instructor",
          foreignField: "_id",
          as: "instructorDetails",
        },
      },
      { $unwind: "$instructorDetails" },
      {
        $project: {
          _id: 0,
          courseId: "$courseDetails.courseId",
          title: "$courseDetails.title",
          thumbnail: "$courseDetails.thumbnail",
          enrollmentCount: 1,
          revenue: { $round: ["$revenue", 2] },
          instructorName: "$instructorDetails.name",
          instructorUsername: "$instructorDetails.username",
          category: "$courseDetails.category",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ["$categoryDetails.name", 0] },
        },
      },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 5 },
    ]);

    const currentYear = new Date().getFullYear();
    const monthlyStats = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: currentDate,
          },
          status: "successful",
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$amount" },
          platformRevenue: { $sum: { $multiply: ["$amount", 0.3] } },
          enrollments: { $sum: 1 },
        },
      },
      {
        $addFields: {
          revenue: { $round: ["$revenue", 2] },
          platformRevenue: { $round: ["$platformRevenue", 2] },
        },
      },
      {
        $project: {
          month: {
            $let: {
              vars: {
                monthsInString: [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
              },
              in: {
                $arrayElemAt: ["$$monthsInString", { $subtract: ["$_id", 1] }],
              },
            },
          },
          revenue: 1,
          platformRevenue: 1,
          enrollments: 1,
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topInstructors = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: currentDate },
          status: "successful",
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      { $unwind: "$courseDetails" },
      {
        $group: {
          _id: "$courseDetails.instructor",
          totalRevenue: { $sum: "$amount" },
          instructorRevenue: { $sum: { $multiply: ["$amount", 0.7] } },
          enrollments: { $sum: 1 },
          courses: { $addToSet: "$courseDetails._id" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "instructorDetails",
        },
      },
      { $unwind: "$instructorDetails" },
      {
        $project: {
          _id: 0,
          instructorId: "$_id",
          name: "$instructorDetails.name",
          email: "$instructorDetails.email",
          username: "$instructorDetails.username",
          photoUrl: "$instructorDetails.photoUrl",
          totalRevenue: { $round: ["$totalRevenue", 2] },
          instructorRevenue: { $round: ["$instructorRevenue", 2] },
          enrollments: 1,
          courseCount: { $size: "$courses" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]);

    const categoryPerformance = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: currentDate },
          status: "successful",
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      { $unwind: "$courseDetails" },
      {
        $lookup: {
          from: "categories",
          localField: "courseDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: "$categoryDetails._id",
          categoryName: { $first: "$categoryDetails.name" },
          revenue: { $sum: "$amount" },
          enrollments: { $sum: 1 },
          courses: { $addToSet: "$courseDetails._id" },
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          name: "$categoryName",
          revenue: { $round: ["$revenue", 2] },
          enrollments: 1,
          courseCount: { $size: "$courses" },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const courseStatusData = await Course.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          actualCounts: { $push: { name: "$_id", value: "$count" } },
        },
      },
      {
        $project: {
          allStatuses: [
            { name: "draft", value: 0 },
            { name: "published", value: 0 },
            { name: "under review", value: 0 },
            { name: "rejected", value: 0 },
          ],
          actualCounts: 1,
        },
      },
      {
        $project: {
          mergedCounts: {
            $map: {
              input: "$allStatuses",
              as: "status",
              in: {
                name: "$$status.name",
                value: {
                  $let: {
                    vars: {
                      matchedStatus: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$actualCounts",
                              as: "countData",
                              cond: {
                                $eq: ["$$countData.name", "$$status.name"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: { $ifNull: ["$$matchedStatus.value", 0] },
                  },
                },
              },
            },
          },
        },
      },
      { $unwind: "$mergedCounts" },
      { $replaceRoot: { newRoot: "$mergedCounts" } },
    ]);

    const ensureAllMonths = (data) => {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const currentMonth = new Date().getMonth();

      const existingMonths = new Set(data.map((item) => item.month));

      monthNames.slice(0, currentMonth + 1).forEach((month) => {
        if (!existingMonths.has(month)) {
          data.push({ month, revenue: 0, platformRevenue: 0, enrollments: 0 });
        }
      });

      return data.sort(
        (a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
      );
    };

    const processedMonthlyStats = ensureAllMonths(monthlyStats);

    const platformSummary = {
      totalCourses: await Course.countDocuments(),
      publishedCourses: await Course.countDocuments({ status: "published" }),
      totalStudents: await User.countDocuments({
        purchasedCourses: { $exists: true, $ne: [] },
      }),
      totalInstructors: await User.countDocuments({
        roles: "instructor",
      }),
      categories: await Category.countDocuments(),
      revenue: revenueData.length > 0 ? revenueData[0].totalRevenue : 0,
      platformRevenue:
        revenueData.length > 0 ? revenueData[0].platformRevenue : 0,
      enrollments: revenueData.length > 0 ? revenueData[0].enrollmentCount : 0,
    };

    return res.status(200).json({
      success: true,
      timeFilter,
      platformSummary,
      financialMetrics:
        revenueData.length > 0
          ? revenueData[0]
          : {
              totalRevenue: 0,
              platformRevenue: 0,
              instructorRevenue: 0,
              enrollmentCount: 0,
            },
      topCourses,
      topInstructors,
      categoryPerformance,
      courseStatusData,
      monthlyStats: processedMonthlyStats,
      //   userGrowth,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching admin dashboard data",
      error: error.message,
    });
  }
}

async function searchForStudentOrInstructor(req, res) {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const regex = new RegExp(searchTerm, "i");

    const users = await User.find({
      $or: [{ name: regex }, { email: regex }, { username: regex }],
    }).select("name email username photoUrl roles createdAt updatedAt -_id");

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error searching for users",
      error: error.message,
    });
  }
}

async function getUserData(req, res) {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "username is required",
      });
    }

    const user = await User.findOne({ username }).select(
      "name email username photoUrl roles createdAt qualification createdCourses isVerified purchasedCourses updatedAt -_id"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error searching for users",
      error: error.message,
    });
  }
}

async function userVerification(req, res) {
  try {
    const { username } = req.params;
    const { isVerified } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isVerified = isVerified;
    await user.save();
    return res.status(200).json({
      success: true,
      message: `User verification status updated to ${isVerified}`,
      user: {
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error updating user verification status",
      error: error.message,
    });
  }
}

async function getAllCourses(req, res) {
  try {
    const courses = await Course.find({ status: "published" }).select(
      "title courseId -_id"
    );

    return res.status(200).json({
      success: true,
      message: "All courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching courses",
      error: error.message,
    });
  }
}

async function getAllCategories(req, res) {
  try {
    const categories = await Category.find();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
}

async function getAllTestimonials(req, res) {
  try {
    const testimonials = await ReviewAndRating.find().select("review").populate({
      path: "student",
      select: "name photoUrl -_id",
    }).populate({
      path: "course",
      select: "title -_id",
    });

    return res.status(200).json({
      success: true,
      data: testimonials,
      message: "Testimonials fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching testimonials",
      error: error.message,
    });
  }
}

module.exports = {
  adminDashboard,
  searchForStudentOrInstructor,
  getUserData,
  userVerification,
  getAllCourses,
  getAllCategories,
  getAllTestimonials,
};
