import express from "express";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes.js";
import { projectRoute } from "./routes/projectRoutes.js";

export const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", userRoutes);
app.use("/projects", projectRoute);
