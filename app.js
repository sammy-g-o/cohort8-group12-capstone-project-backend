import express from "express";
import morgan from "morgan";
import authRouter from "./routes/authRoutes.js";
import { projectRoute } from "./routes/projectRoutes.js";
import { volunteerRoute } from "./routes/volunteerProfileRoute.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import { globalErrorHandler } from "./controllers/errorController.js";
import AppError from "./utils/appError.js";
import { organizationRouter } from "./routes/organizationRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import { dashboardRouter } from "./routes/dashboardRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { alertRouter } from "./routes/alertRoutes.js";
import { reportRouter } from "./routes/reportRoutes.js";

export const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/alerts", alertRouter);
app.use("/reports", reportRouter);
app.use("/projects", projectRoute);
app.use("/dashboard", dashboardRouter);
app.use("/volunteers", volunteerRoute);
app.use("/attendance", attendanceRouter);
app.use("/organizations", organizationRouter);
app.use("/notifications", notificationRouter);

// To handle undefined routes
app.all("/{*others}", (req, res, next) => {
  return next(new AppError(`can't find ${req.originalUrl} on this server`, 404)) //sends error to the global error handler
});

app.use(globalErrorHandler);
