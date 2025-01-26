const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    lectureId: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    videoId: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    mcqs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MCQ",
      },
    ],
    requiredPassPercentage: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },

    // isLocked: {
    //   type: Boolean,
    //   default: true,
    // },

    // prerequisites: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Lecture",
    //   },
    // ],
    duration: {
      type: Number, // duration in minutes
      required: true,
    },
    order: {
      type: Number,
      //   required: true,
    },
  },
  { timestamps: true }
);

// Middleware to automatically unlock the lecture if prerequisites are met
lectureSchema.methods.canUnlock = async function (userId) {
  // If no prerequisites, the lecture is unlocked
  if (!this.prerequisites || this.prerequisites.length === 0) {
    return true;
  }

  // Check if user has completed all prerequisite lectures
  const completedPrerequisites = await CourseProgress.findOne({
    user: userId,
    course: this.course,
    completedLectures: { $all: this.prerequisites },
  });

  return !!completedPrerequisites;
};

const Lecture = mongoose.model("Lecture", lectureSchema);
module.exports = Lecture;
