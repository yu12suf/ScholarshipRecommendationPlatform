import express, { Application, Request, Response, NextFunction } from "express";


// import dashboardRoutes from "./dashboard/routers";
// import { errorHandler } from "./middlewares/ErrorHandler";
import routes from "./routes/index.js";

import cookieParser from "cookie-parser";
import expressupload from "express-fileupload";
import cors from "cors";
// import { rateLimiterMiddleware } from "./middlewares/rateLimiter";
import helmet from "helmet";
import bodyParser from "body-parser";
// import { setupSwagger } from "./config/swagger";

const app: Application = express();


app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(expressupload());
const allowedOrigins = ["http://localhost:4000", "http://localhost:4000", "http://127.0.0.1:4000"];

// Add production URL if available
if (process.env.PRODUCTION_URL) {
    allowedOrigins.push(process.env.PRODUCTION_URL);
}

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
);
app.use(bodyParser.json({ limit: "1mb" })); //request size limit set to 1 MB

app.use("/api/v1/user", routes.userRouter);
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

export default app;