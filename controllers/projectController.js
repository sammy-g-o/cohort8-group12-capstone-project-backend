import projectsModel from "../models/projectsModel.js";

//Create a project
export const createProject = async (req, res) => {
  try {
    const project = await projectsModel.create(req.body);

    res.status(201).json({
      status: "successful",
      message: "Project created successfully",
      data: { project },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

//Get all projects
export const getProjects = async (req, res) => {
  try {
    const projects = await projectsModel.find();

    res.status(200).json({
      status: "successful",
      result: projects.length,
      data: { projects },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get projects",
      error: error.message,
    });
  }
};

//Get one project
export const getProjectsById = async (req, res) => {
  try {
    const project = await projectsModel.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Projects not found",
      });
    }

    res.status(200).json({
      status: "successful",
      data: { project },
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to get project",
      error: error.message,
    });
  }
};
export const updateProject = async (req, res) => {
  try {
    const project = await projectsModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!project) {
      return res.status(404).json({
        message: "Projects not found",
      });
    }

    res.status(200).json({
      status: "successful",
      message: "project updated successfully",
      data: { project },
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to get project",
      error: error.message,
    });
  }
};
export const deleteProject = async (req, res) => {
  try {
    const project = await projectsModel.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Projects not found",
      });
    }

    res.status(204).json({
      status: "successful",
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to get project",
      error: error.message,
    });
  }
};
