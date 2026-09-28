import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "A task needs a title"],
      trim: true,
    },
    description: String,
    status: String,
  },
  { timestamps: true },
);

export default mongoose.model("Task", taskSchema);
