const express = require("express");
const dbConnect = require("./config/dbConnect");
const cors = require("cors");
const { PORT } = require("./config/dotenv");
const userRoute = require("./routes/user.route");
const courseRoute = require("./routes/course.route");
const lectureRoute = require("./routes/lecture.route");
const finalQuizRoute = require("./routes/finalQuiz.route");
const courseReviewRoute = require("./routes/courseReview.route");
const categoryRoute = require("./routes/category.route");
const app = express();
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // Allows cookies to be sent
  })
);
app.use(cookieParser());
app.use(express.json());

const port = PORT || 3000;

app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/lecture", lectureRoute);
app.use("/api/v1/final-quiz", finalQuizRoute);
app.use("/api/v1/course-review", courseReviewRoute);
app.use("/api/v1/category", categoryRoute);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  dbConnect();
  console.log("Server is running on port 3000");
});
