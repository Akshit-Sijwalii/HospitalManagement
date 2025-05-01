import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../modules/userModel.js";
import mongoose from "mongoose";
import appointmentModel from "../modules/appointmentModel.js";
import doctorModel from "../modules/doctorModel.js";
import userModel from "../modules/userModel.js";
import { createAppointment } from "../services/create-appointment.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ message: "Patient Register Successfully." });

    // res.status(201).json({ token, user: { id: user._id, name, email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "User is not Yet Registered." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const bookAppointments = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const appointment = await createAppointment(req.body, session);
    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({ success: true, appointment });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: e.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Check if the patientId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid patientId format." });
    }

    const patient = await userModel.findById(patientId);

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, error: "Patient Not Found!" });
    }

    if (!["Upcoming", "Ongoing", "Completed"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status." });
    }

    const now = new Date();
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Remove time part
    today.setDate(today.getDate() + 1);

    let matchCondition = {
      patientId: new mongoose.Types.ObjectId(patientId),
      status: { $ne: "Cancelled" },
    };

    if (status === "Upcoming") {
      matchCondition.date = { $gt: today };
    } else if (status === "Ongoing") {
      matchCondition.date = today;
    } else if (status === "Completed") {
      matchCondition.date = { $lt: today };
    }

    const appointments = await appointmentModel
      .find(matchCondition)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ date: 1 });

    const total = await appointmentModel.countDocuments(matchCondition);

    return res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
