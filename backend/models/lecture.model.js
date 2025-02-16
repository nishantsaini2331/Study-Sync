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

const Lecture = mongoose.model("Lecture", lectureSchema);
module.exports = Lecture;
