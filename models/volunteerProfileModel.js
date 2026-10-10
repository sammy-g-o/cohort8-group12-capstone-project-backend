import mongoose from "mongoose";
import validator from "validator";

const emergencyContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Emergency contact needs a name"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Emergency contact needs a phone number"],
      validate: [
        (val) => validator.isMobilePhone(val, "any"),
        "invalid phone number",
      ],
    },
    relationship: { type: String, trim: true }, // optional
  },
  { _id: false }, // no separate id for the subdocument
);
const volunteerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User id must be provided"],
      unique: true,
    },
    skills: {
      type: [String],
    },
    availability: {
      type: String,
    },
    interests: {
      type: [String],
    },
    location: String,
    bio: {
      type: String,
      maxLength: 500,
    },
    avatarUrl: String,
    emergencyContact: {
      type: emergencyContactSchema,
      select: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("VolunteerProfile", volunteerProfileSchema);
