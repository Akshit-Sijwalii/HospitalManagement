import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },

  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
    default: "Upcoming",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

appointmentSchema.index({ doctorId: 1, date: 1, startTime: 1, endTime: 1 });

const appointmentModel = mongoose.model("appointment", appointmentSchema);
export default appointmentModel;
