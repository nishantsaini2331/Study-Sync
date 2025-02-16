const Course = require("../models/course.model");
const CourseProgress = require("../models/courseProgress.model");
const Lecture = require("../models/lecture.model");

async function getStudentCourseById(req, res) {
  try {
    const student = req.user;
    const courseId = req.params.id;

    const course = await Course.findOne({ courseId }).populate("lectures");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const courseProgress = await CourseProgress.findOne({
      student: student.id,
      course: course._id,
    });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const lectures = course.lectures.sort((a, b) => a.order - b.order);

    let lockedLectures = [];
    let unlockedLectures = [];

    const g = courseProgress.lectureProgress.map((lec) =>
      lec.isUnlocked
        ? lockedLectures.push(lec.lecture)
        : unlockedLectures.push(lec.lecture)
    );

    unlockedLectures = await Lecture.find({
      _id: { $in: unlockedLectures },
    }).select("title duration -_id");
    lockedLectures = await Lecture.find({
      _id: { $in: lockedLectures },
    });

    return res.status(200).json({
      success: true,
      data: { lockedLectures, unlockedLectures },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  getStudentCourseById,
};
