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
    status: {
      type: String,
      enum: {
        values: ["not started", "in progress", "completed"],
        message: "task status is either not started, in progress or completed",
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Task", taskSchema);
