import express, { Application } from "express";
import cookieParser from "cookie-parser";
import expressupload from "express-fileupload";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import configs from "./config/configs.js";

const app: Application = express();

app.use(helmet());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(expressupload());

// Global Rate Limiter
app.use(apiLimiter);

const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4000",
    "http://127.0.0.1:4000",
    "http://localhost:5000",
    "http://127.0.0.1:5000"
];

// Add production URL if available
if (configs.PRODUCTION_URL) {
    allowedOrigins.push(configs.PRODUCTION_URL);
}

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Cache-Control", "Pragma"],
    }),
);

// Routes
app.use("/api/auth", routes.authRouter);
app.use("/api/user", routes.userRouter);
app.use("/api/onboarding", routes.onboardingRouter);
app.use("/api/counselors", routes.counselorRouter);
app.use("/api/scholarships", routes.scholarshipRouter);
app.use("/api/assessment", routes.assessmentRouter);
app.use("/api/notifications", routes.notificationRouter);
app.use("/api/videos", routes.videoRouter);
app.use("/api/learning-path", routes.learningPathRouter);
app.use("/api/chat", routes.chatRouter);
// Health Check
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

// Error Handler (must be last)
app.use(errorHandler);

export default app;