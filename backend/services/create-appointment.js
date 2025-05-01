import mongoose from "mongoose";
import doctorModel from "../modules/doctorModel.js";
import userModel from "../modules/userModel.js";
import appointmentModel from "../modules/appointmentModel.js";

export const createAppointment = async (
  { doctorId, patientId, bookingDate, startTime, endTime, reason },
  session
) => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    // 1. Create new appointment
    const newAppointment = new appointmentModel({
      doctorId,
      patientId,
      date: bookingDate,
      startTime: start,
      endTime: end,
      reason,
    });

    await newAppointment.save({ session });

    // 2. Optionally, add appointment ID to doctor's appointments array
    await doctorModel.findByIdAndUpdate(
      doctorId,
      { $push: { appointments: newAppointment._id } },
      { session }
    );

    return newAppointment;
  } catch (error) {
    throw error;
  }
};
