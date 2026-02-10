export const errorHandler = (error, req, res, next) => {
    console.error("Error:", {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
    });
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
};
//# sourceMappingURL=errorHandler.js.map