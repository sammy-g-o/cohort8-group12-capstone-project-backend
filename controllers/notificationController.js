<<<<<<< HEAD
import notificationModel from '../models/notificationModel.js';
import AppError from '../utils/appError.js';

// GET NOTIFICATIONS
export const getNotifications = async (req, res, next) => {
  try {
    const { unread, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Number(limit) || 20, 100);

    const filter = { userId: req.user.id };
    if (unread === "true") filter.read = false;

    const [notifications, unreadCount] = await Promise.all([
      notificationModel
        .find(filter)
        .sort({ timestamp: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      notificationModel.countDocuments({ userId: req.user.id, read: false }),
    ]);

    res.status(200).json({ notifications, unreadCount });
=======

import Notifications from "../models/notificationModel.js";
import AppError from "../utils/appError.js";

// Get all notifications for the logged-in user
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notifications.find({
      userId: req.user.id,
    }).sort({ timestamp: -1 });

    res.status(200).json({
      status: "success",
      results: notifications.length,
      data: { notifications },
    });
>>>>>>> df22135 (feat: implement organization and task management)
  } catch (error) {
    next(error);
  }
};

<<<<<<< HEAD

// mark all notifications as read
export const markAllRead = async (req, res, next) => {
    try {
        await notificationModel.updateMany(
            { userId: req.user.id, read: false },
            { read: true }
        );
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};


// mark a single notification as read
export const markOneRead = async (req, res, next) => {
    try {
        const notification = await notificationModel.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { read: true },
            { new: true }
        );
        if (!notification) {
            return next(new AppError('Notification not found', 404));
        }
        res.status(200).json(notification);
    } catch (error) {
        next(error);
    }
};


// DELETE NOTIFICATION
export const deleteNotification = async (req, res, next) => {
    try {
        const notification = await notificationModel.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!notification) {
            return next(new AppError('Notification not found', 404));
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
=======
// Mark all the user's notifications as read
export const markAllRead = async (req, res, next) => {
  try {
    await Notifications.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      status: "success",
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// Mark one of the user's notifications as read
export const markOneRead = async (req, res, next) => {
  try {
    const notification = await Notifications.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      { $set: { read: true } },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Notification marked as read",
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

// Delete one of the user's notifications
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notifications.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
>>>>>>> df22135 (feat: implement organization and task management)
