import express from "express";
import morgan from "morgan";
import authRouter from "./routes/authRoutes.js";
import { projectRoute } from "./routes/projectRoutes.js";
import { volunteerRoute } from "./routes/volunteerProfileRoute.js";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import { globalErrorHandler } from "./controllers/errorController.js";
import AppError from "./utils/appError.js";

export const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRouter);
app.use("/projects", projectRoute);
app.use("/volunteers", volunteerRoute);

// To handle undefined routes
app.all("/{*others}", (req, res, next) => {
  return next(new AppError(`can't find ${req.originalUrl} on this server`, 404)) //sends error to the global error handler
});

app.use(globalErrorHandler);
