import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Tüm alanlar gereklidir" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Şifre en az 6 karakter olmalıdır" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Kullanıcı adı en az 3 karakter olmalıdır" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "E-posta zaten kullanılıyor" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ message: "Kullanıcı adı zaten kullanılıyor" });
    }

    const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;

    const user = new User({
      email,
      username,
      password,
      profileImage,
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error in register route:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Tüm alanlar gereklidir" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Geçersiz kimlik bilgileri" });

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Geçersiz kimlik bilgileri" });

    const token = generateToken(user._id);
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error in login route:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Update user password
router.put("/update-password", protectRoute, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Mevcut şifre ve yeni şifre gereklidir" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Yeni şifre en az 6 karakter olmalıdır" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Check if current password is correct
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({ message: "Mevcut şifre yanlış" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Şifre başarıyla güncellendi" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Update username
router.put("/update-username", protectRoute, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Kullanıcı adı gereklidir" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Kullanıcı adı en az 3 karakter olmalıdır" });
    }

    // Check if username already exists
    const existingUser = await User.findOne({
      username,
      _id: { $ne: req.user._id }, // Exclude current user
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    user.username = username;
    await user.save();

    // Return updated user info
    const updatedUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
    };

    res.json({
      message: "Kullanıcı adı başarıyla güncellendi",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

export default router;
