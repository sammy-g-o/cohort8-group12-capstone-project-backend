import express from "express";
import {
  createVolunteerProfile,
  deleteVolunteerProfile,
  getAllVolunteerProfiles,
  getVolunteerProfile,
  updateVolunteerProfile,
} from "../controllers/volunteerProfileController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

export const volunteerRoute = express.Router();

volunteerRoute
  .route("/")
  .post(authenticate, createVolunteerProfile)
  .get(
    authenticate,
    authorize("admin", "coordinator"),
    getAllVolunteerProfiles,
  );
volunteerRoute
  .route("/:id")
  .patch(updateVolunteerProfile)
  .get(authenticate, getVolunteerProfile)
  .delete(deleteVolunteerProfile);
