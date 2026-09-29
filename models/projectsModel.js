import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Project must have a name"],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Project must have a description"],
    trim: true,
  },
  status: { type: String, default: "Not started" },
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

const projectsModel = mongoose.model("Project", projectSchema);
export default projectsModel;
