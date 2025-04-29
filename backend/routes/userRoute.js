import express from "express";
import {
  register,
  login,
  bookAppointments,
  getAppointments,
} from "../controllers/userController.js";
import { checkSchema } from "express-validator";
import { runValidation } from "../validation/validation_run.js";
import { AppointmentSchema } from "../validation_schemas/appointment_schema.js";
import { authUser } from "../middlewares/authUser.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post(
  "/bookAppointments",
  authUser,
  checkSchema(AppointmentSchema),
  runValidation,
  bookAppointments
);

router.get("/getAppointments/:patientId", authUser, getAppointments);

export default router;
