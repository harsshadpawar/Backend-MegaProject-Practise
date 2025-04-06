import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const logoutUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

export {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  resendVerificationEmail,
  refreshAccessToken,
  forgotPasswordRequest,
  changeCurrentPassword,
  getCurrentUser,
};
