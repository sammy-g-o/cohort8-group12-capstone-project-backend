import express from "express";
import { getNotification  } from "../controllers/notificationController.js";


const notificationRoute = express.Router();

notificationRoute.get('/notifications', getNotification)

export default notificationRouter
