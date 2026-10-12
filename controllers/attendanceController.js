import mongoose from "mongoose";
import Attendance from "../models/attendanceModel.js";
import Task from "../models/taskModel.js";
import Project from "../models/projectsModel.js";
import AppError from "../utils/appError.js";
import { createNotification } from "../utils/notify.js";

// POST /attendance/checkIn
export const checkIn = async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const volunteerId = req.user.id;

    if (!taskId) {
      return next(new AppError("taskId is required", 400));
    }

    if (!mongoose.isValidObjectId(taskId)) {
      return next(new AppError("Invalid taskId", 400));
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    if (!task.assignedTo || task.assignedTo.toString() !== volunteerId) {
      return next(new AppError("You are not assigned to this task", 403));
    }

    const existingAttendance = await Attendance.findOne({
      volunteerId,
      taskId,
      checkOutTime: null,
    });

    if (existingAttendance) {
      return next(
        new AppError("You already have an open check-in for this task", 409),
      );
    }

    const project = await Project.findById(task.projectId);

    if (!project) {
      return next(new AppError("Task project not found", 404));
    }

    const attendance = await Attendance.create({
      volunteerId,
      taskId: task._id,
      projectId: project._id,
      organizationId: project.organizationId,
      checkInTime: new Date(),
    });

    return res.status(201).json({
      status: "success",
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /attendance/:id/checkOut
export const checkOut = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError("Invalid attendance ID", 400));
    }

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return next(new AppError("Attendance record not found", 404));
    }

    if (attendance.volunteerId.toString() !== req.user.id) {
      return next(new AppError("You can only check out your own record", 403));
    }

    if (attendance.checkOutTime) {
      return next(new AppError("Attendance has already been checked out", 400));
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    return res.status(200).json({
      status: "success",
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};

// GET /attendance/me
export const getMyAttendance = async (req, res, next) => {
  try {
    const { taskId, from, to } = req.query;

    const filter = {
      volunteerId: req.user.id,
    };

    if (taskId) {
      if (!mongoose.isValidObjectId(taskId)) {
        return next(new AppError("Invalid taskId", 400));
      }

      filter.taskId = taskId;
    }

    if (from || to) {
      filter.checkInTime = {};

      if (from) {
        const fromDate = new Date(from);

        if (Number.isNaN(fromDate.getTime())) {
          return next(new AppError("Invalid from date", 400));
        }

        filter.checkInTime.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to);

        if (Number.isNaN(toDate.getTime())) {
          return next(new AppError("Invalid to date", 400));
        }

        filter.checkInTime.$lte = toDate;
      }

      if (
        filter.checkInTime.$gte &&
        filter.checkInTime.$lte &&
        filter.checkInTime.$gte > filter.checkInTime.$lte
      ) {
        return next(new AppError("'from' cannot be later than 'to'", 400));
      }
    }

    const attendances = await Attendance.find(filter).sort({ checkInTime: -1 });

    return res.status(200).json({
      status: "success",
      results: attendances.length,
      data: { attendances },
    });
  } catch (error) {
    next(error);
  }
};

// GET /attendance/task/:taskId
export const getTaskAttendance = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
      return next(new AppError("Invalid taskId", 400));
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    const project = await Project.findById(task.projectId);

    if (
      !project ||
      project.organizationId.toString() !== String(req.user.organizationId)
    ) {
      return next(new AppError("Task not found", 404));
    }

    const attendances = await Attendance.find({
      taskId,
      organizationId: req.user.organizationId,
    }).sort({ checkInTime: -1 });

    return res.status(200).json({
      status: "success",
      results: attendances.length,
      data: { attendances },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /attendance/:id/verify
export const verifyAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError("Invalid attendance ID", 400));
    }

    const attendance = await Attendance.findOne({
      _id: id,
      organizationId: req.user.organizationId,
    });

    if (!attendance) {
      return next(new AppError("Attendance record not found", 404));
    }
    if (attendance.verified) {
      return next(new AppError("Attendance is already verified", 409));
    }

    attendance.verified = true;
    attendance.verifiedBy = req.user.id;
    attendance.verifiedAt = new Date();

    await attendance.save();
    await createNotification(
      attendance.volunteerId,
      "Your attendance has been verified",
      { type: "attendance_verified", link: "/attendance/me" },
    );
    return res.status(200).json({
      status: "success",
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};
