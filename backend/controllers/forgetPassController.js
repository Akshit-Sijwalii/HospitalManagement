import crypto from "crypto";
import nodemailer from "nodemailer";
import PasswordResetToken from "../modules/forgetPassModel.js";
import User from "../modules/userModel.js";
import Doctor from "../modules/doctorModel.js";
import bcrypt from "bcryptjs";

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hmsproject001@gmail.com",
    pass: "irjhfgfrdwtlzvwb",
  },
});

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Try finding in both collections
    const user = await User.findOne({ email });
    const doctor = await Doctor.findOne({ email });

    let identifiedUser = null;
    let userType = "";

    if (doctor && doctor.degree) {
      identifiedUser = doctor;
      userType = "doctor";
    } else if (user && !user.degree) {
      identifiedUser = user;
      userType = "user";
    } else {
      return res.status(404).json({ message: "User not found." });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await PasswordResetToken.create({
      email,
      userType,
      token,
    });
    // Put reset link of front end here narendra
    const resetLink = `https://yourfrontend.com/reset-password?token=${token}&userType=${userType}`;

  await transporter.sendMail({
      from: '"Hospital Management System" <hmsproject001@gmail.com>',
      to: email,
      subject: "Reset Your Password - Hospital Management System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/djdxfbfne/image/upload/v1746118450/HMS_mak4ty.png" alt="HMS Logo" style="width: 140px;">
          </div>
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Dear user,</p>
          <p>We received a request to reset your password for your Hospital Management System account.</p>
          <p>If you made this request, please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #28a745; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link will expire in <strong>1 hour</strong>. If you did not request this, please ignore this email.</p>
          <p style="margin-top: 40px; font-size: 14px; color: #888;">— Hospital Management System Team</p>
        </div>
      `,
    });

    res.status(200).json({ message: "Password reset email sent." });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Reset password function

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required." });
    }

    const tokenEntry = await PasswordResetToken.findOne({ token });

    if (!tokenEntry) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const { email, userType } = tokenEntry;

    const Model = userType === "doctor" ? Doctor : User;
    const user = await Model.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete used token
    await PasswordResetToken.deleteOne({ token });

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
