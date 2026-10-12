
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";

const seedAdmin = async () => {
  try {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ATLAS_STRING, MONGODB_PASSWORD } =
      process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in config.env");
    }

    if (!ATLAS_STRING || !MONGODB_PASSWORD) {
      throw new Error("Database environment variables are missing");
    }

    const databaseUrl = ATLAS_STRING.replace(
      "<db_password>",
      MONGODB_PASSWORD,
    );

    await mongoose.connect(databaseUrl);

    const email = ADMIN_EMAIL.trim().toLowerCase();
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("An account with ADMIN_EMAIL already exists. Skipping seed.");
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await User.create({
      name: "System Admin",
      email,
      passwordHash,
      role: "admin",
      organizationId: null,
    });

    console.log("Admin account created successfully.");
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

seedAdmin();
