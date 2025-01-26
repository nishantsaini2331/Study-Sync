const mongoose = require("mongoose");

const instructorOnBoardFromSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [
      {
        questionText: { type: String, required: true }, // Question text
        selectedOption: { type: String, required: true }, // User's selected answer
        options: { type: [String], required: true }, // Options for the question
      },
    ],
  },
  {
    timestamps: true,
  }
);

const InstructorOnBoardForm = mongoose.model(
  "InstructorOnBoardForm",
  instructorOnBoardFromSchema
);

module.exports = InstructorOnBoardForm;
