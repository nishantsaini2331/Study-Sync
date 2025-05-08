const mongoose = require("mongoose");

const homePageSchema = new mongoose.Schema(
  {
    courseCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    featuredCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    testimonials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ReviewAndRating",
      },
    ],
  },
  {
    timestamps: true,
  }
);
const HomePage = mongoose.model("HomePage", homePageSchema);

module.exports = HomePage;
