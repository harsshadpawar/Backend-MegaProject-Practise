import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  uploadAvatar,
  handleMulterError,
} from "../middlewares/multer.middleware.js";
import {
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
} from "../controllers/auth.controllers.js";

import { validate } from "../middlewares/validator.middleware.js";

import {
  userRegisterValidator,
  userLoginValidator,
} from "../validators/index.js";

const router = Router();

//router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/register").post(
  uploadAvatar, // Step 1: Handle file upload
  handleMulterError, // Step 2: Handle upload errors
  (req, res, next) => {
    if (process.env.NODE_ENV === "development") {
      console.log("After multer, req.body:", req.body);
    }
    next();
  },
  userRegisterValidator(), // Step 3: Validate request body
  validate, // Step 4: Process validation results
  registerUser, // Step 5: Process registration
);

router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/verify-email").post(verifyEmail);
router.route("/resend-verification").post(resendEmailVerification);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(forgotPasswordRequest);
router.route("/reset-password").post(resetForgottenPassword);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

export default router;
