const express = require("express");
const dbConnect = require("./config/dbConnect");
const cors = require("cors");
const { PORT } = require("./config/dotenv");
const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const port = PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  dbConnect();
  console.log("Server is running on port 3000");
});
