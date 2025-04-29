import express from "express";
import {
  addDoctor,
  loginAdmin,
  removeDoctor,
  getAdminDashboard,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";

const adminRouter = express.Router();

adminRouter.post(
  "/add-doctor",
  authAdmin,

  upload.single("image"),

  addDoctor
);
adminRouter.post("/login", loginAdmin);
adminRouter.delete("/remove-doctor/:doctorId", authAdmin, removeDoctor);
adminRouter.get("/dashboard", authAdmin, getAdminDashboard);
adminRouter.get("/prince", (req, res) => {
  return res.json({ redirect: "redirect ho gye na" });
});

export default adminRouter;
