import express from "express";
import { checkIn } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/checkIn", checkIn);

export default router;
