import mongoose from "mongoose";
//
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import { app } from "./app.js";

const DB = process.env.ATLAS_STRING.replace(
  "<db_password>",
  process.env.MONGODB_PASSWORD,
);
const LOCAL = process.env.LOCAL_DB;

mongoose
  .connect(DB)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("db connection error:", err.message));

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

// To handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
