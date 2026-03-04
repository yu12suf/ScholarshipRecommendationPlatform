import { Router } from "express";
import { AssessmentController } from "../controller/AssessmentController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { UserRole } from "../types/userTypes.js";

const assessmentRouter = Router();

// All assessment routes require authenticated student
assessmentRouter.use(authenticate, authorize(UserRole.STUDENT));

assessmentRouter.post("/generate", AssessmentController.generate);
assessmentRouter.post("/submit", AssessmentController.submit);
assessmentRouter.get("/result/:test_id", AssessmentController.getResult);

export default assessmentRouter;
