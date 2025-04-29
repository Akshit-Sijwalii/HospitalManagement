import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // Replace with actual model name
      required: true,
    },
    testType: {
      type: String,
      enum: ["CT Scan", "X-Ray", "MRI", "Ultrasound"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Test", testSchema);
