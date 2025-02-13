const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
    },

    roles: {
      type: [String],
      enum: ["instructor", "student", "admin"],
      default: ["student"],
    },

    purchasedCourse: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    createdCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    photoUrl: {
      type: String,
      default: "",
    },

    photoUrlId: {
      type: String,
      default: null,
    },

    socials: {
      youtube: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
      github: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
    },
    bio: {
      type: String,
      default: "",
    },
    headline: {
      type: String,
      default: "",
    },

    qualification: {
      type: String,
      enum: [
        "Secondary (10th Pass)",
        "Higher Secondary (12th Pass)",
        "Bachelors",
        "Masters",
        "PhD",
        "Other",
      ],
      default: "Other",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    googleAuth: {
      type: Boolean,
      default: false,
    },

    courseUploadedLimit: {
      type: Number,
      default: 2,
    },

    instructorOnBoardFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstructorOnBoardFrom",
      default: null,
    },

    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
