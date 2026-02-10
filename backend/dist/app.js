import express from "express";
import cookieParser from "cookie-parser";
import expressupload from "express-fileupload";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
const app = express();
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(expressupload());
// Global Rate Limiter
app.use(apiLimiter);
const allowedOrigins = ["http://localhost:3000", "http://localhost:4000", "http://127.0.0.1:4000"];
// Add production URL if available
if (process.env.PRODUCTION_URL) {
    allowedOrigins.push(process.env.PRODUCTION_URL);
}
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));
app.use(bodyParser.json({ limit: "1mb" })); //request size limit set to 1 MB
// Routes
app.use("/api/auth", routes.authRouter);
app.use("/api/user", routes.userRouter);
// Health Check
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});
// Error Handler (must be last)
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map