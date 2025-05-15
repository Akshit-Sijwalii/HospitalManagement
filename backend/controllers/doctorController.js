import doctorModel from "../modules/doctorModel.js";
import appointmentModel from "../modules/appointmentModel.js"; // You need this model
// import nurseModel from "../modules/nurseModel.js"; // You need this model
import patientModel from "../modules/userModel.js"; // You need this model
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 🩺 View Scheduled Appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    // Optional: Verify the requesting doctor is the same as the one in token
    if (req.user.id !== doctorId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const doctor = await doctorModel.findById(doctorId).populate({
      path: "appointments",
      populate: { path: "patientId", select: "name email" },
    });

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, appointments: doctor.appointments });
  } catch (error) {
    console.error("Error fetching appointments", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🧑‍⚕️ Doctor Login
const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res
        .status(401)
        .json({ success: false, message: "Doctor is Not Yet Registered." });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default doctorLogin;

// // 🧑‍⚕️ Appoint Nurse to Patient
// const assignNurseToPatient = async (req, res) => {
//   try {
//     const { doctorId, patientId, nurseId } = req.body;

//     // validate
//     const doctor = await doctorModel.findById(doctorId);
//     const nurse = await nurseModel.findById(nurseId);
//     const patient = await patientModel.findById(patientId);

//     if (!doctor || !nurse || !patient) {
//       return res.status(404).json({ success: false, message: "Invalid IDs" });
//     }

//     doctor.assignedNurses.push({ patientId, nurseId });
//     await doctor.save();

//     res.status(200).json({ success: true, message: "Nurse appointed successfully" });
//   } catch (error) {
//     console.error("Error appointing nurse", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// ---------------------GetDoctorsById----------------------
export const getDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctor = await doctorModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch doctor" });
  }
};

// 🆕 Get top doctors based on experience
export const getTopDoctors = async (req, res) => {
  try {
    const topDoctors = await doctorModel
      .find()
      .sort({ experience: -1 }) // Sort by experience in descending order
      .limit(8); // Limit to top 20 doctors

    res.status(200).json(topDoctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch top doctors" });
  }
};

// 🆕 Get 2 related doctors based on speciality and highest experience
export const getRelatedDoctors = async (req, res) => {
  try {
    const { speciality } = req.params;

    const relatedDoctors = await doctorModel
      .find({ speciality })
      .sort({ experience: -1 }) // Sort by experience (highest first)
      .limit(2); // Only 2 doctors

    res.status(200).json(relatedDoctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch related doctors" });
  }
};

// 🆕 Get doctors by speciality
export const getDoctorsBySpeciality = async (req, res) => {
  try {
    const { speciality } = req.params;

    const doctors = await doctorModel.find({ speciality });

    res.status(200).json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch doctors by speciality" });
  }
};

export { getDoctorAppointments, doctorLogin };
