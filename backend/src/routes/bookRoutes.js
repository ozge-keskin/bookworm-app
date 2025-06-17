import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";

const router = express.Router();

router.post("/test-upload", protectRoute, async (req, res) => {
  try {
    console.log("=== TEST UPLOAD REQUEST ===");
    console.log("User:", req.user._id);
    console.log("Request body keys:", Object.keys(req.body));
    console.log(
      "Request body sizes:",
      Object.keys(req.body).map(
        (key) =>
          `${key}: ${
            typeof req.body[key] === "string"
              ? req.body[key].length
              : typeof req.body[key]
          }`
      )
    );

    res.json({
      message: "Test successful",
      user: req.user._id,
      receivedFields: Object.keys(req.body),
    });
  } catch (error) {
    console.error("Test upload error:", error);
    res.status(500).json({ message: "Test failed: " + error.message });
  }
});

router.post("/", protectRoute, async (req, res) => {
  try {
    console.log("=== PDF UPLOAD REQUEST START ===");
    console.log("Received PDF upload request from user:", req.user._id);

    const {
      title,
      description,
      pdfBase64,
      pdfFileName,
      pdfSize,
      thumbnailImage,
    } = req.body;

    console.log("Request body fields:", {
      title: !!title ? title.substring(0, 50) + "..." : null,
      description: !!description ? description.substring(0, 50) + "..." : null,
      pdfBase64: !!pdfBase64 ? `${pdfBase64.length} characters` : null,
      pdfFileName,
      pdfSize,
      thumbnailImage: !!thumbnailImage
        ? `${thumbnailImage.length} characters`
        : null,
    });

    if (!pdfBase64 || !title || !description || !pdfFileName || !pdfSize) {
      console.log("❌ Missing required fields:", {
        pdfBase64: !!pdfBase64,
        title: !!title,
        description: !!description,
        pdfFileName: !!pdfFileName,
        pdfSize: !!pdfSize,
      });
      return res.status(400).json({ message: "Lütfen tüm alanları doldurun" });
    }
    console.log(
      "✅ All required fields present, uploading PDF to Cloudinary..."
    );

    let pdfUrl;
    try {
      const pdfUploadResponse = await cloudinary.uploader.upload(pdfBase64, {
        resource_type: "raw",
        folder: "pdfs",
      });
      pdfUrl = pdfUploadResponse.secure_url;
      console.log("✅ PDF uploaded successfully:", pdfUrl);
    } catch (pdfError) {
      console.error("❌ PDF upload failed:", pdfError.message);
      return res
        .status(400)
        .json({ message: "PDF yüklenirken hata oluştu: " + pdfError.message });
    }

    let thumbnailUrl = null;
    if (thumbnailImage) {
      console.log("📷 Uploading thumbnail to Cloudinary...");
      try {
        const thumbnailUploadResponse = await cloudinary.uploader.upload(
          thumbnailImage,
          {
            folder: "thumbnails",
            resource_type: "image",
          }
        );
        thumbnailUrl = thumbnailUploadResponse.secure_url;
        console.log("✅ Thumbnail uploaded successfully:", thumbnailUrl);
      } catch (thumbnailError) {
        console.error("❌ Thumbnail upload failed:", thumbnailError.message);
        console.log("📷 Continuing PDF upload without thumbnail...");
      }
    }

    console.log("💾 Saving book to database...");

    const newBook = new Book({
      title,
      description,
      pdfUrl,
      pdfFileName,
      pdfSize,
      thumbnailImage: thumbnailUrl,
      user: req.user._id,
    });

    await newBook.save();
    console.log("✅ PDF book saved to database with ID:", newBook._id);
    console.log("=== PDF UPLOAD SUCCESS ===");

    res.status(201).json(newBook);
  } catch (error) {
    console.log("=== PDF UPLOAD ERROR ===");
    console.error("❌ Error uploading PDF:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    if (error.name === "ValidationError") {
      console.log("❌ Validation error details:", error.errors);
      return res
        .status(400)
        .json({ message: "Geçersiz veri: " + error.message });
    }
    if (error.message && error.message.includes("cloudinary")) {
      console.log("❌ Cloudinary error");
      return res
        .status(400)
        .json({ message: "PDF yüklenirken hata oluştu: " + error.message });
    }
    if (error.http_code && error.http_code >= 400) {
      console.log("❌ Cloudinary HTTP error:", error.http_code, error.message);
      return res
        .status(400)
        .json({ message: "Cloudinary hatası: " + error.message });
    }

    console.log("❌ Generic server error");
    res.status(500).json({
      message: "Sunucu hatası: " + (error.message || "Bilinmeyen hata"),
    });
  }
});

router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();
    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("Error in get all books route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(books);
  } catch (error) {
    console.error("Get user books error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorized" });

    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.log("Error deleting image from cloudinary", deleteError);
      }
    }    await book.deleteOne();
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update book route
router.put("/:id", protectRoute, async (req, res) => {
  try {
    console.log("📝 PUT /api/books/:id called");
    console.log("Book ID:", req.params.id);
    console.log("User ID:", req.user._id);
    console.log("Request body:", req.body);
    
    const { title, description } = req.body;
    
    if (!title || !title.trim()) {
      console.log("❌ Missing title");
      return res.status(400).json({ message: "Başlık gereklidir" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      console.log("❌ Book not found");
      return res.status(404).json({ message: "Kitap bulunamadı" });
    }

    console.log("📖 Found book:", book.title);
    console.log("📖 Book owner:", book.user);
    console.log("👤 Current user:", req.user._id);

    // Check if user owns this book
    if (book.user.toString() !== req.user._id.toString()) {
      console.log("❌ User doesn't own this book");
      return res.status(401).json({ message: "Bu kitabı düzenleme yetkiniz yok" });
    }

    // Update the book
    book.title = title.trim();
    book.description = description ? description.trim() : "";

    console.log("💾 Saving book with new data:", { title: book.title, description: book.description });
    await book.save();

    // Return updated book with user info
    const updatedBook = await Book.findById(book._id).populate("user", "username profileImage");
    
    console.log("✅ Book updated successfully");
    res.json({
      message: "Kitap başarıyla güncellendi",
      book: updatedBook
    });
  } catch (error) {
    console.error("❌ Error updating book", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

export default router;
