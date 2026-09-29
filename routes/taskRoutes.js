import {
  createTask,
  deleteTask,
  getAllTasks,
  getTask,
  updateTask,
} from "../controllers/taskController.js";
import express from "express";

export const taskRouter = express.Router({ mergeParams: true });

taskRouter.route("/").post(createTask).get(getAllTasks);
taskRouter.route("/:id").patch(updateTask).get(getTask).delete(deleteTask);
