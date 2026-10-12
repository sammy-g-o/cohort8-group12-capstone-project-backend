import projectsModel from "../models/projectsModel.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import AppError from "../utils/appError.js";

// Create a project
export const createProject = async (req, res, next) => {
  try {
    if (!req.user.organizationId) {
      return next(
        new AppError(
          "You must belong to an organization to create a project",
          403,
        ),
      );
    }

    const project = await projectsModel.create({
      name: req.body.name,
      description: req.body.description,
      status: req.body.status,
      location: req.body.location,
      maxVolunteers: req.body.maxVolunteers,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      organizationId: req.user.organizationId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      status: "success",
      message: "Project created successfully",
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

// Get projects
export const getProjects = async (req, res, next) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : { organizationId: req.user.organizationId };

    const features = new ApiFeatures(projectsModel.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const projects = await features.query.find(filter); // scope last

    res.status(200).json({
      status: "success",
      result: projects.length,
      data: { projects },
    });
  } catch (error) {
    next(error);
  }
};

// Get one project
export const getProjectById = async (req, res, next) => {
  try {
    const filter =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : {
            _id: req.params.id,
            organizationId: req.user.organizationId,
          };

    const project = await projectsModel.findOne(filter);

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

// Update a project belonging to the coordinator's organization
export const updateProject = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "description",
      "status",
      "location",
      "maxVolunteers",
      "startDate",
      "endDate",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const project = await projectsModel.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.user.organizationId,
      },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Project updated successfully",
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a project belonging to the coordinator's organization
export const deleteProject = async (req, res, next) => {
  try {
    const project = await projectsModel.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
