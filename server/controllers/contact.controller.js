import ContactInquiry from "../models/contactInquiry.model.js";
import asyncHandler from "express-async-handler";

// @desc    Submit a contact inquiry
// @route   POST /api/contact
// @access  Public
export const submitInquiry = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  const inquiry = await ContactInquiry.create({
    name,
    email,
    subject,
    message,
  });

  if (inquiry) {
    res.status(201).json({ message: "Inquiry submitted successfully" });
  } else {
    res.status(400);
    throw new Error("Invalid inquiry data");
  }
});

// @desc    Get all inquiries
// @route   GET /api/contact
// @access  Private/Admin
export const getInquiries = asyncHandler(async (req, res) => {
  const inquiries = await ContactInquiry.find({}).sort({ createdAt: -1 });
  res.json(inquiries);
});

// @desc    Mark inquiry as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
export const markAsRead = asyncHandler(async (req, res) => {
  const inquiry = await ContactInquiry.findById(req.params.id);

  if (inquiry) {
    inquiry.isRead = true;
    await inquiry.save();
    res.json(inquiry);
  } else {
    res.status(404);
    throw new Error("Inquiry not found");
  }
});
