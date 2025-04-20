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

// Router imports - import each router only once
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount routers
app.use("/api/v1/", healthCheckRouter);
app.use("/api/v1/users", authRouter); // Mount the auth router once
app.use("/api/v1/projects", projectRouter);

export default app;
