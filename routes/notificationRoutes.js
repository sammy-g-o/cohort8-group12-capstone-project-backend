import express from "express";
import { getNotification  } from "../controllers/notificationController";


const notificationRoute = express.Router();

notificationRoute.get('/notifications', getNotification)

export default notificationRoute
