
import express from "express";
import { taskRouter } from "./taskRoutes.js";
import {
  createProject,
  deleteProject,
  getProjects,
  getProjectById,
  updateProject,
} from "../controllers/projectController.js";
import {
  authenticate,
  authorize,
} from "../middleware/authMiddleware.js";
import { requireVerifiedOrg } from "../middleware/orgMiddleware.js";

export const projectRoute = express.Router();

projectRoute
  .route("/")
  .post(
    authenticate,
    authorize("coordinator"),
    requireVerifiedOrg,
    createProject,
  )
  .get(authenticate, getProjects);

projectRoute
  .route("/:id")
  .get(authenticate, getProjectById)
  .patch(
    authenticate,
    authorize("coordinator"),
    requireVerifiedOrg,
    updateProject,
  )
  .delete(
    authenticate,
    authorize("coordinator"),
    requireVerifiedOrg,
    deleteProject,
  );

projectRoute.use("/:projectId/tasks", taskRouter);
