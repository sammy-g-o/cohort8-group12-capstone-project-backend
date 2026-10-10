import mongoose from "mongoose";
import validator from "validator";

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "An Organization must have a name"],
    unique: true,
  },
  description: {
    type: String,
  },
  contactEmail: {
    type: String,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "invalid email",
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
      message: "Organization status is either suspended, verified or pending",
    },
    default: "pending",
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "An organization must have an owner"],
  },
});

export default mongoose.model("Organization", organizationSchema);
