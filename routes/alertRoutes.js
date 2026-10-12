import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { getAlerts } from "../controllers/alertController.js";

export const alertRouter = express.Router();

alertRouter.get("/", authenticate, authorize("coordinator"), getAlerts);