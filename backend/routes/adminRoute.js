import express from "express";
import {
  addDoctor,
  loginAdmin,
  removeDoctor,
  getAdminDashboard,
  getAllDoctors,
  getAllAppointments
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";

const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin); // ❗ Login is open

// ❗ Protected Routes
adminRouter.post("/add-doctor",authAdmin,upload.single("image"),addDoctor);
adminRouter.delete("/remove-doctor/:doctorId", authAdmin, removeDoctor);
adminRouter.get("/dashboard", authAdmin, getAdminDashboard);
adminRouter.get("/all/doc", authAdmin, getAllDoctors); 
adminRouter.get("/all-appointments",authAdmin,getAllAppointments)

export default adminRouter;
