const { createTransport } = require("nodemailer");
const {
  NODEMAILER_USER,
  NODEMAILER_PASSWORD,
  NODEMAILER_PORT,
  NODEMAILER_HOST,
} = require("../config/dotenv");

const transporter = createTransport({
  host: NODEMAILER_HOST,
  port: NODEMAILER_PORT,
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PASSWORD,
  },
});

module.exports = transporter;
