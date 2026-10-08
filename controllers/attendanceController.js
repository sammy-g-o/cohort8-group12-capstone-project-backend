import Attendance from "../models/attendanceModel.js";

export const checkIn = async (req, res) => {
  try {
    const { volunteerId, taskId } = req.body;

    if (!volunteerId || !taskId) {
      return res.status(400).json({
        message: "volunteerId and taskId are required",
      });
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
    res.status(500).json({
      message: "Failed to check in volunteer",
      error: error.message,
    });
  }
};
