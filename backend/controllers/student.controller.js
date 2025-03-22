const Comment = require("../models/comment.model");
const Course = require("../models/course.model");
const CourseProgress = require("../models/courseProgress.model");
const Lecture = require("../models/lecture.model");
const QuizAttempt = require("../models/quizAttempt.model");
const FinalQuiz = require("../models/finalQuiz.model");
const CourseCertification = require("../models/certificate.model");
const User = require("../models/user.model");

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
      .populate("lectureProgress.quizAttempts finalQuizAttempts");

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

    let finalQuiz;

    if (courseProgress.overallProgress === 100) {
      finalQuiz = await FinalQuiz.findOne({ course: course._id }).populate({
        path: "mcqs",
        select: courseProgress.isCourseFinalQuizPassed ? "" : "-correctOption",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        finalQuizAttemptLeft: courseProgress.finalQuizAttemptLeft,
        lockedLectures,
        unlockedLectures,
        currentLecture,
        overallProgress: courseProgress.overallProgress,
        finalQuiz: finalQuiz
          ? {
              ...finalQuiz.toObject(),
              requiredPassPercentage: course.requiredCompletionPercentage,
              isCompleted: courseProgress.isCourseFinalQuizPassed,
              quizAttempts: courseProgress.finalQuizAttempts,
            }
          : null,
      },
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

async function submitFinalQuiz(req, res) {
  try {
    const student = req.user;
    const { courseId } = req.params;
    const { userAnswers } = req.body;

    const course = await Course.findOne({ courseId }).populate(
      "lectures instructor"
    );

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

    if (courseProgress.finalQuizAttemptLeft <= 0) {
      return res.status(400).json({
        success: false,
        message: "You have exhausted all attempts for the final quiz",
      });
    }

    if (courseProgress.overallProgress !== 100) {
      return res.status(400).json({
        success: false,
        message: "You need to complete all lectures first",
      });
    }

    const finalQuiz = await FinalQuiz.findOne({ course: course._id }).populate(
      "mcqs"
    );

    if (!finalQuiz) {
      return res.status(404).json({
        success: false,
        message: "Final quiz not found",
      });
    }

    const mcqs = finalQuiz.mcqs;

    for (let i = 0; i < mcqs.length; i++) {
      if (!Object.keys(userAnswers).includes(mcqs[i]._id.toString())) {
        return res.status(400).json({
          success: false,
          message: "Please make sure you have answered all questions",
        });
      }
    }

    let correctAnswers = 0;

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

    const percentage = Math.round((correctAnswers / mcqs.length) * 100);

    const isPassed = percentage >= course.requiredCompletionPercentage;
    let certificateResult = null;
    if (isPassed) {
      const quizAttempt = await QuizAttempt.create({
        student: student.id,
        course: course._id,
        mcqResponses: mcqs.map((mcq, index) => ({
          mcq: mcq._id,
          selectedOption: {
            text: mcq.options[userAnswers[mcq._id]],
            isCorrect: mcq.correctOption === userAnswers[mcq._id],
          },
        })),
        score: Math.round((correctAnswers / mcqs.length) * 100),
        totalQuestions: mcqs.length,
        passingScore: course.requiredCompletionPercentage,
        isPassed,
      });

      await CourseProgress.findOneAndUpdate(
        { _id: courseProgress._id },
        {
          isCourseFinalQuizPassed: true,
          $push: { finalQuizAttempts: quizAttempt._id },
        }
      );

      certificateResult = await CourseCertification.generateCertificate(
        student,
        course,
        quizAttempt
      );
    }

    courseProgress.finalQuizAttemptLeft -= 1;
    await courseProgress.save();

    const response = {
      success: true,
      data: {
        correctAnswers,
        totalQuestions: mcqs.length,
        percentage,
        isPassed,
      },
    };

    if (certificateResult && certificateResult.success) {
      response.data.certificate = {
        certificateId: certificateResult.certificateId,
        message: certificateResult.message,
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function getEnrolledCourses(req, res) {
  try {
    const student = req.user;

    const courses = await User.findById(student.id)
      .select("purchasedCourses")
      .populate({
        path: "purchasedCourses",
        populate: {
          path: "instructor",
          select: "name email username profilePic",
        },
        select:
          "title description language instructor minimumSkill thumbnail courseId -_id",
      });

    return res.status(200).json({
      success: true,
      data: courses.purchasedCourses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function getCartCourses(req, res) {
  try {
    const student = req.user;

    const courses = await User.findById(student.id)
      .select("cart")
      .populate({
        path: "cart",
        populate: {
          path: "instructor",

          select: "name email username profilePic",
        },
        select:
          "title description language price instructor minimumSkill thumbnail courseId -_id",
      });

    return res.status(200).json({
      success: true,
      data: courses.cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function getCertificates(req, res) {
  try {
    const student = req.user;

    const certificates = await CourseCertification.find({
      user: student.id,
    })
      .select("course status certificateId createdAt -_id")
      .populate({
        path: "course",
        select: "title courseId thumbnail -_id",
      });

    return res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function getPaymentDetails(req, res) {
  try {
    const student = req.user;

    const paymentDetails = await User.findById(student.id)
      .select("paymentHistory -_id")
      .populate({
        path: "paymentHistory",
        populate: {
          path: "course",
          select: "title courseId thumbnail -_id",
        },
        select:
          "amount status createdAt paymentMethod  razorpay_payment_id -_id",
      });

    return res.status(200).json({
      success: true,
      data: paymentDetails.paymentHistory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function getProgress(req, res) {
  try {
    const student = req.user;

    const courseProgress = await CourseProgress.find({
      student: student.id,
    })
      .select(
        "overallProgress isCourseFinalQuizPassed lectureProgress createdAt updatedAt"
      )
      .populate({
        path: "course",
        select: "title courseId",
      })
      .populate({
        path: "lectureProgress.lecture",
        select: "title lectureId isCompleted isUnlocked quizAttempts",
      });

    return res.status(200).json({
      success: true,
      data: courseProgress,
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
  populateReplies,
  submitFinalQuiz,
  getEnrolledCourses,
  getCartCourses,
  getCertificates,
  getPaymentDetails,
  getProgress,
};
