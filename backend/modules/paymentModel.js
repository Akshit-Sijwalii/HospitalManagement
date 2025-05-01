import mongoose from "mongoose";

const paymentSchema = mongoose.Schema({
  paymentId: String,
  orderId: String,
  signature: String,
  amount: Number,
  currency: String,
  status: String,
  method: String,
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor",
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "appointment",
  },
});

const paymentModel =
  mongoose.models.payment || mongoose.model("payment", paymentSchema);
export default paymentModel;
