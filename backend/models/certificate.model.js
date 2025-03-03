const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

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
    learnerName: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    instructorName: {
      type: String,
      required: true,
    },
    certificateId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
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

courseCertificationSchema.statics.generateCertificate = async function (
  student,
  course,
  quizAttempt
) {
  try {
    const existingCertificate = await this.findOne({
      user: student.id,
      course: course._id,
    });

    if (existingCertificate) {
      return {
        success: false,
        message: "Certificate already generated",
        certificateId: existingCertificate.certificateId,
      };
    }

    const newCertificate = await this.create({
      user: student.id,
      course: course._id,
      learnerName: student.name,
      courseName: course.title,
      instructorName: course.instructor.name,
      finalQuizScore: quizAttempt.score,
      courseCompletionDate: quizAttempt.createdAt,
    });

    return {
      success: true,
      message: "Certificate generated successfully",
      certificateId: newCertificate.certificateId,
      certificate: newCertificate,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

courseCertificationSchema.methods.revokeCertificate = async function () {
  this.status = "revoked";
  await this.save();
  return {
    success: true,
    message: "Certificate has been revoked",
  };
};

courseCertificationSchema.methods.verifyCertificate = function () {
  return {
    isValid: this.status === "issued",
    certificateId: this.certificateId,
    courseName: this.courseName,
    learnerName: this.learnerName,
    issueDate: this.issueDate,
    status: this.status,
  };
};

const CourseCertification = mongoose.model(
  "CourseCertification",
  courseCertificationSchema
);

module.exports = CourseCertification;
