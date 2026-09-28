import express from "express";

export const taskRouter = express.Router({ mergeParams: true });

taskRouter.route("/").post(()=>console.log('created task'));
taskRouter.route("/:id").patch(()=>console.log('updated task'));
