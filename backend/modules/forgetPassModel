import mongoose from "mongoose";

const passwordResetTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  userType: { type: String, enum: ["user", "doctor"], required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // expires in 1 hour
});

const PasswordResetToken = mongoose.model("PasswordResetToken", passwordResetTokenSchema);

export default PasswordResetToken;
