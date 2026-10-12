import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { getDashboard } from "../controllers/dashboardController.js";

export const dashboardRouter = express.Router();

dashboardRouter.get("/", authenticate, authorize("coordinator"), getDashboard);