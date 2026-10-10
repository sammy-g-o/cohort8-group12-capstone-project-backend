import mongoose from "mongoose";

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

// Load the app only after dotenv has run, so modules like config/cors.js
// can read process.env at import time.
const { app } = await import("./app.js");

const required = ["ATLAS_STRING", "MONGODB_PASSWORD", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const DB = process.env.ATLAS_STRING.replace(
  "<db_password>",
  process.env.MONGODB_PASSWORD,
);
const PORT = process.env.PORT || 3000;

let server;

mongoose
  .connect(DB)
  .then(() => {
    console.log("Database connected successfully");
    server = app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("db connection error:", err.message);
    process.exit(1);
  });

// To handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});