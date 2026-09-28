import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Project must have a name"] },
  description: {
    type: String,
    required: [true, "Project must have a description"],
  },
  status: { type: String, default: "Not started" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  startDate: { type: Date, required: [true, "Project must have a start date"] },
  endDate: { type: Date, required: [true, "Project must have a end date"] },
});

const projectsModel = mongoose.model("Project", projectSchema);
export default projectsModel;
