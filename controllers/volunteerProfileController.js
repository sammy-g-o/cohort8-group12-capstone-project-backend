import User from "../models/userModel.js";
import VolunteerProfile from "../models/volunteerProfileModel.js";
import AppError from "../utils/appError.js";

export const getMyVolunteerProfile = async (req, res, next) => {
  try {
    const myProfile = await VolunteerProfile.findOne({
      userId: req.user.id,
    }).populate("userId", "name email phoneNumber");

    if (!myProfile) {
      return next(
        new AppError("You haven't created a volunteer profile yet", 404),
      );
    }
    res.status(200).json({
      status: "successfull",
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
      status: "successfull",
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
      status: "successfull",
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
      return res.status(404).json({
        status: "failed",
        message: "user not found",
      });
    }
    if (user.role !== "volunteer") {
      return res.status(403).json({
        status: "failed",
        message: "User is not a volunteer",
      });
    }
    const existing = await VolunteerProfile.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(409).json({
        status: "failed",
        message: "Profile already exists for this user",
      });
    }

    const newProfile = await VolunteerProfile.create({
      ...req.body,
      userId: req.user.id,
    });

    res.status(201).json({
      status: "successful",
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
      return res.status(404).json({
        status: "failed",
        message: "No profile found",
      });
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
      status: "successful",
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
      status: "successful",
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
    res.status(204).send("successful");
  } catch (error) {
    next(error);
  }
};
