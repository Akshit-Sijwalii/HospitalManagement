import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

// Import Routers
import adminRouter from "./routes/adminRoute.js";
import Forgetrouter from "./routes/forgetPassRoute.js";
import userRouter from "./routes/userRoute.js";
import testRouter from "./routes/testRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import { updateAppointmentStatus } from "./cron/updateAppointmentStatus.js";
import paymentRouter from "./routes/paymentRoute.js";

//---------------------------------------- App Config ----------------------------------------
const app = express();
const port = process.env.PORT || 5000;
connectDB();
connectCloudinary();
updateAppointmentStatus();

//---------------------------------------- Middleware ----------------------------------------
app.use(
  cors({
    origin: "*", // Or set to your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

//---------------------------------------- API Endpoints ----------------------------------------

app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/tests", testRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/changepassword", Forgetrouter);

//---------------------------------------- Server Start ----------------------------------------
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
