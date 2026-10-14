import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "A task must belong to a project"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: {
      type: String,
      required: [true, "A task needs a title"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["not started", "in progress", "completed"],
        message: "Task status must be not started, in progress or completed",
      },
      default: "not started",
    },
    dueDate: Date,
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Task priority must be low, medium or high",
      },
      default: "medium",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // copied from the project at creation so reports/dashboards can filter without joins
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
  },
  { timestamps: true },
);
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
export default mongoose.model("Task", taskSchema);
