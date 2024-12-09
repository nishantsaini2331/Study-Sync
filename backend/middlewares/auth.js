const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/dotenv");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const admin = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const instructor = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role !== "instructor") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const student = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role !== "student") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { auth, admin, instructor, student };
