import express from "express";
import { taskRouter } from "./taskRoutes.js";

export const projectRoute = express.Router({ mergeParams: true });
projectRoute.route("/").post(createProject).get(getProjects);
projectRoute.route("/:id").get(getProjectsById);

projectRoute.use("/:id/tasks", taskRouter, {});
