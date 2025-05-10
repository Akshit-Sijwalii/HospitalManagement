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
      return {
        success: false,
        code: 400,
        message: `Doctor not available on ${bookingDay}`,
      };
    }

    // Check if the requested time falls within the doctor's available slot
    const slotStartTime = new Date(doctorAvailableSlot.from);
    const slotEndTime = new Date(doctorAvailableSlot.to);

    const requestedStart = new Date(startTime);
    const requestedEnd = new Date(endTime);

    const slotStartParts = doctorAvailableSlot.from.split(":");
    const slotEndParts = doctorAvailableSlot.to.split(":");

    const slotStart = requestedStart.setHours(
      slotStartParts[0],
      slotStartParts[1],
      0,
      0
    );
    const slotEnd = requestedStart.setHours(
      slotEndParts[0],
      slotEndParts[1],
      0,
      0
    );

    const reqStart = requestedStart.getTime();
    const reqEnd = requestedEnd.getTime();

    if (reqStart < slotStart || reqEnd > slotEnd) {
      return {
        success: false,
        code: 400,
        message: `Requested time is outside of doctor's available hours`,
      };
    }

    // if (start < slotStartTime || end > slotEndTime) {
    //   return {
    //     success: false,
    //     code: 400,
    //     message: `Requested time is outside of doctor's available hours`,
    //   };
    // }

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
