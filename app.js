import express from "express";
import morgan from "morgan";
import authRouter from "./routes/authRoutes.js";
import { projectRoute } from "./routes/projectRoutes.js";

export const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRouter);
app.use("/projects", projectRoute);
