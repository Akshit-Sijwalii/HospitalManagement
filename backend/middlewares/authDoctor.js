import jwt from "jsonwebtoken";
import doctorModel from "../modules/doctorModel.js";

const authDoctor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const doctor = await doctorModel.findById(decoded.id);
    if (!doctor) {
      return res.status(401).json({ success: false, message: "Doctor not found" });
    }

    req.doctor = doctor;
    req.user = decoded; // optionally attach decoded info for ID comparison

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized: " + error.message });
  }
};

export default authDoctor;
