import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { getMyTasks } from "../controllers/taskController.js";

export const userRouter = express.Router();

// A volunteer's own assigned tasks
userRouter.get("/me/tasks", authenticate, authorize("volunteer"), getMyTasks);