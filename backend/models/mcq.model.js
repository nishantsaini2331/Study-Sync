const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema(
  {
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
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
    // passingPercentage: {
    //   type: Number,
    //   default: 60,
    //   min: 0,
    //   max: 100,
    // },
  },
  { timestamps: true }
);

const MCQ = mongoose.model("MCQ", mcqSchema);

module.exports = MCQ;
