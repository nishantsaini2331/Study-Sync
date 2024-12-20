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
    options: [
      {
        text: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
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
