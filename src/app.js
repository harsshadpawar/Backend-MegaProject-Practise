import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This will point to /your/project/root/public/images
const uploadDir = path.join(__dirname, "../../public/images");

console.log("Upload directory path:", uploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js";
import userRegister from "./routes/auth.routes.js";
import userLogin from "./routes/auth.routes.js";
import logoutUser from "./routes/auth.routes.js";
import getCurrentUser from "./routes/auth.routes.js";
import verifyEmail from "./routes/auth.routes.js";
import resendEmailVerification from "./routes/auth.routes.js";
import refreshAccessToken from "./routes/auth.routes.js";
import forgotPasswordRequest from "./routes/auth.routes.js";
import resetForgottenPassword from "./routes/auth.routes.js";
import changeCurrentPassword from "./routes/auth.routes.js";
<<<<<<< HEAD
import projectRouter from "./routes/project.routes.js";
=======
>>>>>>> main

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1/", healthCheckRouter);
app.use("/api/v1/", getCurrentUser);
app.use("/api/v1/users", userRegister);
app.use("/api/v1/users", userLogin);
app.use("/api/v1/users", logoutUser);
app.use("/api/v1/users", verifyEmail);
app.use("/api/v1/users", resendEmailVerification);
app.use("/api/v1/users", refreshAccessToken);
app.use("/api/v1/users", forgotPasswordRequest);
app.use("/api/v1/users", resetForgottenPassword);
app.use("/api/v1/users", changeCurrentPassword);
<<<<<<< HEAD
app.use("/api/v1/projects", projectRouter);
=======
>>>>>>> main

export default app;
