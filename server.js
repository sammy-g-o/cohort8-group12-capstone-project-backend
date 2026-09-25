import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import { app } from "./app.js";

const DB = process.env.ATLAS_STRING.replace(
  "<db_password>",
  process.env.MONGODB_PASSWORD,
);

mongoose.connect(DB).then(() => console.log(`Database connected successfully`));

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
