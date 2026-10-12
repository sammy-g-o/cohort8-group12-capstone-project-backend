import mongoose from "mongoose";
import Project from "../models/projectsModel.js";
import Task from "../models/taskModel.js";
import Attendance from "../models/attendanceModel.js";
import AppError from "../utils/appError.js";

// turns [{ _id: "active", count: 3 }] into { active: 3 }
const toCounts = (rows) =>
  rows.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});

// GET /dashboard (coordinator)
export const getDashboard = async (req, res, next) => {
  try {
    if (!req.user.organizationId) {
      return next(
        new AppError("You must belong to an organization to view the dashboard", 403),
      );
    }

    // aggregate() does not auto-cast ids, so convert the string from the token
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const projectIds = await Project.distinct("_id", { organizationId });
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      projectStats,
      taskStats,
      unassignedTasks,
      assignedVolunteers,
      activeCheckIns,
      pendingVerification,
      weeklyHours,
    ] = await Promise.all([
      Project.aggregate([
        { $match: { organizationId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { projectId: { $in: projectIds } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Task.countDocuments({ projectId: { $in: projectIds }, assignedTo: null }),
      Task.distinct("assignedTo", {
        projectId: { $in: projectIds },
        assignedTo: { $ne: null },
      }),
      Attendance.countDocuments({ organizationId, checkOutTime: null }),
      Attendance.countDocuments({
        organizationId,
        checkOutTime: { $ne: null },
        verified: false,
      }),
      Attendance.aggregate([
        {
          $match: {
            organizationId,
            checkOutTime: { $ne: null },
            checkInTime: { $gte: weekAgo },
          },
        },
        {
          $group: {
            _id: null,
            ms: { $sum: { $subtract: ["$checkOutTime", "$checkInTime"] } },
          },
        },
      ]),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        projects: toCounts(projectStats),
        tasks: toCounts(taskStats),
        unassignedTasks,
        volunteers: assignedVolunteers.length,
        activeCheckIns,
        pendingVerification,
        hoursLast7Days:
          Math.round(((weeklyHours[0]?.ms || 0) / 3600000) * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};