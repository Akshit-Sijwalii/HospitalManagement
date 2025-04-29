import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../modules/userModel.js";
import mongoose from "mongoose";
import appointmentModel from "../modules/appointmentModel.js";
import doctorModel from "../modules/doctorModel.js";
import userModel from "../modules/userModel.js";

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
    const { doctorId, patientId, bookingDate, startTime, endTime, reason } =
      req.body;

    //check if doctor is available at that time slot

    const doctor = await doctorModel
      .findById(doctorId)
      .populate("available_slots");

    if (!doctor) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, error: "No Doctor Found." });
    }

    // Convert startTime and endTime to Date objects
    const start = new Date(startTime);
    const end = new Date(endTime);

    const bookingDay = new Date(bookingDate).toLocaleString("en-us", {
      weekday: "long",
    });

    // Check if the doctor has availability for the requested day
    const doctorAvailableSlot = doctor.available_slots.find(
      (slot) => slot.day === bookingDay
    );

    if (!doctorAvailableSlot) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: `Doctor Not Available on ${bookingDay}. `,
      });
    }

    // Check if the requested time falls within the doctor's available slot
    const slotStartTime = new Date(doctorAvailableSlot.from);
    const slotEndTime = new Date(doctorAvailableSlot.to);

    if (start < slotStartTime || end > slotEndTime) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Requested time is outside of the doctor's available hours.`,
      });
    }

    // 1. Check for overlapping appointments for same doctor
    const conflictingAppointment = await appointmentModel.findOne({
      doctorId,
      date: bookingDate,
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start },
        },
      ],
      status: { $ne: "Cancelled" }, // ignore cancelled appointments
    });
    if (conflictingAppointment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: "Time slot already booked by another patient.",
      });
    }

    // 2. Create new appointment
    const newAppointment = new appointmentModel({
      doctorId,
      patientId,
      date: bookingDate,
      startTime: start,
      endTime: end,
      reason,
    });

    await newAppointment.save({ session });

    // 3. Optionally, add appointment ID to doctor's appointments array
    await doctorModel.findByIdAndUpdate(
      doctorId,
      { $push: { appointments: newAppointment._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: true, appointment: newAppointment });
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
