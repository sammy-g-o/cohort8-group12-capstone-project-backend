
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
  } catch (error) {
    next(error);
  }
};

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
