import projectsModel from "../models/projectsModel.js";
import AppError from "../utils/appError.js";

//Create a project
export const createProject = async (req, res, next) => {
  try {
    const project = await projectsModel.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json({
      status: "successful",
      message: "Project created successfully",
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

//Get all projects
export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectsModel.find();

    res.status(200).json({
      status: "successful",
      result: projects.length,
      data: { projects },
    });
  } catch (error) {
    next(error);
  }
};

//Get one project
export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectsModel.findById(req.params.id);

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    res.status(200).json({
      status: "successful",
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};
export const updateProject = async (req, res, next) => {
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
      return next(new AppError("Project not found", 404));
    }

    res.status(200).json({
      status: "successful",
      message: "project updated successfully",
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};
export const deleteProject = async (req, res, next) => {
  try {
    const project = await projectsModel.findByIdAndDelete(req.params.id);

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
