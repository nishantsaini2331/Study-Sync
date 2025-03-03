const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lectureProgress: [
      {
        lecture: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Lecture",
          required: true,
        },
        quizAttempts: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "QuizAttempt",
          },
        ],
        isUnlocked: {
          type: Boolean,
          default: false,
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    currentLecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCourseFinalQuizPassed: {
      type: Boolean,
      default: false,
    },

    finalQuizAttempts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuizAttempt",
      },
    ],
  },
  { timestamps: true }
);

courseProgressSchema.methods.updateLectureProgress = async function (
  lectureId,
  quizAttempt
) {
  const lectureProgress = this.lectureProgress.find(
    (progress) => progress.lecture.toString() === lectureId.toString()
  );

  if (!lectureProgress) {
    return;
  }

  if (quizAttempt) {
    lectureProgress.quizAttempts.push(quizAttempt._id);
  }

  lectureProgress.isCompleted = true;

  await this.save();

  this.calculateOverallProgress();
};

courseProgressSchema.methods.calculateOverallProgress = async function () {
  const totalLectures = this.lectureProgress.length;

  if (totalLectures === 0) {
    this.overallProgress = 0;
    return;
  }

  const completedLectures = this.lectureProgress.filter(
    (progress) => progress.isCompleted
  ).length;

  this.overallProgress = (completedLectures / totalLectures) * 100;

  if (this.overallProgress < 100) {
    this.unlockNextLecture(this.currentLecture);
  }

  await this.save();
};

courseProgressSchema.methods.unlockNextLecture = async function (
  currentLectureId
) {
  const currentLectureIndex = this.lectureProgress.findIndex(
    (progress) => progress.lecture.toString() === currentLectureId.toString()
  );

  if (currentLectureIndex === this.lectureProgress.length - 1) {
    return;
  }

  this.lectureProgress[currentLectureIndex + 1].isUnlocked = true;
  this.currentLecture = this.lectureProgress[currentLectureIndex + 1].lecture;

  await this.save();
};

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);
module.exports = CourseProgress;
