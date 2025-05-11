import appointmentModel from "../modules/appointmentModel.js";
import doctorModel from "../modules/doctorModel.js";
import userModel from "../modules/userModel.js";

export const checkAvailiablityBeforePayment = async ({
  doctorId,
  patientId,
  bookingDate,
  startTime,
  endTime,
}) => {
  try {
    const doctor = await doctorModel
      .findById(doctorId)
      .populate("available_slots");

    if (!doctor) {
      return { success: false, code: 404, message: "Doctor not found" };
    }

    const patient = await userModel.findById(patientId);

    if (!patient) {
      return { success: false, code: 404, message: "Patient not found" };
    }

    const bookingDay = new Date(bookingDate).toLocaleString("en-us", {
      weekday: "long",
    });

    // Check if the doctor has availability for the requested day
    const doctorAvailableSlot = doctor.available_slots.find(
      (slot) => slot.day === bookingDay
    );

    if (!doctorAvailableSlot) {
      return {
        success: false,
        code: 400,
        message: `Doctor not available on ${bookingDay}`,
      };
    }

    // Check if the requested time falls within the doctor's available slot
    const slotStartTime = doctorAvailableSlot.from;
    const slotEndTime = doctorAvailableSlot.to;
    const dummyDate = new Date().toISOString().split("T")[0]; // e.g., "2025-05-10"

    const requestedStart = new Date(`${dummyDate}T${startTime}:00`);
    const requestedEnd = new Date(`${dummyDate}T${endTime}:00`);
    const slotStart = new Date(`${dummyDate}T${slotStartTime}:00`);
    const slotEnd = new Date(`${dummyDate}T${slotEndTime}:00`);

    if (requestedStart < slotStart || requestedEnd > slotEnd) {
      return {
        success: false,
        code: 400,
        message: `Requested time is outside of doctor's available hours`,
      };
    }

    // 1. Check for overlapping appointments for same doctor
    const conflictingAppointment = await appointmentModel.findOne({
      doctorId,
      date: bookingDate,
      $or: [
        {
          startTime: { $lt: new Date(`${bookingDate}T${endTime}:00.000Z`) },
          endTime: { $gt: new Date(`${bookingDate}T${startTime}:00.000Z`) },
        },
      ],
      status: { $ne: "Cancelled" }, // ignore cancelled appointments
    });
    if (conflictingAppointment) {
      return {
        success: false,
        code: 409,
        message: "Time slot already booked by another patient",
      };
    }
    return { success: true };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
