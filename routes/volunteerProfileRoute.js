import express from "express";
import {
  createVolunteerProfile,
  deleteVolunteerProfile,
  getAllVolunteerProfiles,
  getVolunteerProfile,
  updateVolunteerProfile,
} from "../controllers/volunteerProfileController.js";

export const volunteerRoute = express.Router();

volunteerRoute
  .route("/")
  .post(createVolunteerProfile)
  .get(getAllVolunteerProfiles);
volunteerRoute
  .route("/:id")
  .patch(updateVolunteerProfile)
  .get(getVolunteerProfile)
  .delete(deleteVolunteerProfile);
