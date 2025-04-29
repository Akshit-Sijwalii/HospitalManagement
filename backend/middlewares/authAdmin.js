import jwt from "jsonwebtoken";


const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(atoken, process.env.JWT_SECRET);

    // Optional: You can check if it's the right admin
    if (decoded.role !== "admin" || decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Invalid admin credentials.",
      });
    }

    next();
  } catch (error) {
    res.status(403).json({ success: false, message: error.message });
  }
};

export default authAdmin;
