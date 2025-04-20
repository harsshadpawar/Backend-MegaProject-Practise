import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ms from "ms";
import fs from "fs";
import path from "path";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { validate } from "../middlewares/validator.middleware.js";
//import { sendMail } from "../utils/mail.js";
import { AvailableUserRoles } from "../utils/constants.js";
import { ApiError } from "../utils/api-error.js";
import crypto from "crypto";
import {
  sendMail,
  emailVerificationMailGenContent,
  resendemailVerificationMailGenContent,
  forgotPasswordMailGenContent,
} from "../utils/mail.js";

import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const registerUser = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { email, username, password, fullname } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ApiError(
        409,
        existingUser.email === email
          ? "Email already registered"
          : "Username already taken",
      );
    }

    // In your registerUser function:
    let avatarData = undefined;
    if (req.file) {
      // Create avatar object that matches your schema
      avatarData = {
        url: `/images/${path.basename(req.file.path)}`,
        localpath: req.file.path,
      };
    }

    //const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationToken = crypto
      .createHmac("sha256", process.env.EMAIL_VERIFICATION_TOKEN_SECRET)
      .update(crypto.randomBytes(32))
      .digest("hex");

    //const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const emailVerificationExpiry = new Date(
      Date.now() + ms(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY),
    );

    // Create new user with avatar if available
    const user = await User.create({
      fullname,
      email,
      username,
      password,
      avatar: avatarData,
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpiry,
      role: AvailableUserRoles.MEMBER,
    });

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    );

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;

    try {
      await sendMail({
        email: user.email,
        subject: "Verify your email",
        MailGenContent: emailVerificationMailGenContent(
          username,
          verificationUrl,
        ),
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    const userWithoutSensitiveInfo = {
      id: user._id,
      email: user.email,
      username: user.username,
      fullname: user.fullname,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
    };

    res.status(201).json({
      success: true,
      user: userWithoutSensitiveInfo,
      accessToken,
      message:
        "User registered successfully. Please check your email to verify your account.",
    });
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const token = req.query.token;

    if (!token) {
      throw new ApiError(400, "Email verification token is required");
    }

    try {
      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpiry: { $gt: Date.now() },
      });

      if (!user) {
        throw new ApiError(400, "Invalid or expired verification token");
      }

      if (user.isEmailVerified) {
        return res.status(200).json({
          success: true,
          message: "Email already verified",
        });
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpiry = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      throw new ApiError(401, error?.message || "Email verification failed");
    }
  });
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: "Email is already verified",
      });
    }

    //const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationToken = crypto
      .createHmac("sha256", process.env.EMAIL_VERIFICATION_TOKEN_SECRET)
      .update(crypto.randomBytes(32))
      .digest("hex");
    //const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const emailVerificationExpiry = new Date(
      Date.now() + ms(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY),
    );

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpiry = emailVerificationExpiry;
    await user.save();

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;

    try {
      await sendMail({
        email: user.email,
        subject: "Verify your email",
        MailGenContent: resendemailVerificationMailGenContent(
          user.username,
          verificationUrl,
        ),
      });
      res.status(200).json({
        success: true,
        message: "Verification email resent successfully",
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new ApiError(500, "Failed to send verification email");
    }
  });
});

const loginUser = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { username, email, password } = req.body;
    let user;

    if (!email && !username) {
      throw new ApiError(422, "Either email or username is required.");
    }

    if (email) {
      user = await User.findOne({ email });
    } else if (username) {
      user = await User.findOne({ username });
    }

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (!user.isEmailVerified) {
      throw new ApiError(403, "Email not verified. Please verify your email.");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ApiError(400, "Invalid password.");
    }

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    );
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "strict",
  });
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      throw new ApiError(400, "Username/email and password are required");
    }

    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (username) {
      user = await User.findOne({ username });
    }

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (!user.isEmailVerified) {
      throw new ApiError(403, "Email not verified. Please verify your email.");
    }

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token is required");
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );

      const user = await User.findOne({ _id: decoded.id });

      if (!user) {
        throw new ApiError(401, "Invalid refresh token");
      }

      const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
      );

      const newRefreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
      );

      user.refreshToken = newRefreshToken;
      await user.save();

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 10 * 24 * 60 * 60 * 1000,
      };
      res.cookie("refreshToken", newRefreshToken, cookieOptions);

      res.status(200).json({
        success: true,
        accessToken,
        message: "Access token refreshed successfully",
      });
    } catch (error) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
  });
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

<<<<<<< HEAD
    // If user doesn't exist, still return success to avoid revealing email existence
=======
>>>>>>> main
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If your email is registered, you will receive a password reset link",
      });
    }

<<<<<<< HEAD
    // Check if a valid reset token already exists and is not expired
    // and was created recently (rate limiting)
    if (
      user.forgotPasswordToken &&
=======
    if (
>>>>>>> main
      user.forgotPasswordExpiry &&
      user.forgotPasswordExpiry > Date.now() &&
      user.forgotPasswordExpiry >
        new Date(Date.now() - ms(process.env.FORGOT_PASSWORD_TOKEN_EXPIRY))
    ) {
      return res.status(429).json({
        success: false,
        message:
          "A reset link was recently sent. Please wait before requesting another.",
      });
    }

<<<<<<< HEAD
    // Generate new token
=======
>>>>>>> main
    const forgotPasswordToken = crypto
      .createHmac("sha256", process.env.FORGOT_PASSWORD_TOKEN_SECRET)
      .update(crypto.randomBytes(32))
      .digest("hex");
<<<<<<< HEAD

=======
>>>>>>> main
    const forgotPasswordExpiry = new Date(
      Date.now() + ms(process.env.FORGOT_PASSWORD_TOKEN_EXPIRY),
    );

    user.forgotPasswordToken = forgotPasswordToken;
    user.forgotPasswordExpiry = forgotPasswordExpiry;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${forgotPasswordToken}`;

    try {
      await sendMail({
        email: user.email,
        subject: "Reset your password",
        MailGenContent: forgotPasswordMailGenContent(user.username, resetUrl),
      });

      res.status(200).json({
        success: true,
        message:
          "If your email is registered, you will receive a password reset link",
      });
    } catch (error) {
<<<<<<< HEAD
      // If email fails, clean up the token
=======
>>>>>>> main
      user.forgotPasswordToken = undefined;
      user.forgotPasswordExpiry = undefined;
      await user.save();

      console.error("Failed to send reset email:", error);
      throw new ApiError(500, "Failed to send password reset email");
    }
  });
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ApiError(400, "Token and new password are required");
    }

    const user = await User.findOne({
      forgotPasswordToken: token,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, "Invalid or expired token");
    }

    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  });
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { currentPassword, newPassword } = req.body;
<<<<<<< HEAD
    const userId = req.user.id;
=======
    const userId = req.user.id; // From auth middleware
>>>>>>> main

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "Current password and new password are required");
    }

<<<<<<< HEAD
=======
    // Get user with password
>>>>>>> main
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

<<<<<<< HEAD
=======
    // Verify current password
>>>>>>> main
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ApiError(401, "Current password is incorrect");
    }

<<<<<<< HEAD
    user.password = newPassword;
    await user.save();

=======
    // Update password
    user.password = newPassword; // Assuming password hashing happens in pre-save hook
    await user.save();

    // Optional: Clear any existing sessions
>>>>>>> main
    user.refreshToken = undefined;
    await user.save();

    res.clearCookie("token");
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  });
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgottenPassword,
  changeCurrentPassword,
};
