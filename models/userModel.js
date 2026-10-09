import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "user needs a name"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "user needs an email"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "please provide a valid email"],
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "user needs a password"],
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "coordinator", "volunteer"],
        message: "role is either admin, coordinator or volunteer ",
      },
      default: "volunteer",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
