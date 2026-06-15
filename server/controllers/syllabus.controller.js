import Syllabus from "../models/syllabus.model.js";
import asyncHandler from "express-async-handler";
import fs from "fs";
import path from "path";

// @desc    Create a new syllabus entry
// @route   POST /api/syllabus
// @access  Private/Admin
export const createSyllabus = asyncHandler(async (req, res) => {
  const { std, subject, pdfUrl, pdfName, createdBy } = req.body;

  if (!std || !subject || !pdfUrl || !pdfName) {
    res.status(400);
    throw new Error("Please fill in all fields (std, subject, pdfUrl, pdfName)");
  }

  const syllabus = await Syllabus.create({
    std,
    subject,
    pdfUrl,
    pdfName,
    createdBy,
  });

  if (syllabus) {
    req.app.get("io").emit("syllabus_added", syllabus);
    res.status(201).json(syllabus);
  } else {
    res.status(400);
    throw new Error("Invalid syllabus data");
  }
});

// @desc    Get all syllabus entries
// @route   GET /api/syllabus
// @access  Public
export const getSyllabusList = asyncHandler(async (req, res) => {
  const syllabusList = await Syllabus.find({}).sort({ createdAt: -1 });
  res.json(syllabusList);
});

// @desc    Delete a syllabus entry and its associated PDF file
// @route   DELETE /api/syllabus/:id
// @access  Private/Admin
export const deleteSyllabus = asyncHandler(async (req, res) => {
  const syllabus = await Syllabus.findById(req.params.id);

  if (syllabus) {
    // Delete the file from the uploads directory if it exists
    if (syllabus.pdfUrl) {
      try {
        const filename = path.basename(syllabus.pdfUrl);
        const uploadDir = process.env.VERCEL ? "/tmp/uploads" : path.resolve("uploads");
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted file: ${filePath}`);
        }
      } catch (err) {
        console.error("Error deleting physical PDF file:", err);
      }
    }

    await syllabus.deleteOne();
    req.app.get("io").emit("syllabus_deleted", req.params.id);
    res.json({ message: "Syllabus entry and physical file deleted successfully" });
  } else {
    res.status(404);
    throw new Error("Syllabus entry not found");
  }
});
