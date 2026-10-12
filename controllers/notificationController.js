import notificationModel from "../models/notificationModel.js";
import AppError from "../utils/appError.js";

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

    res
      .status(200)
      .json({ status: "success", data: { notifications }, unreadCount });
  } catch (error) {
    next(error);
  }
};

// mark all notifications as read
export const markAllRead = async (req, res, next) => {
  try {
    await notificationModel.updateMany(
      { userId: req.user.id, read: false },
      { read: true },
    );
    res
      .status(200)
      .json({ status: "success", message: "All notifications marked as read" });
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
      { new: true },
    );
    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }
    res.status(200).json({ status: "success", data: { notification } });
  } catch (error) {
    next(error);
  }
};

// DELETE NOTIFICATION
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await notificationModel.findOneAndDelete({
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
