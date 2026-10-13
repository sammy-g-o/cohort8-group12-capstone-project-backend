import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  getHoursReport,
  getMyReport,
  getProjectReport,
} from "../controllers/reportController.js";

export const reportRouter = express.Router();

// A volunteer's own hours and tasks
reportRouter.get("/me", authenticate, authorize("volunteer"), getMyReport);

// Coordinator reports for their NGO
reportRouter.get("/hours", authenticate, authorize("coordinator"), getHoursReport);
reportRouter.get(
  "/projects/:projectId",
  authenticate,
  authorize("coordinator"),
  getProjectReport,
);