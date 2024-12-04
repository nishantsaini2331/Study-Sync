const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CLODINARY_CLOUD_NAME: process.env.CLODINARY_CLOUD_NAME,
  CLODINARY_API_KEY: process.env.CLODINARY_API_KEY,
  CLODINARY_API_SECRET: process.env.CLODINARY_API_SECRET,
};
