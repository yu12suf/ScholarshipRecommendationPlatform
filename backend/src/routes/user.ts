import { Router } from "express";
const router = Router();

// Define user-related routes here
router.get("/", (req, res) => {
    res.send("User route is working!");
});
export  default router;




