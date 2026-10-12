import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { 
    getNotifications,
    markAllRead,
    markOneRead,
    deleteNotification

  } from "../controllers/notificationController.js";


const notificationRoute = express.Router();

notificationRoute.use(authenticate);

notificationRoute.get('/', getNotifications);
notificationRoute.patch('/read-all', markAllRead);
notificationRoute.patch('/:id/read', markOneRead);
notificationRoute.delete('/:id', deleteNotification);

export default notificationRoute
