import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Project must have a name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Project must have a description"],
    trim: true,
  },
  status: {
    type: String,
    enum: {
      values: ["not started", "active", "on hold", "completed", "archived"],
      message:
        "status is either: not started, active, on hold, completed or archived",
    },
    default: "not started",
  },
  location: String,
  organizationId: {
    type: mongoose.Types.ObjectId,
    ref: "Organization",
    required: [true, "project needs an organization "],
  },
  maxVolunteers: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  startDate: {
    type: Date,
    required: [true, "Project must have a start date"],
    validate: {
      validator: function (val) {
        return val < this.endDate;
      },
      message: "end date must be more (later than) start date",
    },
  },
  endDate: { type: Date, required: [true, "Project must have a end date"] },
});
projectSchema.index({ organizationId: 1, name: 1 }, { unique: true });
const projectsModel = mongoose.model("Project", projectSchema);
export default projectsModel;
