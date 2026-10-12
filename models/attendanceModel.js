import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    checkInTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  },
);

attendanceSchema.virtual("hoursWorked").get(function () {
  if (!this.checkInTime || !this.checkOutTime) {
    return null;
  }

  const difference =
    this.checkOutTime.getTime() - this.checkInTime.getTime();

  if (difference < 0) {
    return null;
  }
  return Math.round((difference / 3600000) * 100) / 100;
});

export default mongoose.model("Attendance", attendanceSchema);


