const express = require("express");
const dbConnect = require("./config/dbConnect");
const cors = require("cors");
const { PORT, FRONTEND_URL } = require("./config/dotenv");
const userRoute = require("./routes/user.route");
const courseRoute = require("./routes/course.route");
const lectureRoute = require("./routes/lecture.route");
const finalQuizRoute = require("./routes/finalQuiz.route");
const courseVerifyRoute = require("./routes/courseVerify.route");
const categoryRoute = require("./routes/category.route");
const paymentRoute = require("./routes/payment.route");
const studentRoute = require("./routes/student.route");
const instructorRoute = require("./routes/instructor.route");
const reviewAndRatingRoute = require("./routes/reviewAndRating.route");
const commentRoute = require("./routes/comment.route");
const certificateRoute = require("./routes/certificate.route");
const cartRoute = require("./routes/cart.route");
const requestRoute = require("./routes/request.route");
const adminRoute = require("./routes/admin.route");
const homePageRoute = require("./routes/homePage.route");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL, // Your frontend URL
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
app.use("/api/v1/course-verify", courseVerifyRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/student", studentRoute);
app.use("/api/v1/instructor", instructorRoute);
app.use("/api/v1/review-and-rating", reviewAndRatingRoute);
app.use("/api/v1/comment", commentRoute);
app.use("/api/v1/certificate", certificateRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/request", requestRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/home-page", homePageRoute);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  dbConnect();
  console.log("Server is running on port 3000");
});
