
import validator from "validator";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import doctorModel from "../modules/doctorModel.js";
import Appointment from "../modules/appointmentModel.js";
import patientModel from "../modules/userModel.js";
import { slotModel } from "../modules/slot.js";
import mongoose from "mongoose";

// ---------------------------- ADD DOCTOR ----------------------------
const addDoctor = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      slots,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    }

    const image = req.file;
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded.",
      });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password should be at least 8 characters",
      });
    }

    console.log(
      "---------------------------------slots------------------------------",
      slots
    );
    if (typeof slots == "string") {
      slots = JSON.parse(slots);
    }

    if (!Array.isArray(slots)) {
      return res
        .status(400)
        .json({ success: false, message: "slots must be a array" });
    }

    for (const slot of slots) {
      console.log(slot.day, slot.from, slot.to);
      if (!slot.day || !slot.from || !slot.to) {
        return res.status(400).json({
          success: false,
          message: "Each Slot must have day, from and to field",
        });
      }
    }

    const slotsToInsert = slots.map((slot) => ({
      day: slot.day,
      from: slot.from,
      to: slot.to,
    }));

    const insertedSlots = await slotModel.insertMany(slotsToInsert, {
      session,
    });

    let slotIds = insertedSlots.map((slot) => slot._id);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const imageFile = req.file;
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    const imagUrl = imageUpload.secure_url;

    const newDoctor = new doctorModel({
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: address,
      image: imagUrl,
      date: Date.now(),
      available_slots: slotIds,
    });

    await newDoctor.save({ session });
    await session.commitTransaction();
    session.endSession();
    res
      .status(201)
      .json({ success: true, message: "Doctor added successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------- REMOVE DOCTOR ----------------------------


const removeDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const result = await doctorModel.findByIdAndDelete(doctorId);

    if (!result)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    res
      .status(200)
      .json({ success: true, message: "Doctor removed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ---------------------------- LOGIN ADMIN ----------------------------
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { email, role: "admin" }, // ✅ Use object payload
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.json({ success: true, token });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------- ADMIN DASHBOARD DATA ----------------------------


const getAdminDashboard = async (req, res) => {
  try {
    const totalDoctors = await doctorModel.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const cancelledAppointments = await Appointment.countDocuments({
      status: "cancelled",
    });
    const patients = await patientModel.find();
    const appointments = await appointmentModel
      .find()
      .populate("doctorId")
      .populate("patientId");

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        totalDoctors,
        totalAppointments,
        cancelledAppointments,
        patients,
        appointments,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
  console.log(">> Dashboard route hit");
};

// ----------------all doctors----------------
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find().populate("available_slots"); // Fetch all doctors

    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ success: false, message: "Failed to fetch doctors" });
  }
};


// -----------------------get all appoinments -----------------------
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: "patientId",
        select: "name dob",
      })
      .populate({
        path: "doctorId",
        select: "name fees",
      });

    // Optional: Reshape data to include age and fees at top level (frontend-friendly)
    const formattedAppointments = appointments.map((appointment) => {
      const dob = appointment.patientId?.dob;
      const age = dob ? getAgeFromDOB(dob) : null;

      return {
        _id: appointment._id,
        patient: {
          name: appointment.patientId?.name,
          image: appointment.patientId?.image,
          age: age,
        },
        doctor: {
          name: appointment.doctorId?.name,
          image: appointment.doctorId?.image,
          specialization: appointment.doctorId?.specialization,
          fees: appointment.doctorId?.fees,
        },
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        reason: appointment.reason,
        status: appointment.status,
        createdAt: appointment.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      appointments: formattedAppointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching appointments",
    });
  }
};

// Helper function
function getAgeFromDOB(dob) {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}



export { 
  addDoctor,
  removeDoctor,
  loginAdmin,
  getAdminDashboard,
  getAllDoctors,
  getAllAppointments
};
