import express from "express";
import { getNotification  } from "../controllers/notificationController.js";


const notificationRoute = express.Router();

notificationRoute.get('/', getNotification)

export default notificationRoute
