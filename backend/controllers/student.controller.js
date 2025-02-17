const Course = require("../models/course.model");
const CourseProgress = require("../models/courseProgress.model");
const Lecture = require("../models/lecture.model");
const QuizAttempt = require("../models/quizAttempt.model");

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
    })
      .populate({
        path: "lectureProgress.lecture",
        populate: {
          path: "mcqs",
        },
      })
      .populate("lectureProgress.quizAttempts");

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let lockedLectures = [];
    let unlockedLectures = [];

    courseProgress.lectureProgress.map((lec) =>
      lec.isUnlocked
        ? unlockedLectures.push(lec)
        : lockedLectures.push({
            title: lec.lecture.title,
            duration: lec.lecture.duration,
          })
    );

    console.log(lockedLectures, unlockedLectures);

    let currentLecture = unlockedLectures.find(
      (lec) =>
        lec.lecture._id.toString() === courseProgress.currentLecture.toString()
    );

    return res.status(200).json({
      success: true,
      data: { lockedLectures, unlockedLectures, currentLecture },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function unlockLecture(req, res) {
  try {
    const student = req.user;
    const { courseId, lectureId } = req.params;
    const { userAnswers } = req.body;

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

    const lecture = await Lecture.findOne({ lectureId }).populate("mcqs");

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    const currentLecture = courseProgress.currentLecture.toString();

    if (currentLecture !== lecture._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You can only unlock the current lecture",
      });
    }

    const lectureProgress = courseProgress.lectureProgress.find(
      (lec) => lec.lecture.toString() === lecture._id.toString()
    );

    if (!lectureProgress) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    if (lectureProgress.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Lecture already completed",
      });
    }

    const mcqs = lecture.mcqs;

    const correctAnswers = mcqs.map((mcq) => mcq.correctOption);

    let score = 0;

    for (let i = 0; i < mcqs.length; i++) {
      if (userAnswers[i] === correctAnswers[i]) {
        score += 1;
      }
    }

    const totalQuestions = mcqs.length;

    const passingScore = lecture.requiredPassPercentage;

    const isPassed = (score / totalQuestions) * 100 >= passingScore;

    const quizAttempt = await QuizAttempt.create({
      student: student.id,
      lecture: lecture._id,
      mcqResponses: mcqs.map((mcq, index) => ({
        mcq: mcq._id,
        selectedOption: {
          text: mcq.options[userAnswers[index]],
          isCorrect: userAnswers[index] === correctAnswers[index],
        },
      })),
      score: Math.round((score / totalQuestions) * 100),
      totalQuestions,
      passingScore,
      isPassed,
    });

    await courseProgress.updateLectureProgress(lecture._id, quizAttempt);

    return res.status(200).json({
      success: true,
      data: { score, totalQuestions, passingScore, isPassed },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  getStudentCourseById,
  unlockLecture,
};
