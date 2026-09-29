import express from "express";
import { taskRouter } from "./taskRoutes.js";
import {
  createProject,
  getProjects,
  getProjectsById,
} from "../controllers/projectController.js";

export const projectRoute = express.Router();
projectRoute.route("/").post(createProject).get(getProjects);
projectRoute.route("/:id").get(getProjectsById);

projectRoute.use("/:projectId/tasks", taskRouter);
