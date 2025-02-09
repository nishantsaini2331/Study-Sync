const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/dotenv");

async function auth(req, res, next) {
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
}

async function admin(req, res, next) {
  try {
    const user = req.user;
    //role is an array of roles

    if (!user.roles.includes("admin")) {
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
}

async function instructor(req, res, next) {
  try {
    const user = req.user;

    if (!user.roles.includes("instructor")) {
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
}

async function student(req, res, next) {
  try {
    const user = req.user;

    if (!user.roles.includes("student")) {
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
}

function isInstructorOrAdmin(req, res, next) {
  if (
    req.user.roles.includes("instructor") ||
    req.user.roles.includes("admin")
  ) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Not authorized." });
  }
}

module.exports = { auth, admin, instructor, student, isInstructorOrAdmin };
