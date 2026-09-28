import express from "express";
import morgan from "morgan";
import { projectRoute } from "./routes/projectRoutes.js";

export const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use("/projects", projectRoute);
