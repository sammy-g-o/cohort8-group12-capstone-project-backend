import express from "express";
import { taskRouter } from "./taskRoutes.js";
import {
  createProject,
  deleteProject,
  getProjects,
  getProjectById,
  updateProject,
} from "../controllers/projectController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

export const projectRoute = express.Router();
projectRoute
  .route("/")
  .post(authenticate, authorize("coordinator"), createProject)
  .get(authenticate, getProjects);
projectRoute
  .route("/:id")
  .get(authenticate, getProjectById)
  .patch(authenticate, authorize("coordinator"), updateProject)
  .delete(authenticate, authorize("coordinator"), deleteProject);

projectRoute.use("/:projectId/tasks", taskRouter);
