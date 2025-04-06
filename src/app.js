import express from "express";

const app = express();

//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js";
import userRegister from "./routes/auth.routes.js";
import userLogin from "./routes/auth.routes.js";

app.use(express.json());
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/register", userRegister);
app.use("/api/v1/login", userLogin);

export default app;
