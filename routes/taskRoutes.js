import {
  createTask,
  deleteTask,
  getAllTasks,
  getTask,
  updateTask,
  updateTaskStatus,
} from "../controllers/taskController.js";
import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

export const taskRouter = express.Router({ mergeParams: true });

taskRouter
  .route("/")
  .post(authenticate, authorize("coordinator"), createTask)
  .get(authenticate, authorize("coordinator"), getAllTasks);
taskRouter
  .route("/:id")
  .patch(authenticate, authorize("coordinator", "volunteer"), updateTask)
  .get(authenticate, getTask)
  .delete(authenticate, authorize("coordinator"), deleteTask);
taskRouter.patch("/:id/status", authenticate, updateTaskStatus);
