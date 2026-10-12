import express from "express";
import {
    checkIn,
    checkOut,
    getMyAttendance,
    getTaskAttendance,
    verifyAttendance,
} from "../controllers/attendanceController.js";
import {
    authenticate,
    authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Volunteer routes
router.post(
    "/checkIn",
    authenticate,
    authorize("volunteer"),
    checkIn,
);

// Keep /me before any generic /:id route.
router.get(
    "/me",
    authenticate,
    authorize("volunteer"),
    getMyAttendance,
);

router.patch(
    "/:id/checkOut",
    authenticate,
    authorize("volunteer"),
    checkOut,
);

// Coordinator routes
router.get(
    "/task/:taskId",
    authenticate,
    authorize("coordinator"),
    getTaskAttendance,
);

router.patch(
    "/:id/verify",
    authenticate,
    authorize("coordinator"),
    verifyAttendance,
);

export default router;