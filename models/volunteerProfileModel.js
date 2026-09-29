import mongoose from "mongoose";

const volunteerProfileSchema = new mongoose.Schema({
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
});

export default mongoose.model("VolunteerProfile", volunteerProfileSchema);
