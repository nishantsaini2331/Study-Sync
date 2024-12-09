const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  NODEMAILER_USER: process.env.NODEMAILER_USER,
  NODEMAILER_HOST: process.env.NODEMAILER_HOST,
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASS,
  NODEMAILER_PORT: process.env.NODEMAILER_PORT,
};
