import {
  createTask,
  deleteTask,
  getAllTasks,
  getTask,
  updateTask,
} from "../controllers/taskController.js";
import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

export const taskRouter = express.Router({ mergeParams: true });

taskRouter
  .route("/")
  .post(authenticate, authorize("coordinator"), createTask)
  .get(getAllTasks);
taskRouter
  .route("/:id")
  .patch(authenticate, updateTask)
  .get(authenticate, getTask)
  .delete(deleteTask);
