import express from "express";
import cookieParser from "cookie-parser";

const app = express();

//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js";
import userRegister from "./routes/auth.routes.js";
import userLogin from "./routes/auth.routes.js";
import logoutUser from "./routes/auth.routes.js";
import getCurrentUser from "./routes/auth.routes.js";
import verifyEmail from "./routes/auth.routes.js";
import resendEmailVerification from "./routes/auth.routes.js";
import refreshAccessToken from "./routes/auth.routes.js";

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/", healthCheckRouter);
app.use("/api/v1/users", userRegister);
app.use("/api/v1/users", userLogin);
app.use("/api/v1/users", logoutUser);
app.use("/api/v1/users", verifyEmail);
app.use("/api/v1/users", resendEmailVerification);
app.use("/api/v1/users", refreshAccessToken);
app.use("/api/v1/", getCurrentUser);

export default app;
