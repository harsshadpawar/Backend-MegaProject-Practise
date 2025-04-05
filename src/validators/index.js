import { body } from "express-validator";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long")
      .isLength({ max: 13 })
      .withMessage("Username must be at most 13 characters long"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .isStrongPassword()
      .withMessage("Password is weak"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email").isEmail().withMessage("Email is invalid"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .notEmpty()
      .withMessage("Password is required"),
  ];
};

export { userRegisterValidator, userLoginValidator };
