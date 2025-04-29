import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

// Import Routers
import adminRouter from "./routes/adminRoute.js";
import userRouter from "./routes/userRoute.js";
import testRouter from "./routes/testRoute.js";
// import prescriptionRouter from "./routes/prescriptionRoutes.js";
// import ambulanceRouter from "./routes/ambulanceRoutes.js";
import doctorRouter from "./routes/doctorRoute.js";
import { updateAppointmentStatus } from "./cron/updateAppointmentStatus.js";

//---------------------------------------- App Config ----------------------------------------
const app = express();
const port = process.env.PORT || 5000;
connectDB();
connectCloudinary();
updateAppointmentStatus();

//---------------------------------------- Middleware ----------------------------------------
app.use(cors());
app.use(express.json());

//---------------------------------------- API Endpoints ----------------------------------------
app.get("/", (req, res) => {
  return res.json({ message: "narendra ne top kr diya!" });
});
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/tests", testRouter);
// app.use('/api/prescriptions', prescriptionRouter);
// app.use('/api/ambulances', ambulanceRouter);
app.use("/api/doctor", doctorRouter);

//---------------------------------------- Server Start ----------------------------------------
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
