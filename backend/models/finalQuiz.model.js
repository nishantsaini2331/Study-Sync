const mongoose = require("mongoose");

const finalQuizSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

const FinalQuiz = mongoose.model("FinalQuiz", finalQuizSchema);

module.exports = FinalQuiz;
