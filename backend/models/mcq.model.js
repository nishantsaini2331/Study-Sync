const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema(
  {
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      default: null,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
    correctOption: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const MCQ = mongoose.model("MCQ", mcqSchema);

module.exports = MCQ;
