import User from "../models/userModel.js";
import VolunteerProfile from "../models/volunteerProfileModel.js";

export const createVolunteerProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
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
    const existing = await VolunteerProfile.findOne({ userId });
    if (existing) {
      return res.status(409).json({
        status: "failed",
        message: "Profile already exists for this user",
      });
    }

    const newProfile = await VolunteerProfile.create(req.body);

    res.status(201).json({
      status: "successful",
      message: "user successfully created",
      data: { newProfile },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};
export const getVolunteerProfile = async (req, res) => {
  try {
    const volunteer = await VolunteerProfile.findById(req.params.id);
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
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};
export const getAllVolunteerProfiles = async (req, res) => {
  try {
    const volunteers = await VolunteerProfile.find();

    res.status(200).json({
      status: "successful",
      result: volunteers.length,
      data: volunteers.length === 0 ? "no volunteer profiles" : { volunteers },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};
export const updateVolunteerProfile = async (req, res) => {
  try {
    const updatedProfile = await VolunteerProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true },
    );

    res.status(200).json({
      status: "successful",
      message: "successfully updated profile",
      data: { updatedProfile },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};
export const deleteVolunteerProfile = async (req, res) => {
  try {
    const deletedVolunteerProfile = await VolunteerProfile.findByIdAndDelete(
      req.params.id,
    );
    res.status(204).json({
      status: "successfull",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};
