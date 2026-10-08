import express from "express";
import morgan from "morgan";
import authRouter from "./routes/authRoutes.js";
import { projectRoute } from "./routes/projectRoutes.js";
import { volunteerRoute } from "./routes/volunteerProfileRoute.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import cors from "cors";
import { corsOptions } from "./config/cors.js";

export const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRouter);
app.use("/projects", projectRoute);
app.use("/volunteers", volunteerRoute);
app.use("/attendance", attendanceRouter);

app.all("/{*others}", (req, res, next) => {
  res.status(404).json({
    status: "failed",
    message: `can't find ${req.originalUrl} on this server`,
  });
});

app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "failed";
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
});