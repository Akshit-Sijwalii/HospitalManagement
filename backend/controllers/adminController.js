// adminController.js
import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import doctorModel from "../modules/doctorModel.js";
import appointmentModel from "../modules/appointmentModel.js";
import patientModel from "../modules/userModel.js";
import { slotModel } from "../modules/slot.js";
import mongoose from "mongoose";
// import roomModel from "../modules/roomModel.js";
// import nurseModel from "../modules/nurseModel.js";

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
    // const totalNurses = 0; // await nurseModel.countDocuments();
    const totalAppointments = await appointmentModel.countDocuments();
    const cancelledAppointments = await appointmentModel.countDocuments({
      status: "cancelled",
    });
    // const bookedRooms = 0; // await roomModel.countDocuments({ status: "booked" });
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

export { addDoctor, removeDoctor, loginAdmin, getAdminDashboard };
