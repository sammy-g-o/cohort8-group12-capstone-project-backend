import express from "express";
import { taskRouter } from "./taskRoutes.js";

export const projectRoute = express.Router();
projectRoute.route("/").post(()=>console.log('created project')).get(()=>console.log('retrieved projects'));
projectRoute.route("/:id").get(()=>console.log('retrieved project'));

projectRoute.use("/:projectId/tasks", taskRouter);
