const Course = require("../models/course.model");
const Payment = require("../models/payment.model");
const User = require("../models/user.model");

function instructorStats(instructor) {
  const stats = {
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
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
    const instructor = await User.findById(req.user.id).populate(
      "createdCourses"
    );
    if (!instructor) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const courses = await Course.find({ instructor: instructor._id })
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
          _id: { $month: "$createdAt" },
          revenue: { $sum: { $multiply: ["$amount", 0.7] } },
        },
      },
      {
        $addFields: {
          revenue: { $round: ["$revenue", 2] },
        },
      },
      {
        $facet: {
          revenue: [{ $project: { _id: 1, revenue: 1 } }],
          allMonths: [
            {
              $project: {
                month: { $range: [1, currentMonth + 1] },
              },
            },
            { $unwind: "$month" },
          ],
        },
      },
      { $unwind: "$allMonths" },
      {
        $project: {
          numericMonth: "$allMonths.month",
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
                $arrayElemAt: [
                  "$$monthsInString",
                  { $subtract: ["$allMonths.month", 1] },
                ],
              },
            },
          },
          revenue: {
            $let: {
              vars: {
                monthRevenue: {
                  $filter: {
                    input: "$revenue",
                    as: "r",
                    cond: { $eq: ["$$r._id", "$allMonths.month"] },
                  },
                },
              },
              in: {
                $ifNull: [{ $arrayElemAt: ["$$monthRevenue.revenue", 0] }, 0],
              },
            },
          },
        },
      },
      { $sort: { numericMonth: 1 } },
      { $project: { numericMonth: 0 } },
    ]);

    if (!monthlyRevenue.length) {
      monthlyRevenue.push(
        ...Array.from({ length: currentMonth }, (_, i) => ({
          month: new Date(currentYear, i).toLocaleString("default", {
            month: "short",
          }),
          revenue: 0,
        }))
      );
    }

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
          from: "courses", // Collection name for Course model
          localField: "course",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      { $unwind: "$courseDetails" },
      {
        $match: {
          "courseDetails.instructor": instructor._id, // Filter by instructor
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(
              `${currentYear}-${String(currentMonth).padStart(2, "0")}-31`
            ),
          },
          status: "successful", // Only count successful enrollments
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" }, // Group enrollments by month
          count: { $sum: 1 }, // Count enrollments per month
        },
      },
      {
        $facet: {
          enrollments: [{ $project: { _id: 1, count: 1 } }], // Store actual enrollment data
          allMonths: [
            {
              $project: {
                month: { $range: [1, currentMonth + 1] }, // Generate months from 1 to currentMonth
              },
            },
            { $unwind: "$month" },
          ],
        },
      },
      { $unwind: "$allMonths" },
      {
        $project: {
          numericMonth: "$allMonths.month", // Store numeric month for correct sorting
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
                $arrayElemAt: [
                  "$$monthsInString",
                  { $subtract: ["$allMonths.month", 1] },
                ],
              },
            },
          },
          enrollments: {
            $let: {
              vars: {
                monthEnrollments: {
                  $filter: {
                    input: "$enrollments",
                    as: "e",
                    cond: { $eq: ["$$e._id", "$allMonths.month"] },
                  },
                },
              },
              in: {
                $ifNull: [{ $arrayElemAt: ["$$monthEnrollments.count", 0] }, 0], // Set 0 if no data
              },
            },
          },
        },
      },
      { $sort: { numericMonth: 1 } }, // Correct sorting based on numeric month
      { $project: { numericMonth: 0 } }, // Remove numeric month after sorting
    ]);

    if (!monthlyEnrollments.length) {
      monthlyEnrollments.push(
        ...Array.from({ length: currentMonth }, (_, i) => ({
          month: new Date(currentYear, i).toLocaleString("default", {
            month: "short",
          }),
          enrollments: 0,
        }))
      );
    }
    instructorStats(instructor);
    return res.status(200).json({
      success: true,
      courses,
      instructor: instructorStats(instructor),
      dashboardStats: {
        monthlyRevenue,
        monthlyEnrollments,
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
    const instructor = await User.findById(req.user.id);
    if (!instructor) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const courses = await Course.find({ instructor: instructor._id })
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

    /**
     * {
     *  currentLearner: 1,
     * completedCourseStudents: 1,
     * totalLearner: 1,
     * completedCourseWithCertificate: 1,
     * notStartingLearning: 1,
     *
     * }
     */

    const studentsData = await Course.aggregate([
      {
        $match: {
          instructor: instructor._id,
          status: "published",
        },
      },
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
                isCourseFinalQuizPassed: true,
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

async function courseDetailStats(req, res) {}

module.exports = {
  instructorDashboard,
  instructorCourses,
  studentsDetails,
  courseDetailStats,
};
