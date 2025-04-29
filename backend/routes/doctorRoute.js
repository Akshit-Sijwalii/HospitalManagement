import express from "express";
import {
  getDoctorAppointments,
  doctorLogin,
  getAllDoctors,
  getDoctorById,
  getTopDoctors,
  getRelatedDoctors,
  getDoctorsBySpeciality,
  // assignNurseToPatient
} from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js"; // Auth middleware

const router = express.Router();

// 🔐 Login
router.post("/login", doctorLogin);

// View Appointments
router.get("/appointments/:doctorId", authDoctor, getDoctorAppointments);

// 🆕 Get all doctors
router.get("/all/doc", getAllDoctors);

// 🆕 Get doctor by ID
router.get("/doc/:id", getDoctorById);

// 🆕 Get top doctors
router.get("/top/doctors", getTopDoctors);

// 🆕 Get related doctors by speciality
router.get("/related/:speciality", getRelatedDoctors);

// Important Tip:
// If speciality names might have spaces (e.g., "Heart Surgeon"), you should encode it in URL like
//  Heart%20Surgeon or accept it in the body (POST method).

// 🆕 Get doctors by speciality
router.get("/speciality/:speciality", getDoctorsBySpeciality);


// Assign nurse
// router.post("/assign-nurse", authDoctor, assignNurseToPatient);

export default router;
