import mongoose from "mongoose";
import Project from "../models/projectsModel.js";
import Task from "../models/taskModel.js";
import Attendance from "../models/attendanceModel.js";
import AppError from "../utils/appError.js";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const LIVE_PROJECT_STATUSES = ["not started", "active", "on hold"];
const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };

// count of matches + up to 5 sample records
const check = async (Model, filter, fields) => {
  const [count, samples] = await Promise.all([
    Model.countDocuments(filter),
    Model.find(filter).select(fields).limit(5).lean(),
  ]);
  return { count, samples };
};

// GET /alerts (coordinator) — computed on request, nothing is stored
export const getAlerts = async (req, res, next) => {
  try {
    if (!req.user.organizationId) {
      return next(
        new AppError("You must belong to an organization to view alerts", 403),
      );
    }

    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const now = Date.now();

    const liveProjectIds = await Project.distinct("_id", {
      organizationId,
      status: { $in: LIVE_PROJECT_STATUSES },
    });

    const [overdueProjects, endingSoon, staleCheckIns, unverified, unassigned] =
      await Promise.all([
        check(
          Project,
          {
            organizationId,
            status: { $in: LIVE_PROJECT_STATUSES },
            endDate: { $lt: new Date(now) },
          },
          "name endDate",
        ),
        check(
          Project,
          {
            organizationId,
            status: { $in: LIVE_PROJECT_STATUSES },
            endDate: { $gte: new Date(now), $lte: new Date(now + 7 * DAY) },
          },
          "name endDate",
        ),
        check(
          Attendance,
          {
            organizationId,
            checkOutTime: null,
            checkInTime: { $lt: new Date(now - 12 * HOUR) },
          },
          "volunteerId taskId checkInTime",
        ),
        check(
          Attendance,
          {
            organizationId,
            verified: false,
            checkOutTime: { $lt: new Date(now - DAY) },
          },
          "volunteerId taskId checkOutTime",
        ),
        check(
          Task,
          {
            projectId: { $in: liveProjectIds },
            assignedTo: null,
            status: { $ne: "completed" },
          },
          "title projectId",
        ),
      ]);

    const alerts = [
      {
        type: "project_overdue",
        severity: "high",
        message: `${overdueProjects.count} project(s) are past their end date and not completed`,
        ...overdueProjects,
      },
      {
        type: "project_ending_soon",
        severity: "medium",
        message: `${endingSoon.count} project(s) end within 7 days`,
        ...endingSoon,
      },
      {
        type: "stale_check_in",
        severity: "medium",
        message: `${staleCheckIns.count} volunteer(s) have been checked in for over 12 hours without checking out`,
        ...staleCheckIns,
      },
      {
        type: "unverified_attendance",
        severity: "medium",
        message: `${unverified.count} attendance record(s) have waited over 24 hours for verification`,
        ...unverified,
      },
      {
        type: "unassigned_tasks",
        severity: "low",
        message: `${unassigned.count} open task(s) have no volunteer assigned`,
        ...unassigned,
      },
    ]
      .filter((alert) => alert.count > 0)
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

    res.status(200).json({
      status: "success",
      results: alerts.length,
      data: { alerts },
    });
  } catch (error) {
    next(error);
  }
};