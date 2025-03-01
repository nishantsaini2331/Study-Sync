const Comment = require("../models/comment.model");
const Course = require("../models/course.model");
const CourseProgress = require("../models/courseProgress.model");
const Lecture = require("../models/lecture.model");
const QuizAttempt = require("../models/quizAttempt.model");

async function populateReplies(comments) {
  for (const comment of comments) {
    let populatedComment = await Comment.findById(comment._id).populate({
      path: "replies",
      populate: {
        path: "student",
        select: "name email username profilePic",
      },
    });

    comment.replies = populatedComment.replies;

    if (comment.replies && comment.replies.length > 0) {
      await populateReplies(comment.replies);
    }
  }
  return comments;
}

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
        populate: [
          {
            path: "mcqs",
          },
          {
            path: "comments",
            populate: {
              path: "student",
              select: "name email username profilePic",
            },
          },
        ],
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
        ? lec.lecture._id.toString() == courseProgress.currentLecture.toString()
          ? unlockedLectures.push(lec)
          : unlockedLectures.push({
              lecture: {
                _id: lec.lecture._id,
                title: lec.lecture.title,
                duration: lec.lecture.duration,
                lectureId: lec.lecture.lectureId,
                order: lec.lecture.order,
              },
              isCompleted: lec.isCompleted,
            })
        : lockedLectures.push({
            title: lec.lecture.title,
            duration: lec.lecture.duration,
          })
    );

    let currentLecture = unlockedLectures.find(
      (lec) =>
        lec.lecture._id.toString() === courseProgress.currentLecture.toString()
    );

    if (!currentLecture.isCompleted) {
      console.log("object");
      let lectureWithoutMcqsCorrectOptions = await Lecture.findById(
        currentLecture.lecture._id
      ).populate([
        {
          path: "mcqs",
          select: "-correctOption",
        },
        {
          path: "comments",
          populate: {
            path: "student",
            select: "name email username profilePic",
          },
        },
      ]);

      currentLecture.lecture = lectureWithoutMcqsCorrectOptions;
    }

    currentLecture.lecture.comments = await populateReplies(
      currentLecture.lecture.comments
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

    for (let i = 0; i < mcqs.length; i++) {
      if (!Object.keys(userAnswers).includes(mcqs[i]._id.toString())) {
        return res.status(400).json({
          success: false,
          message: "Please make sure you have answered all questions",
        });
      }
    }

    let correctAnswers = 0;
    let totalQuestions = mcqs.length;

    for (let i = 0; i < mcqs.length; i++) {
      for (let j = 0; j < Object.keys(userAnswers).length; j++) {
        if (mcqs[i]._id.toString() === Object.keys(userAnswers)[j]) {
          if (
            mcqs[i].correctOption === userAnswers[Object.keys(userAnswers)[j]]
          ) {
            correctAnswers += 1;
          }
        }
      }
    }

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const isPassed = percentage >= lecture.requiredPassPercentage;
    if (isPassed) {
      const quizAttempt = await QuizAttempt.create({
        student: student.id,
        lecture: lecture._id,
        mcqResponses: mcqs.map((mcq, index) => ({
          mcq: mcq._id,
          selectedOption: {
            text: mcq.options[userAnswers[mcq._id]],
            isCorrect: mcq.correctOption === userAnswers[mcq._id],
          },
        })),
        score: Math.round((correctAnswers / totalQuestions) * 100),
        totalQuestions,
        passingScore: lecture.requiredPassPercentage,
        isPassed,
      });
      await courseProgress.updateLectureProgress(lecture._id, quizAttempt);
    }

    return res.status(200).json({
      success: true,
      data: { correctAnswers, totalQuestions, percentage, isPassed },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function getCurrentLecture(req, res) {
  try {
    const student = req.user;
    const { courseId, lectureId } = req.params;

    const course = await Course.findOne({ courseId }).populate("lectures");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const lecture = await Lecture.findOne({ lectureId });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    const courseProgress = await CourseProgress.findOne({
      student: student.id,
      course: course._id,
    })
      .populate({
        path: "lectureProgress.lecture",
        populate: [
          {
            path: "mcqs",
          },
          {
            path: "comments",
            populate: {
              path: "student",
              select: "name email username profilePic",
            },
          },
        ],
      })
      .populate("lectureProgress.quizAttempts");

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    courseProgress.currentLecture = lecture._id;
    await courseProgress.save();

    let currentLecture = courseProgress.lectureProgress.find(
      (lec) => lec.lecture._id.toString() == lecture._id.toString()
    );

    if (!currentLecture.isCompleted) {
      let lectureWithoutMcqsCorrectOptions = await Lecture.findById(
        currentLecture.lecture._id
      ).populate([
        {
          path: "mcqs",
          select: "-correctOption",
        },
        {
          path: "comments",
          populate: {
            path: "student",
            select: "name email username profilePic",
          },
        },
      ]);
      currentLecture.lecture = lectureWithoutMcqsCorrectOptions;
    }

    currentLecture.lecture.comments = await populateReplies(
      currentLecture.lecture.comments
    );

    return res.status(200).json({
      success: true,
      data: currentLecture,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  getStudentCourseById,
  unlockLecture,
  getCurrentLecture,
  populateReplies
};
