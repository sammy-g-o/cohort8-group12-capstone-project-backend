import mongoose from "mongoose";
import Project from "../models/projectsModel.js";
import Task from "../models/taskModel.js";
import Attendance from "../models/attendanceModel.js";
import AppError from "../utils/appError.js";

const toHours = (ms) => Math.round(((ms || 0) / 3600000) * 100) / 100;

// [{ _id: "active", count: 3 }] -> { active: 3 }
const toCounts = (rows) =>
  rows.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});

// hours worked on finished sessions (checked out), split into all vs verified
const durationMs = { $subtract: ["$checkOutTime", "$checkInTime"] };
const hoursGroup = {
  sessions: { $sum: 1 },
  totalMs: { $sum: durationMs },
  verifiedMs: { $sum: { $cond: ["$verified", durationMs, 0] } },
};

const summarize = ({ sessions = 0, totalMs = 0, verifiedMs = 0 } = {}) => ({
  sessions,
  totalHours: toHours(totalMs),
  verifiedHours: toHours(verifiedMs),
});

// builds the checkInTime filter from ?from and ?to
const parseDateRange = (from, to) => {
  const range = {};

  if (from) {
    const fromDate = new Date(from);
    if (Number.isNaN(fromDate.getTime())) return { error: "Invalid from date" };
    range.$gte = fromDate;
  }

  if (to) {
    const toDate = new Date(to);
    if (Number.isNaN(toDate.getTime())) return { error: "Invalid to date" };
    range.$lte = toDate;
  }

  if (range.$gte && range.$lte && range.$gte > range.$lte) {
    return { error: "'from' cannot be later than 'to'" };
  }

  return { range: Object.keys(range).length ? range : null };
};

// GET /reports/hours?from=&to=&projectId= (coordinator)
// Hours worked per volunteer across the coordinator's NGO
export const getHoursReport = async (req, res, next) => {
  try {
    if (!req.user.organizationId) {
      return next(
        new AppError("You must belong to an organization to view reports", 403),
      );
    }

    const { from, to, projectId } = req.query;
    const { range, error } = parseDateRange(from, to);
    if (error) return next(new AppError(error, 400));

    const match = {
      organizationId: new mongoose.Types.ObjectId(req.user.organizationId),
      checkOutTime: { $ne: null },
    };
    if (range) match.checkInTime = range;

    if (projectId) {
      if (!mongoose.isValidObjectId(projectId)) {
        return next(new AppError("Invalid projectId", 400));
      }
      match.projectId = new mongoose.Types.ObjectId(projectId);
    }

    const rows = await Attendance.aggregate([
      { $match: match },
      { $group: { _id: "$volunteerId", ...hoursGroup } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "volunteer",
        },
      },
      { $unwind: "$volunteer" },
      {
        $project: {
          _id: 0,
          volunteerId: "$_id",
          name: "$volunteer.name",
          email: "$volunteer.email",
          sessions: 1,
          totalMs: 1,
          verifiedMs: 1,
        },
      },
      { $sort: { totalMs: -1 } },
    ]);

    const totals = rows.reduce(
      (acc, row) => ({
        sessions: acc.sessions + row.sessions,
        totalMs: acc.totalMs + row.totalMs,
        verifiedMs: acc.verifiedMs + row.verifiedMs,
      }),
      { sessions: 0, totalMs: 0, verifiedMs: 0 },
    );

    res.status(200).json({
      status: "success",
      results: rows.length,
      data: {
        totals: summarize(totals),
        volunteers: rows.map((row) => ({
          volunteerId: row.volunteerId,
          name: row.name,
          email: row.email,
          ...summarize(row),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /reports/projects/:projectId (coordinator)
export const getProjectReport = async (req, res, next) => {
  try {
    if (!req.user.organizationId) {
      return next(
        new AppError("You must belong to an organization to view reports", 403),
      );
    }

    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return next(new AppError("Project not found", 404));
    }

    const project = await Project.findOne({
      _id: projectId,
      organizationId: req.user.organizationId,
    });

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    const [taskStats, volunteers, hours] = await Promise.all([
      Task.aggregate([
        { $match: { projectId: project._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Task.distinct("assignedTo", {
        projectId: project._id,
        assignedTo: { $ne: null },
      }),
      Attendance.aggregate([
        { $match: { projectId: project._id, checkOutTime: { $ne: null } } },
        { $group: { _id: null, ...hoursGroup } },
      ]),
    ]);

    const tasks = toCounts(taskStats);
    const totalTasks = Object.values(tasks).reduce((sum, n) => sum + n, 0);

    res.status(200).json({
      status: "success",
      data: {
        project: {
          id: project._id,
          name: project.name,
          status: project.status,
          startDate: project.startDate,
          endDate: project.endDate,
        },
        tasks: {
          ...tasks,
          total: totalTasks,
          completionRate: totalTasks
            ? Math.round(((tasks.completed || 0) / totalTasks) * 100)
            : 0,
        },
        volunteers: volunteers.length,
        attendance: summarize(hours[0]),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /reports/me (volunteer) — the volunteer's own impact summary
export const getMyReport = async (req, res, next) => {
  try {
    const volunteerId = new mongoose.Types.ObjectId(req.user.id);

    const [hours, taskStats] = await Promise.all([
      Attendance.aggregate([
        { $match: { volunteerId, checkOutTime: { $ne: null } } },
        { $group: { _id: null, ...hoursGroup } },
      ]),
      Task.aggregate([
        { $match: { assignedTo: volunteerId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        attendance: summarize(hours[0]),
        tasks: toCounts(taskStats),
      },
    });
  } catch (error) {
    next(error);
  }
};