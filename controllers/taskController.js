import Task from "../models/taskModel.js";
import Project from "../models/projectsModel.js";
import AppError from "../utils/appError.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { createNotification } from "../utils/notify.js";

// Confirm that the project belongs to the user's organization
const getOrganizationProject = async (req, next) => {
  const { projectId } = req.params;
  // Volunteers do not belong to an organization. They reach a project only through
  // tasks assigned to them, so the callers must also filter tasks by assignedTo.
  if (req.user?.role === "volunteer") {
    const project = await Project.findById(projectId);
    if (!project) return next(new AppError("Project not found", 404));
    return project;
  }

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return next(
      new AppError(
        "You must belong to an organization to perform this action",
        403,
      ),
    );
  }

  const project = await Project.findOne({
    _id: projectId,
    organizationId,
  });

  if (!project) {
    return next(new AppError("Project not found in your organization", 404));
  }

  return project;
};

// Create a new task
export const createTask = async (req, res, next) => {
  try {
    const project = await getOrganizationProject(req, next);
    if (!project) return;

    // Use the project ID from the URL, not the request body
    const { projectId, ...taskData } = req.body;
    if (taskData.assignedTo) {
      const volunteer = await User.findOne({
        _id: taskData.assignedTo,
        role: "volunteer",
      });
      if (!volunteer) {
        return next(new AppError("assignedTo must be a valid volunteer", 400));
      }
    }

    const task = await Task.create({
      ...taskData,
      projectId: project._id,
    });

    res.status(201).json({
      status: "success",
      message: "Task created successfully",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// Get all tasks under a project
export const getAllTasks = async (req, res, next) => {
  try {
    const project = await getOrganizationProject(req, next);
    if (!project) return;

    const features = new ApiFeatures(Task.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const tasks = await features.query
      .find({ projectId: project._id }) // scope last
      .populate("projectId", "name");

    res.status(200).json({
      status: "success",
      result: tasks.length,
      data: { tasks },
    });
  } catch (error) {
    next(error);
  }
};

// Get one task
export const getTask = async (req, res, next) => {
  try {
    const project = await getOrganizationProject(req, next);
    if (!project) return;

    const filter = { _id: req.params.id, projectId: project._id };
    if (req.user.role === "volunteer") filter.assignedTo = req.user.id;

    const task = await Task.findOne(filter);

    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// Update task details — coordinators only (enforced in routes)
export const updateTask = async (req, res, next) => {
  try {
    const project = await getOrganizationProject(req, next);
    if (!project) return;

    // Do not allow this endpoint to change task status,
    // project ownership, or task assignment.
    const { projectId, assignedTo, status, ...updates } = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        projectId: project._id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Task updated successfully",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a task — coordinators only (enforced in routes)
export const deleteTask = async (req, res, next) => {
  try {
    const project = await getOrganizationProject(req, next);
    if (!project) return;

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      projectId: project._id,
    });

    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Update task status — volunteers can only update tasks assigned to them
export const updateTaskStatus = async (req, res, next) => {
  try {
    const project = await getOrganizationProject(req, next);
    if (!project) return;

    const { status } = req.body;

    const allowedStatuses = ["not started", "in progress", "completed"];

    if (!allowedStatuses.includes(status)) {
      return next(new AppError("Invalid task status", 400));
    }

    const filter = {
      _id: req.params.id,
      projectId: project._id,
    };

    if (req.user.role === "volunteer") {
      filter.assignedTo = req.user.id;
    } else if (req.user.role !== "coordinator") {
      return next(
        new AppError("You are not authorized to update task status", 403),
      );
    }

    const task = await Task.findOneAndUpdate(
      filter,
      { status },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!task) {
      return next(
        new AppError("Task not found or you are not assigned to it", 404),
      );
    }

    res.status(200).json({
      status: "success",
      message: "Task status updated successfully",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// Assign a task to a volunteer
export const assignTask = async (req, res, next) => {
  try {
    const project = await getOrganizationProject(req, next);
    if (!project) return;

    const { volunteerId } = req.body;

    if (!volunteerId || !mongoose.isValidObjectId(volunteerId)) {
      return next(new AppError("A valid volunteerId is required", 400));
    }

    const volunteer = await User.findOne({
      _id: volunteerId,
      role: "volunteer",
    });

    if (!volunteer) {
      return next(new AppError("Volunteer not found", 404));
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, projectId: project._id },
      { assignedTo: volunteer._id },
      { new: true, runValidators: true },
    );

    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    await createNotification(
      volunteer._id,
      `You have been assigned a task: ${task.title}`,
      {
        type: "task_assigned",
        link: `/projects/${project._id}/tasks/${task._id}`,
      },
    );

    res.status(200).json({
      status: "success",
      message: "Task assigned successfully",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// GET /users/me/tasks — tasks assigned to the logged-in volunteer
export const getMyTasks = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;

    const features = new ApiFeatures(Task.find(), { status, page, limit })
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const tasks = await features.query
      .find({ assignedTo: req.user.id }) // scope last
      .populate("projectId", "name status startDate endDate");

    res.status(200).json({
      status: "success",
      results: tasks.length,
      data: { tasks },
    });
  } catch (error) {
    next(error);
  }
};
