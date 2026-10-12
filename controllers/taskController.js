
import Task from "../models/taskModel.js";
import Project from "../models/projectsModel.js";
import AppError from "../utils/appError.js";

// Confirm that the project belongs to the user's organization
const getOrganizationProject = async (req, next) => {
  const { projectId } = req.params;
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return next(
      new AppError(
        "You must belong to an organization to perform this action",
        403
      )
    );
  }

  const project = await Project.findOne({
    _id: projectId,
    organizationId,
  });

  if (!project) {
    return next(
      new AppError("Project not found in your organization", 404)
    );
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

    const tasks = await Task.find({
      projectId: project._id,
    }).populate("projectId", "name");

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

    const task = await Task.findOne({
      _id: req.params.id,
      projectId: project._id,
    });

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
    const {
      projectId,
      assignedTo,
      status,
      ...updates
    } = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        projectId: project._id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
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

    const allowedStatuses = [
      "not started",
      "in progress",
      "completed",
    ];

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
        new AppError(
          "You are not authorized to update task status",
          403
        )
      );
    }

    const task = await Task.findOneAndUpdate(
      filter,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return next(
        new AppError(
          "Task not found or you are not assigned to it",
          404
        )
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
