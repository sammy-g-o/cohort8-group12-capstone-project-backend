
import mongoose from "mongoose";
import validator from "validator";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "An Organization must have a name"],
      unique: true,
      trim: true,
    },

    description: {
      type: String,
    },

    contactEmail: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      validate: {
        validator: (value) => !value || validator.isEmail(value),
        message: "Invalid email",
      },
    },

    location: {
      type: String,
    },

    logoUrl: {
      type: String,
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "verified", "suspended"],
        message:
          "Organization status must be pending, verified, or suspended",
      },
      default: "pending",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "An organization must have an owner"],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Organization", organizationSchema);
