const express = require("express");
const dbConnect = require("./config/dbConnect");
const cors = require("cors");
const { PORT } = require("./config/dotenv");
const userRoute = require("./routes/user.route");
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  dbConnect();
  console.log("Server is running on port 3000");
});
