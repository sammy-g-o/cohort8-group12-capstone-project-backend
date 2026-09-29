import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import { app } from "./app.js";

const DB = process.env.ATLAS_STRING.replace(
  "<db_password>",
  process.env.MONGODB_PASSWORD,
);
const LOCAL = process.env.LOCAL
mongoose
  .connect(LOCAL)
  .then(() => console.log(`Database connected successfully`))
  .catch((err) => console.log("db connection error"));

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
