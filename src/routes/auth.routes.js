import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
} from "../controllers/auth.controllers.js";

import { validate } from "../middlewares/validator.middleware.js";

import {
  userRegisterValidator,
  userLoginValidator,
} from "../validators/index.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").get(userLoginValidator(), validate, loginUser);
router.route("/logout").get(logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/verify-email").get(verifyEmail);
router.route("/resend-verification").post(resendEmailVerification);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
