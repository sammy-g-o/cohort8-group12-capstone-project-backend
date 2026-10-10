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

export const organizationRouter = express.Router();

organizationRouter.post("/register", register);
organizationRouter.route("/").get(getAllOrganizations);
organizationRouter.route("/:id").get(getOrganizationById);
organizationRouter.route("/:id/verify").patch(verifyOrganization);
organizationRouter.route("/suspend").patch(suspendOrganization);
organizationRouter
  .route("/me/coordinators")
  .post(addOrganizationCoordinators)
  .get(getOrganizationCoordinators);
organizationRouter.route("/me/coordinators/:userId").delete(deleteOrganizationCoordinator);
