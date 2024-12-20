const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    minimumSkill: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    thumbnail: {
      type: String,
      default: null,
      required: true,
    },
    thumbnailId: {
      type: String,
      default: null,
      required: true,
    },
    previewVideo: {
      type: String,
      default: null,
      required: true,
    },
    previewVideoId: {
      type: String,
      default: null,
      required: true,
    },
    tags: {
      type: [String],
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      required: true,
    },
    totalDuration: {
      type: Number,
      required: true,
    },
    totalLectures: {
      type: Number,
      required: true,
    },
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    finalQuiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MCQ",
      default: null,
    },
    certificateTemplate: {
      type: String,
      default: "default-certificate.pdf",
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    requiredCompletionPercentage: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

// Method to check if a student can get course certificate
courseSchema.methods.canGetCertificate = async function (userId) {
  const courseProgress = await mongoose.model("CourseProgress").findOne({
    user: userId,
    course: this._id,
  });

  if (!courseProgress) return false;

  // Check overall progress
  const hasMetProgressRequirement =
    courseProgress.overallProgress >= this.requiredCompletionPercentage;

  // Check final quiz
  const finalQuizAttempt = await mongoose.model("QuizAttempt").findOne({
    user: userId,
    lecture: this.finalQuiz,
    isPassed: true,
  });

  return hasMetProgressRequirement && !!finalQuizAttempt;
};

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;