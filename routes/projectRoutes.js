import express from "express";
import { taskRouter } from "./taskRoutes.js";
import {
  createProject,
  deleteProject,
  getProjects,
  getProjectsById,
  updateProject,
} from "../controllers/projectController.js";

export const projectRoute = express.Router();
projectRoute.route("/").post(createProject).get(getProjects);
projectRoute
  .route("/:id")
  .get(getProjectsById)
  .patch(updateProject)
  .delete(deleteProject);

projectRoute.use("/:projectId/tasks", taskRouter);
