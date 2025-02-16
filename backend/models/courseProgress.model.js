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
  },
  { timestamps: true }
);


// Method to update lecture progress
courseProgressSchema.methods.updateLectureProgress = async function (
  lectureId,
  quizAttempt
) {
  // Find or create lecture progress
  let lectureProgressItem = this.lectureProgress.find(
    (progress) => progress.lecture.toString() === lectureId.toString()
  );

  if (!lectureProgressItem) {
    lectureProgressItem = {
      lecture: lectureId,
      quizAttempts: [],
      isUnlocked: false,
      isCompleted: false,
    };
    this.lectureProgress.push(lectureProgressItem);
  }

  // Add quiz attempt
  lectureProgressItem.quizAttempts.push(quizAttempt._id);

  // Check if quiz is passed
  if (quizAttempt.isPassed) {
    lectureProgressItem.isUnlocked = true;
    lectureProgressItem.isCompleted = true;

    // Add to completed lectures if not already there
    if (
      !this.completedLectures.some(
        (id) => id.toString() === lectureId.toString()
      )
    ) {
      this.completedLectures.push(lectureId);
    }
  }

  // Recalculate overall progress
  this.calculateOverallProgress();

  await this.save();
  return this;
};

// Method to calculate overall course progress
courseProgressSchema.methods.calculateOverallProgress = function () {
  if (this.lectureProgress.length === 0) return 0;

  const completedLecturesCount = this.lectureProgress.filter(
    (progress) => progress.isCompleted
  ).length;

  this.overallProgress = Math.round(
    (completedLecturesCount / this.lectureProgress.length) * 100
  );

  return this.overallProgress;
};

// Method to unlock next lecture
courseProgressSchema.methods.unlockNextLecture = async function (
  currentLectureId
) {
  const course = await mongoose
    .model("Course")
    .findById(this.course)
    .populate("lectures");
  const lectures = course.lectures.sort((a, b) => a.order - b.order);

  const currentIndex = lectures.findIndex(
    (lecture) => lecture._id.toString() === currentLectureId.toString()
  );

  if (currentIndex !== -1 && currentIndex + 1 < lectures.length) {
    const nextLecture = lectures[currentIndex + 1];

    let nextLectureProgress = this.lectureProgress.find(
      (progress) => progress.lecture.toString() === nextLecture._id.toString()
    );

    if (!nextLectureProgress) {
      this.lectureProgress.push({
        lecture: nextLecture._id,
        isUnlocked: true,
        quizAttempts: [],
        isCompleted: false,
      });
    } else {
      nextLectureProgress.isUnlocked = true;
    }

    await this.save();
  }
};

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);
module.exports = CourseProgress;
