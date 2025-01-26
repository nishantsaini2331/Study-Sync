const mongoose = require("mongoose");

const courseCertificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    finalQuizScore: {
      type: Number,
      required: true,
    },
    courseCompletionDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["issued", "revoked"],
      default: "issued",
    },
  },
  { timestamps: true }
);

const CourseCertification = mongoose.model(
  "CourseCertification",
  courseCertificationSchema
);
module.exports = CourseCertification;
