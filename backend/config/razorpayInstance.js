const Razorpay = require("razorpay");
const { RAZORPAY_KEY_ID, RAZORPAY_SECRET } = require("./dotenv");

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_SECRET,
});

module.exports = razorpayInstance;
