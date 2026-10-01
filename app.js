import express from "express";
import morgan from "morgan";
import authRouter from "./routes/authRoutes.js";
import { projectRoute } from "./routes/projectRoutes.js";
import { volunteerRoute } from "./routes/volunteerProfileRoute.js";
import cors from "cors";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRouter);
app.use("/projects", projectRoute);
app.use("/volunteers", volunteerRoute);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "failed",
    message: `can't find ${req.originalUrl} on this server`,
  });
});
