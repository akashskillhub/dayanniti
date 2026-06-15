import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure the uploads directory exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save to the uploads folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Extract original extension
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image file."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// POST endpoint for image upload
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image provided" });
  }

  // Construct the URL path to the file.
  // In development/production, this assumes your Express server serves static files from /uploads
  const imageUrl = `/uploads/${req.file.filename}`;
  
  res.status(200).json({
    message: "Image uploaded successfully",
    url: imageUrl,
  });
});

// Setup multer for PDF uploads (larger limit and pdf-only filter)
const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save to the uploads folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "syllabus-" + uniqueSuffix + ext);
  },
});

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const uploadPdf = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit for syllabus PDFs
});

// POST endpoint for PDF upload
router.post("/pdf", uploadPdf.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No PDF file provided" });
  }

  const pdfUrl = `/uploads/${req.file.filename}`;
  
  res.status(200).json({
    message: "PDF uploaded successfully",
    url: pdfUrl,
    name: req.file.originalname,
  });
});

export default router;
