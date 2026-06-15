import ZoomClass from "../models/zoomClass.model.js";
import asyncHandler from "express-async-handler";

// @desc    Create a new zoom class link
// @route   POST /api/zoom-classes
// @access  Private/Admin
export const createZoomClass = asyncHandler(async (req, res) => {
  const { subject, zoomLink, startTime, endTime, std } = req.body;

  if (!subject || !zoomLink || !startTime || !endTime) {
    res.status(400);
    throw new Error("Please fill in all fields (subject, zoomLink, startTime, endTime)");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (end <= start) {
    res.status(400);
    throw new Error("End time must be after start time");
  }

  if (end <= now) {
    res.status(400);
    throw new Error("Class end time must be in the future");
  }

  const zoomClass = await ZoomClass.create({
    subject,
    zoomLink,
    startTime: start,
    endTime: end,
    std: std || "All",
    createdBy: req.body.createdBy, // Optional if req.user is set or read from request body
  });

  if (zoomClass) {
    req.app.get("io").emit("class_added", zoomClass);
    res.status(201).json(zoomClass);
  } else {
    res.status(400);
    throw new Error("Invalid zoom class data");
  }
});

// @desc    Get all active zoom classes
// @route   GET /api/zoom-classes
// @access  Public
export const getActiveZoomClasses = asyncHandler(async (req, res) => {
  const now = new Date();

  // 1. Perform automatic clean up of expired classes
  try {
    await ZoomClass.deleteMany({ endTime: { $lte: now } });
  } catch (error) {
    console.error("Error cleaning up expired Zoom classes:", error);
  }

  // 2. Fetch and return current and future classes
  const activeClasses = await ZoomClass.find({
    endTime: { $gt: now },
  }).sort({ startTime: 1 });

  res.json(activeClasses);
});

// @desc    Delete a zoom class manually
// @route   DELETE /api/zoom-classes/:id
// @access  Private/Admin
export const deleteZoomClass = asyncHandler(async (req, res) => {
  const zoomClass = await ZoomClass.findById(req.params.id);

  if (zoomClass) {
    await zoomClass.deleteOne();
    req.app.get("io").emit("class_deleted", req.params.id);
    res.json({ message: "Zoom class link deleted successfully" });
  } else {
    res.status(404);
    throw new Error("Zoom class link not found");
  }
});
