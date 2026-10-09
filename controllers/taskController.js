import Task from "../models/taskModel.js";
import { taskRouter } from "../routes/taskRoutes.js";
import AppError from "../utils/appError.js";

//Create a new task
export const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const task = await Task.create({ ...req.body, projectId });

    res.status(201).json({
      status: "successfully",
      message: "task successfully created",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};
export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId }).populate(
      "projectId",
      "name",
    );

    res.status(200).json({
      status: "successfully",
      result: tasks.length,
      data: tasks.length === 0 ? "no task" : { tasks },
    });
  } catch (error) {
    next(error);
  }
};
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    res.status(200).json({
      status: "successfully",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

//Update a task
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    res.status(200).json({
      status: "successful",
      message: "Task updated successfully",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return next(new AppError("Task not found", 404));
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  const { status } = req.body;
  const task = await Task.findByIdAndUpdate(req.params.id, status, {
    runValidators: taskRouter,
  });
  if (!task) {
    return next(new AppError("Task not found", 404));
  }
  res.status(200).json({
    status: "successful",
  });
};
