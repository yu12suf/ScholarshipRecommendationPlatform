import express, { Application } from "express";
import cookieParser from "cookie-parser";
import expressupload from "express-fileupload";
import cors from "cors";
import helmet from "helmet";

import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import configs from "./config/configs.js";

const app: Application = express();

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(expressupload());

// Global Rate Limiter
app.use(apiLimiter);

const allowedOrigins = ["http://localhost:3000", "http://localhost:4000", "http://127.0.0.1:4000"];

// Add production URL if available
if (configs.PRODUCTION_URL) {
    allowedOrigins.push(configs.PRODUCTION_URL);
}

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
);

// Routes
app.use("/api/auth", routes.authRouter);
app.use("/api/user", routes.userRouter);
app.use("/api/onboarding", routes.onboardingRouter);
app.use("/api/scholarships", routes.scholarshipRouter);
app.use("/api/assessment", routes.assessmentRouter);
app.use("/api/notifications", routes.notificationRouter);
app.use("/api/videos", routes.videoRouter);
app.use("/api/learning-path", routes.learningPathRouter);

// Health Check
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

// Error Handler (must be last)
app.use(errorHandler);

export default app;