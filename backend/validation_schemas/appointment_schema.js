export const AppointmentSchema = {
  doctorId: {
    in: ["body"],
    notEmpty: {
      errorMessage: "doctor Id is Required.",
    },
  },
  patientId: {
    in: ["body"],
    notEmpty: {
      errorMessage: "patient Id is Required.",
    },
  },
  bookingDate: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Booking Date is Required.",
    },
  },
  startTime: {
    in: ["body"],
    notEmpty: {
      errorMessage: "start Time is Required.",
    },
  },
  endTime: {
    in: ["body"],
    notEmpty: {
      errorMessage: "end Time is Required.",
    },
  },
};
