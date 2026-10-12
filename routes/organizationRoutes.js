
import express from "express";
import {
  addOrganizationCoordinators,
  deleteOrganizationCoordinator,
  getAllOrganizations,
  getOrganizationById,
  getOrganizationCoordinators,
  register,
  suspendOrganization,
  verifyOrganization,
} from "../controllers/organizationController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

export const organizationRouter = express.Router();

organizationRouter.post("/register", authenticate, register);

organizationRouter.get("/", authenticate, getAllOrganizations);

organizationRouter.get("/:id", authenticate, getOrganizationById);

organizationRouter.patch(
  "/:id/verify",
  authenticate,
  authorize("admin"),
  verifyOrganization,
);

organizationRouter.patch(
  "/:id/suspend",
  authenticate,
  authorize("admin"),
  suspendOrganization,
);

organizationRouter.post(
  "/me/coordinators",
  authenticate,
  authorize("coordinator"),
  addOrganizationCoordinators,
);

organizationRouter.get(
  "/me/coordinators",
  authenticate,
  authorize("coordinator"),
  getOrganizationCoordinators,
);

organizationRouter.delete(
  "/me/coordinators/:userId",
  authenticate,
  authorize("coordinator"),
  deleteOrganizationCoordinator,
);
