import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Yetki token'ı yok, erişim reddedildi" });
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token)
      return res
        .status(401)
        .json({ message: "Yetki token'ı yok, erişim reddedildi" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "Token geçersiz" });

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({ message: "Token geçersiz" });
  }
};

export default protectRoute;
