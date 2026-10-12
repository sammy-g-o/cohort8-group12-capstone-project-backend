
import mongoose from "mongoose";
import Organization from "../models/organizationModel.js";
import User from "../models/userModel.js";

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Register an organization
export const register = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(createError(404, "User not found"));
    }

    if (user.role !== "coordinator") {
      return next(
        createError(403, "Only coordinators can register an organization"),
      );
    }

    if (user.organizationId) {
      return next(
        createError(409, "You already belong to an organization. Please log in again if your membership has changed."),
      );
    }

    const { name, description, contactEmail, location, logoUrl } = req.body;

    const organization = await Organization.create({
      name,
      description,
      contactEmail,
      location,
      logoUrl,
      owner: user._id,
      status: "pending",
    });

    user.organizationId = organization._id;
    await user.save();

    res.status(201).json({
      status: "success",
      message: "Organization registered successfully. Please log in again to refresh your token.",
      data: { organization },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(createError(409, "Organization name or contact email already exists"));
    }
    next(error);
  }
};

// Get all organizations
export const getAllOrganizations = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === "admin") {
      if (req.query.status) {
        filter.status = req.query.status;
      }
    } else {
      filter.status = "verified";
    }

    const organizations = await Organization.find(filter);

    res.status(200).json({
      status: "success",
      results: organizations.length,
      data: { organizations },
    });
  } catch (error) {
    next(error);
  }
};

// Get one organization
export const getOrganizationById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(createError(404, "Organization not found"));
    }

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return next(createError(404, "Organization not found"));
    }

    const isAdmin = req.user.role === "admin";
    const isVerified = organization.status === "verified";
    const isOwnOrganization =
      req.user.organizationId?.toString() === organization._id.toString();

    if (!isAdmin && !isVerified && !isOwnOrganization) {
      return next(createError(404, "Organization not found"));
    }

    res.status(200).json({
      status: "success",
      data: { organization },
    });
  } catch (error) {
    next(error);
  }
};

// Verify an organization (admin only)
export const verifyOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      { status: "verified" },
      { new: true, runValidators: true },
    );

    if (!organization) {
      return next(createError(404, "Organization not found"));
    }

    res.status(200).json({
      status: "success",
      message: "Organization verified successfully",
      data: { organization },
    });
  } catch (error) {
    next(error);
  }
};

// Suspend an organization (admin only)
export const suspendOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      { status: "suspended" },
      { new: true, runValidators: true },
    );

    if (!organization) {
      return next(createError(404, "Organization not found"));
    }

    res.status(200).json({
      status: "success",
      message: "Organization suspended successfully",
      data: { organization },
    });
  } catch (error) {
    next(error);
  }
};

// Get coordinators belonging to the caller's organization
export const getOrganizationCoordinators = async (req, res, next) => {
  try {
    if (!req.user.organizationId) {
      return next(createError(400, "You do not belong to an organization"));
    }

    const coordinators = await User.find({
      organizationId: req.user.organizationId,
      role: "coordinator",
    }).select("-passwordHash");

    res.status(200).json({
      status: "success",
      results: coordinators.length,
      data: { coordinators },
    });
  } catch (error) {
    next(error);
  }
};

// Add an existing user as a coordinator
export const addOrganizationCoordinators = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(createError(400, "Email is required"));
    }

    if (!req.user.organizationId) {
      return next(createError(400, "You do not belong to an organization"));
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return next(createError(404, "User not found"));
    }

    if (
      user.organizationId &&
      user.organizationId.toString() !== req.user.organizationId.toString()
    ) {
      return next(
        createError(409, "This user belongs to another organization"),
      );
    }

    user.role = "coordinator";
    user.organizationId = req.user.organizationId;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Coordinator added successfully",
      data: {
        coordinator: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Remove a coordinator (organization owner only)
export const deleteOrganizationCoordinator = async (req, res, next) => {
  try {
    if (!req.user.organizationId) {
      return next(createError(400, "You do not belong to an organization"));
    }

    const organization = await Organization.findById(
      req.user.organizationId,
    );

    if (!organization) {
      return next(createError(404, "Organization not found"));
    }

    if (organization.owner.toString() !== req.user.id.toString()) {
      return next(
        createError(403, "Only the organization owner can remove coordinators"),
      );
    }

    if (organization.owner.toString() === req.params.userId) {
      return next(
        createError(400, "The organization owner cannot be removed"),
      );
    }

    const coordinator = await User.findOne({
      _id: req.params.userId,
      organizationId: organization._id,
      role: "coordinator",
    });

    if (!coordinator) {
      return next(createError(404, "Coordinator not found in your organization"));
    }

    coordinator.role = "volunteer";
    coordinator.organizationId = null;
    await coordinator.save();

    res.status(200).json({
      status: "success",
      message: "Coordinator removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
