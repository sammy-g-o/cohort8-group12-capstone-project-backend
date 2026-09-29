import { createTask, updateTask } from "../controllers/taskController.js";
import express from "express";

export const taskRouter = express.Router({ mergeParams: true });

taskRouter.route("/").post(createTask);
taskRouter.route("/:id").patch(updateTask);
