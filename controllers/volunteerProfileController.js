import User from "../models/userModel.js";
import VolunteerProfile from "../models/volunteerProfileModel.js";
import AppError from "../utils/appError.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import Project from "../models/projectsModel.js";
import Task from "../models/taskModel.js";

export const getMyVolunteerProfile = async (req, res, next) => {
  try {
        // only pass through the filters coordinators need to discover volunteers
    // (stops clients filtering on or selecting hidden fields like emergencyContact)
    const { skills, interests, location, availability, page, limit } = req.query;

    const features = new ApiFeatures(VolunteerProfile.find(), {
      skills,
      interests,
      location,
      availability,
      page,
      limit,
    })
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const volunteers = await features.query.populate(
      "userId",
      "name email phoneNumber",
    );

    if (!myProfile) {
      return next(
        new AppError("You haven't created a volunteer profile yet", 404),
      );
    }
    res.status(200).json({
      status: "success",
      data: { myProfile },
    });
  } catch (error) {
    next(error);
  }
};
export const updateMyVolunteerProfile = async (req, res, next) => {
  try {
    const myProfile = await VolunteerProfile.findOneAndUpdate({
      userId: req.user.id,
    });

    if (!myProfile) {
      return next(
        new AppError("You haven't created a volunteer profile yet", 404),
      );
    }
    res.status(200).json({
      status: "success",
      data: { myProfile },
    });
  } catch (error) {
    next(error);
  }
};
export const deleteMyVolunteerProfile = async (req, res, next) => {
  try {
    const myProfile = await VolunteerProfile.findOneAndDelete({
      userId: req.user.id,
    });

    if (!myProfile) {
      return next(
        new AppError("You haven't created a volunteer profile yet", 404),
      );
    }
    res.status(200).json({
      status: "success",
      data: { myProfile },
    });
  } catch (error) {
    next(error);
  }
};

export const createVolunteerProfile = async (req, res, next) => {
  try {
    // const { userId } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError("user not found", 404));
    }
    if (user.role !== "volunteer") {
      return next(new AppError("User is not a volunteer", 403));
    }
    const existing = await VolunteerProfile.findOne({ userId: req.user.id });
    if (existing) {
      return next(new AppError("Profile already exists for this user", 409));
    }

    const newProfile = await VolunteerProfile.create({
      ...req.body,
      userId: req.user.id,
    });

    res.status(201).json({
      status: "success",
      message: "user successfully created",
      data: { newProfile },
    });
  } catch (error) {
    next(error);
  }
};

export const getVolunteerProfile = async (req, res, next) => {
  try {
    const volunteer = await VolunteerProfile.findById(req.params.id).populate(
      "userId",
      "name email phoneNumber",
    );
    if (!volunteer) {
      return next(new AppError("No profile found", 404));
    }
    res.status(200).json({
      status: "success",
      data: { volunteer },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllVolunteerProfiles = async (req, res, next) => {
  try {
    const volunteers = await VolunteerProfile.find().populate(
      "userId",
      "name email phoneNumber",
    );

    res.status(200).json({
      status: "success",
      result: volunteers.length,
      data: volunteers.length === 0 ? "no volunteer profiles" : { volunteers },
    });
  } catch (error) {
    next(error);
  }
};

export const updateVolunteerProfile = async (req, res, next) => {
  try {
    const updatedProfile = await VolunteerProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedProfile) {
      return next(new AppError("Profile not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "successfully updated profile",
      data: { updatedProfile },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVolunteerProfile = async (req, res, next) => {
  try {
    const deletedVolunteerProfile = await VolunteerProfile.findByIdAndDelete(
      req.params.id,
    );
    if (!deletedVolunteerProfile) {
      return next(new AppError("Profile not found", 404));
    }
    res.status(204).send("success");
  } catch (error) {
    next(error);
  }
};

// GET /volunteers/organization — volunteers assigned to tasks in the coordinator's NGO
export const getOrganizationVolunteers = async (req, res, next) => {
  try {
    if (!req.user.organizationId) {
      return next(
        new AppError("You must belong to an organization to view its volunteers", 403),
      );
    }

    const projectIds = await Project.distinct("_id", {
      organizationId: req.user.organizationId,
    });
    const volunteerIds = await Task.distinct("assignedTo", {
      projectId: { $in: projectIds },
      assignedTo: { $ne: null },
    });

    const volunteers = await VolunteerProfile.find({
      userId: { $in: volunteerIds },
    }).populate("userId", "name email phoneNumber");

    res.status(200).json({
      status: "success",
      results: volunteers.length,
      data: { volunteers },
    });
  } catch (error) {
    next(error);
  }
};