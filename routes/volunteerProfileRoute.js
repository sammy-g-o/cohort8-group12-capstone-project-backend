import express from "express";
import {
  createVolunteerProfile,
  deleteMyVolunteerProfile,
  deleteVolunteerProfile,
  getAllVolunteerProfiles,
  getMyVolunteerProfile,
  getVolunteerProfile,
  updateMyVolunteerProfile,
  updateVolunteerProfile,
} from "../controllers/volunteerProfileController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

export const volunteerRoute = express.Router();

volunteerRoute
  .route("/me")
  .get(authenticate, getMyVolunteerProfile)
  .patch(authenticate, updateMyVolunteerProfile)
  .delete(authenticate, deleteMyVolunteerProfile);
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
