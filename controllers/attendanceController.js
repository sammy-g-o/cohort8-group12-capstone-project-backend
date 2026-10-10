import Attendance from "../models/attendanceModel.js";
import AppError from "../utils/appError.js";

export const checkIn = async (req, res, next) => {
  try {
    const { volunteerId, taskId } = req.body;

    if (!volunteerId || !taskId) {
      return next(new AppError("volunteerId and taskId are required", 400));
    }

    const attendance = await Attendance.create({
      volunteerId,
      taskId,
      checkInTime: new Date(),
      verified: false,
    });

    res.status(201).json({
      message: "Volunteer checked in successfully",
      attendance,
    });
  } catch (error) {
    next(error);
  }
};
