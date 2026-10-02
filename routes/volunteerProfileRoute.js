import express from "express";
import {
  createVolunteerProfile,
  deleteVolunteerProfile,
  getAllVolunteerProfiles,
  getMyVolunteerProfile,
  getVolunteerProfile,
  updateVolunteerProfile,
} from "../controllers/volunteerProfileController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

export const volunteerRoute = express.Router();

volunteerRoute.route("/me").get(authenticate, getMyVolunteerProfile)
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
  .patch(authenticate, updateVolunteerProfile)
  .get(authenticate, getVolunteerProfile)
  .delete(authenticate, deleteVolunteerProfile);