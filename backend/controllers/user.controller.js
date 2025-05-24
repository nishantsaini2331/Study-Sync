const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const ShortUniqueId = require("short-unique-id");
const generateAuthToken = require("../utils/generateAuthToken");
const transporter = require("../utils/transporter");
const {
  NODEMAILER_USER,
  JWT_SECRET,
  FRONTEND_URL,
} = require("../config/dotenv");
const { randomUUID } = new ShortUniqueId({ length: 6 });
const jwt = require("jsonwebtoken");
const emailExistence = require("email-existence");

const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const {
  uploadMedia,
  deleteMediaFromCloudinary,
} = require("../utils/cloudinary");
const InstructorOnBoardForm = require("../models/instructorOnBoardFromSchema");

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const crypto = require("crypto");

// admin.initializeApp({
//     credential: admin.credential.cert({
//       type: FIREBASE_TYPE,
//       project_id: FIREBASE_PROJECT_ID,
//       private_key_id: FIREBASE_PRIVATE_KEY_ID,
//       private_key: FIREBASE_PRIVATE_KEY,
//       client_email: FIREBASE_CLIENT_EMAIL,
//       client_id: FIREBASE_CLIENT_ID,
//       auth_uri: FIREBASE_AUTH_URI,
//       token_uri: FIREBASE_TOKEN_URI,
//       auth_provider_x509_cert_url: FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
//       client_x509_cert_url: FIREBASE_CLIENT_X509_CERT_URL,
//       universe_domain: FIREBASE_UNIVERSAL_DOMAIN,
//     }),
//   });

async function sendVerificationEmail(user) {
  const verifyToken = await generateAuthToken(user);

  const url = `http://localhost:5173/verify-email/${verifyToken}`;
  const message = {
    from: "Study Sync",
    to: user.email,
    subject: "Account Verification",
    text: `Click this link to verify your account: ${url}`,
  };

  const response = await transporter.sendMail(message);
}

function validateSocialLinks(socials) {
  const patterns = {
    youtube:
      /^(https?:\/\/)?(www\.)?youtube\.com\/@[a-zA-Z0-9_-]+(\?[a-zA-Z0-9_=&-]+)?$/,
    linkedin:
      /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(\/|[-a-zA-Z0-9_%]+\/?)?$/,
    github: /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
    website:
      /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}$/,
    twitter:
      /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]{1,15}\/?$/,
  };

  for (const [platform, url] of Object.entries(socials)) {
    if (!url || url.trim() === "") continue;

    if (!patterns[platform]) {
      return {
        isValid: false,
        message: `Unsupported social media platform: ${platform}`,
      };
    }

    if (!patterns[platform].test(url)) {
      return {
        isValid: false,
        message: `Invalid ${platform} URL format`,
      };
    }
  }

  return { isValid: true };
}

function checkEmailExistence(email) {
  return new Promise((resolve) => {
    emailExistence.check(email, (err, result) => {
      if (err) {
        resolve(false);
      } else {
        resolve(result);
      }
    });
  });
}

async function verifyEmail(req, res) {
  try {
    const { verificationToken } = req.params;
    const verifyToken = await jwt.verify(verificationToken, JWT_SECRET);

    if (!verifyToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid Token/Email expired",
      });
    }
    const { id } = verifyToken;
    const user = await User.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not exist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

async function register(req, res) {
  try {
    const { name, email, password, qualification } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email is invalid",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long, contain at least one number, one uppercase letter, one lowercase letter, and one special character",
      });
    }

    const isValid = await checkEmailExistence(email);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Email is invalid or does not exist",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      if (existingUser.googleAuth) {
        return res.status(400).json({
          success: false,
          message:
            "This email is already registered with Google, please login with Google",
        });
      }

      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      } else {
        sendVerificationEmail(existingUser);

        return res.status(400).json({
          success: false,
          message: "Please verify your email address",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const username = email.split("@")[0] + randomUUID();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      username: username.length > 20 ? username.slice(0, 20) : username,
      qualification,
    });

    sendVerificationEmail(user);

    res.status(201).json({
      success: true,
      message: "Please verify your email address to activate your account",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.googleAuth) {
      return res.status(400).json({
        success: false,
        message:
          "This email is registered with Google, please login with Google",
      });
    }

    if (!user.isVerified) {
      sendVerificationEmail(user);
      return res.status(400).json({
        success: false,
        message: "Please verify your email address",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = await generateAuthToken(user);

    res.cookie("token", token, {
      httpOnly: true, // Ensures the cookie is inaccessible to JavaScript
      secure: true, // Set to true if using HTTPS (use `false` in local dev)
      sameSite: "strict", // Adjust to 'lax' if strict causes issues
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function googleAuth(req, res) {
  try {
    const { accessToken } = req.body;

    const response = await getAuth().verifyIdToken(accessToken);

    const { email, name, photoUrl } = response;

    let user = await User.findOne({ email });

    if (user) {
      // already registered
      if (user.googleAuth) {
        let token = await generateAuthToken(user);

        return res
          .status(200)
          .cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
          })
          .json({
            success: true,
            message: "User logged in successfully",
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
            },
          });
      } else {
        return res.status(400).json({
          success: false,
          message:
            "This email is already registered with email and password, please login with email and password",
        });
      }
    }

    let newUser = await User.create({
      name: name,
      email,
      googleAuth: true,
      photoUrl,
      isVerified: true,
    });

    let token = await generateAuthToken(newUser);

    return res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      })
      .json({
        success: true,
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function logout(req, res) {
  try {
    return res.status(200).clearCookie("token").json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    res.status(500).send();
  }
}

async function getUser(req, res) {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select(
      "bio name photoUrl socials qualification headline username"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateUser(req, res) {
  try {
    const updateFields = [
      "name",
      "username",
      "photoUrl",
      "bio",
      "headline",
      "qualification",
      "socials",
    ];

    const image = req.file;

    const user = await User.findById(req.user.id);

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (req.body.username && !usernameRegex.test(req.body.username)) {
      return res.status(400).json({
        success: false,
        message:
          "Username must be 3-20 characters and can only contain letters, numbers, and underscores",
      });
    }

    const isUserExistWithUsername = await User.findOne({
      username: req.body.username,
    });

    if (isUserExistWithUsername && isUserExistWithUsername._id != req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    let socials;
    if (req.body.socials) {
      socials = JSON.parse(req.body.socials);
      const socialValidation = validateSocialLinks(socials);
      if (!socialValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: socialValidation.message,
        });
      }
    }

    if (image) {
      if (user.photoUrlId) {
        await deleteMediaFromCloudinary(user.photoUrlId);
      }
      const { secure_url, public_id } = await uploadMedia(
        `data:image/jpeg;base64,${image.buffer.toString("base64")}`
      );

      user.photoUrl = secure_url;
      user.photoUrlId = public_id;
    }

    updateFields.forEach((field) => {
      if (req.body[field]) {
        if (field === "socials" && typeof socials === "object") {
          user.socials = {
            ...user.socials,
            ...socials,
          };
        } else {
          user[field] = req.body[field];
        }
      }
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: user.name,
        username: user.username,
        photoUrl: user.photoUrl,
        bio: user.bio,
        headline: user.headline,
        qualification: user.qualification,
        socials: user.socials,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.photoUrlId) {
      await deleteMediaFromCloudinary(user.photoUrlId);
    }

    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function changePassword(req, res) {
  try {
    const { newPassword, currentPassword } = req.body;

    if (!newPassword || !currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const user = await User.findById(req.user.id);

    if (user.googleAuth) {
      return res.status(400).json({
        success: false,
        message: "Google authenticated users cannot change password directly",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long, contain at least one number, one uppercase letter, one lowercase letter, and one special character",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function onboard(req, res) {
  try {
    const { questions } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions must be provided." });
    }

    for (const question of questions) {
      if (
        !question.questionText ||
        !question.selectedOption ||
        !question.options
      ) {
        return res.status(400).json({
          message:
            "Each question must have text, a selected option, and options.",
        });
      }
    }

    const form = await InstructorOnBoardForm.create({ userId, questions });

    // await User.findByIdAndUpdate(
    //   userId,
    //   {
    //     instructorOnBoardFrom: form._id,
    //     roles: user.roles.includes("instructor")
    //       ? user.roles
    //       : [...user.roles, "instructor"],
    //   },
    //   { new: true }
    // );

    user.instructorOnBoardFrom = form._id;

    if (!user.roles.includes("instructor")) {
      user.roles.push("instructor");
    }
    await user.save();

    const token = await generateAuthToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "we love you to onboard as an instructor",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function fetchProfile(req, res) {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const user = await User.findOne({ username })
      .select(
        "bio name photoUrl socials qualification headline username createdCourses roles -_id"
      )
      .populate({
        path: "createdCourses",
        select: "title thumbnail description courseId -_id",
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return;
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If your email is registered, you will receive a password reset link",
      });
    }

    if (user.googleAuth) {
      return res.status(200).json({
        success: true,
        message:
          "If your email is registered, you will receive a password reset link",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset Request",
      html: `
          <h1>You requested a password reset</h1>
          <p>Please click the following link to reset your password:</p>
          <a href="${resetUrl}" target="_blank">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message:
        "If your email is registered, you will receive a password reset link",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing forgot password request",
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, password, and confirm password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.lastPasswordChange = new Date();

    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset Confirmation",
      html: `
          <h1>Your password has been reset successfully</h1>
          <p>If you didn't request this change, please contact support.</p>
        `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while resetting password",
    });
  }
}

async function verifyResetToken(req, res) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying reset token",
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  getUser,
  updateUser,
  deleteUser,
  verifyEmail,
  onboard,
  fetchProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyResetToken,
};
