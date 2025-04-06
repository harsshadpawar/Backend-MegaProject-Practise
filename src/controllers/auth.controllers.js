import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validate } from "../middlewares/validator.middleware.js";
//import { sendMail } from "../utils/mail.js";
import { AvailableUserRoles } from "../utils/constants.js";
import { ApiError } from "../utils/api-error.js";

const registerUser = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { email, username, password, role, fullname } = req.body;
    const roleSelected = AvailableUserRoles.MEMBER;
    const user = await User.create({
      fullname,
      email,
      username,
      password,
      role: role || roleSelected,
    });
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    );
    res.status(201).json({
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      accessToken: token,
      message: "User registered successfully",
    });
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
      throw new ApiError(
        401,
        "Email is not verified. Please verify your email before logging in.",
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ApiError(400, "Invalid password.");
    }

    const token = jwt.sign(
      {
        id: user._id,
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

/*
const logoutUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});
const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});
*/

export { registerUser, loginUser };
