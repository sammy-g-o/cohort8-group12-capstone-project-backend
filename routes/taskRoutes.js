
import express from "express";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTask,
  updateTask,
  updateTaskStatus,
} from "../controllers/taskController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { requireVerifiedOrg } from "../middleware/orgMiddleware.js";

export const taskRouter = express.Router({ mergeParams: true });

taskRouter
  .route("/")
  .post(
    authenticate,
    authorize("coordinator"),
    requireVerifiedOrg,
    createTask
  )
  .get(
    authenticate,
    authorize("coordinator"),
    requireVerifiedOrg,
    getAllTasks
  );

taskRouter
  .route("/:id")
  .patch(
    authenticate,
    authorize("coordinator"),
    requireVerifiedOrg,
    updateTask
  )
  .get(authenticate, requireVerifiedOrg, getTask)
  .delete(
    authenticate,
    authorize("coordinator"),
    requireVerifiedOrg,
    deleteTask
  );

// Volunteers and coordinators can update task status.
// The controller checks volunteer assignment and coordinator permissions.
taskRouter.patch(
  "/:id/status",
  authenticate,
  requireVerifiedOrg,
  updateTaskStatus
);
