const Course = require("../models/course.model");
const Lecture = require("../models/lecture.model");
const Payment = require("../models/payment.model");
const { Request } = require("../models/request.model");
const ReviewAndRating = require("../models/reviewAndRating.model");
const User = require("../models/user.model");
const { populateReplies } = require("./student.controller");

async function instructorStats(instructor) {
  const stats = {
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
    averageRating: 0,
  };

  const courses = instructor.createdCourses;

  if (courses && courses.length) {
    stats.totalCourses = courses.length;

    stats.totalEarnings = parseFloat(
      (
        courses.reduce((acc, course) => {
          const enrolledCount = course.enrolledStudents?.length || 0;
          return acc + course.price * enrolledCount;
        }, 0) * 0.7
      ).toFixed(2)
    );

    let totalRating = 0;
    let totalNumberOfRating = 0;

    for (const course of courses) {
      if (course.status === "published") {
        const ratings = await Promise.all(
          course.reviewAndRating.map((ratingId) =>
            ReviewAndRating.findById(ratingId)
          )
        );

        ratings.forEach((rating) => {
          if (rating) {
            totalRating += rating.rating;
            totalNumberOfRating++;
          }
        });
      }
    }

    if (totalNumberOfRating > 0) {
      stats.averageRating = parseFloat(
        (totalRating / totalNumberOfRating).toFixed(2)
      );
    }

    const uniqueStudentIds = new Set();

    courses.forEach((course) => {
      if (course.status === "published" && course.enrolledStudents) {
        course.enrolledStudents.forEach((studentId) => {
          uniqueStudentIds.add(studentId.toString());
        });
      }
    });

    stats.totalStudents = uniqueStudentIds.size;
  }

  return stats;
}

async function instructorDashboard(req, res) {
  try {
    const user = req.user;
    const { username } = req.params;
    let userId = user.id;

    if (username !== "me") {
      let user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      userId = user._id;
    }

    const instructor = await User.findById(userId).populate("createdCourses");
    if (!instructor) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const courses = await Course.find({
      instructor: instructor._id,
      status: "published",
    })
      .select(
        "title description category price courseId thumbnail status updatedAt courseStats -_id"
      )
      .populate("category", "name")
      .limit(5);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const monthlyRevenue = await Payment.aggregate([
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
        $match: {
          "courseDetails.instructor": instructor._id,
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(
              `${currentYear}-${String(currentMonth).padStart(2, "0")}-31`
            ),
          },
          status: "successful",
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            courseId: "$course",
          },
          monthlyRevenue: { $sum: { $multiply: ["$amount", 0.7] } },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          revenue: { $sum: "$monthlyRevenue" },
        },
      },
      {
        $addFields: {
          revenue: { $round: ["$revenue", 2] },
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
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const courseStatusData = await Course.aggregate([
      {
        $match: {
          instructor: instructor._id,
        },
      },
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
      {
        $replaceRoot: { newRoot: "$mergedCounts" },
      },
    ]);

    const monthlyEnrollments = await Payment.aggregate([
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
        $match: {
          "courseDetails.instructor": instructor._id,
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(
              `${currentYear}-${String(currentMonth).padStart(2, "0")}-31`
            ),
          },
          status: "successful",
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            courseId: "$course",
          },
          monthlyEnrollments: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          enrollments: { $sum: "$monthlyEnrollments" },
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
          enrollments: 1,
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const ensureAllMonths = (data, currentMonth) => {
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

      const existingMonths = new Set(data.map((item) => item.month));

      monthNames.slice(0, currentMonth).forEach((month) => {
        if (!existingMonths.has(month)) {
          data.push({ month, revenue: 0, enrollments: 0 });
        }
      });

      return data.sort(
        (a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
      );
    };

    const processedMonthlyRevenue = ensureAllMonths(
      monthlyRevenue,
      currentMonth
    );
    const processedMonthlyEnrollments = ensureAllMonths(
      monthlyEnrollments,
      currentMonth
    );

    return res.status(200).json({
      success: true,
      courses,
      instructor: await instructorStats(instructor),
      dashboardStats: {
        monthlyRevenue: processedMonthlyRevenue,
        monthlyEnrollments: processedMonthlyEnrollments,
        courseStatusData,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
}

async function instructorCourses(req, res) {
  try {
    const { publishedCourses } = req.query;
    const instructor = await User.findById(req.user.id);
    if (!instructor) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const courses = await Course.find({
      instructor: instructor._id,
      status:
        publishedCourses === "true"
          ? "published"
          : { $in: ["draft", "under review", "rejected", "published"] },
    })
      .select(
        "title description category price courseId thumbnail status updatedAt -_id"
      )
      .populate("category", "name");

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
}

async function studentsDetails(req, res) {
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

    const { courseId } = req.query;
    const matchStage = {
      instructor: instructor._id,
      status: "published",
    };

    if (courseId && courseId !== "all") {
      matchStage.courseId = courseId;
    }

    const studentsData = await Course.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "courseprogresses",
          localField: "_id",
          foreignField: "course",
          as: "progress",
        },
      },
      {
        $unwind: {
          path: "$progress",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "progress.student",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: {
          path: "$student",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $facet: {
          currentLearner: [
            {
              $match: {
                "progress.overallProgress": { $gt: 0, $lt: 100 },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          completedCourseStudents: [
            {
              $match: {
                "progress.overallProgress": 100,
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          totalLearner: [
            {
              $match: {
                "progress.student": { $exists: true, $ne: null },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          completedCourseWithCertificate: [
            {
              $match: {
                "progress.overallProgress": 100,
                "progress.isCourseFinalQuizPassed": true,
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          notStartingLearning: [
            {
              $match: {
                "progress.overallProgress": 0,
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
      {
        $project: {
          currentLearner: {
            $ifNull: [{ $arrayElemAt: ["$currentLearner.count", 0] }, 0],
          },
          completedCourseStudents: {
            $ifNull: [
              { $arrayElemAt: ["$completedCourseStudents.count", 0] },
              0,
            ],
          },
          totalLearner: {
            $ifNull: [{ $arrayElemAt: ["$totalLearner.count", 0] }, 0],
          },
          completedCourseWithCertificate: {
            $ifNull: [
              { $arrayElemAt: ["$completedCourseWithCertificate.count", 0] },
              0,
            ],
          },
          notStartingLearning: {
            $ifNull: [{ $arrayElemAt: ["$notStartingLearning.count", 0] }, 0],
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      studentsData: studentsData[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching student details",
      error: error.message,
    });
  }
}

async function getLectures(req, res) {
  try {
    const { courseId } = req.params;
    const instructor = req.user;

    const course = await Course.findOne({ courseId }).populate("lectures");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.instructor.toString() !== instructor.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      lectures: course.lectures,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching lectures",
      error: error.message,
    });
  }
}

async function getLectureComments(req, res) {
  try {
    const { lectureId } = req.params;
    const instructor = req.user;

    const lecture = await Lecture.findOne({ lectureId }).populate({
      path: "comments",
      populate: {
        path: "student",
        select: "name email username profilePic",
      },
    });
    lecture.comments = await populateReplies(lecture.comments);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    const course = await Course.findById(lecture.course);

    if (course.instructor.toString() !== instructor.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      comments: lecture.comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
}

async function courseDetailStats(req, res) {}

module.exports = {
  instructorDashboard,
  instructorCourses,
  studentsDetails,
  courseDetailStats,
  getLectures,
  getLectureComments,
};
