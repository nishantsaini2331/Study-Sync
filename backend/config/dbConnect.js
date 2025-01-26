const mongoose = require("mongoose");
const { MONGO_URI } = require("./dotenv");

const dbConnect = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection failed");
  }
};

module.exports = dbConnect;
