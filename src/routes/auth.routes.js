import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";

import {
  userRegisterValidator,
  userLoginValidator,
} from "../validators/index.js";

const router = Router();

router.route("/").post(userRegisterValidator(), validate, registerUser);
router.route("/").get(userLoginValidator(), validate, loginUser);

export default router;
