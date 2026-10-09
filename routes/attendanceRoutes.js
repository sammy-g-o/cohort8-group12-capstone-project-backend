import express from "express";
import { checkIn } from "../controllers/attendanceController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/checkIn", authenticate, checkIn);

export default router;
