import Task from "../models/taskModel.js";

//Create a new task
export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const task = await Task.create({ ...req.body, projectId });

    res.status(201).json({
      status: "successfully",
      message: "task successfully created",
      data: { task },
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
};
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();

    res.status(201).json({
      status: "successfully",
      result: tasks.length,
      data: tasks.length === 0 ? "no task" : { tasks },
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
};
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(400).json({
        status: "failed",
        message: "task not found",
      });
    }

    res.status(200).json({
      status: "successfully",
      data: { task },
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
};

//Update a task
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.param.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      status: "successful",
      message: "Task updated successfully",
      data: { task },
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
};
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    res.status(204).json({
      status: "successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
};
