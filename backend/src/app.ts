import express, { Application } from "express";
import cookieParser from "cookie-parser";
import expressupload from "express-fileupload";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";

import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import configs from "./config/configs.js";

const app: Application = express();

// Create uploads directory if it doesn't exist
import fs from "fs";
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Temporarily disable helmet for testing
// app.use(helmet());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(expressupload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    abortOnLimit: false,
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Global Rate Limiter (temporarily disabled)
app.use(apiLimiter);

// CORS config - allow all origins with explicit settings
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control', 'Pragma', 'Content-Length', 'Content-Transfer-Encoding'],
    exposedHeaders: ['Content-Length', 'Content-Disposition'],
    credentials: false,
}));

// Force CORS headers on all responses
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Cache-Control, Pragma");
    res.header("Access-Control-Max-Age", "3600");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

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
app.use("/api/admin", routes.adminRouter);
app.use("/api/community", routes.communityRouter);
// Health Check
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

// Error Handler (must be last)
app.use(errorHandler);

export default app;