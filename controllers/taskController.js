import Task from "../models/taskModel.js";

//Create a new task
export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const task = await Task.create({ ...req.body, projectId });

    res.status(201).json({
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
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
};
