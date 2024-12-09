const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const ShortUniqueId = require("short-unique-id");
const generateAuthToken = require("../utils/generateAuthToken");
const transporter = require("../utils/transporter");
const { NODEMAILER_USER } = require("../config/dotenv");
const { randomUUID } = new ShortUniqueId({ length: 6 });

const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const {
  uploadMedia,
  deleteMediaFromCloudinary,
} = require("../utils/cloudinary");

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

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

  const url = `http://localhost:5173/api/user/verify/${verifyToken}`;

  const message = {
    from: NODEMAILER_USER,
    to: user.email,
    subject: "Account Verification",
    text: `Click this link to verify your account: ${url}`,
  };
  const response = await transporter.sendMail(message);
}

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
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
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
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
      username,
      role,
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
};

const login = async (req, res) => {
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
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const googleAuth = async (req, res) => {
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
      name,
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
};

const logout = async (req, res) => {
  try {
    return res.status(200).clearCookie("token").json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    res.status(500).send();
  }
};

const getUser = async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(500).send();
  }
};

const updateUser = async (req, res) => {
  try {
    const updateFields = [
      "name",
      "email",
      "username",
      "photoUrl",
      "shortBio",
      "qualifications",
      "socials",
    ];

    const image = req.file;

    if (image) {
      const { secure_url, public_id } = await uploadMedia(
        `data:image/jpeg;base64,${image.buffer.toString("base64")}`
      );

      req.user.photoUrl = secure_url;
      req.user.photoUrlId = public_id;
    }

    updateFields.forEach((field) => {
      if (req.body[field]) {
        if (field === "socials" && typeof req.body.socials === "object") {
          req.user.socials = {
            ...req.user.socials,
            ...req.body.socials,
          };
        } else {
          req.user[field] = req.body[field];
        }
      }
    });

    if (req.body.password) {
      const saltRounds = 10;
      req.user.password = await bcrypt.hash(req.body.password, saltRounds);
    }

    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
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
};

module.exports = { register, login, logout, getUser, updateUser, deleteUser };
