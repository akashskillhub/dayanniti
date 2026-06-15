import TestInquiry from "../models/testInquiry.model.js";
import asyncHandler from "express-async-handler";

// @desc    Submit a test inquiry
// @route   POST /api/test-inquiries
// @access  Public
export const submitTestInquiry = asyncHandler(async (req, res) => {
  const {
    testId,
    testTitle,
    name,
    email,
    password,
    whyChoose,
    age,
    medicalHistory,
    educationLevel,
    additionalInfo,
  } = req.body;

  if (!testId || !testTitle || !name || !email || !whyChoose) {
    res.status(400);
    throw new Error("Missing required fields (testId, testTitle, name, email, whyChoose)");
  }

  const inquiry = await TestInquiry.create({
    testId,
    testTitle,
    name,
    email,
    password,
    whyChoose,
    age,
    medicalHistory,
    educationLevel,
    additionalInfo,
  });

  if (inquiry) {
    res.status(201).json(inquiry);
  } else {
    res.status(400);
    throw new Error("Invalid inquiry data");
  }
});

// @desc    Get all test inquiries
// @route   GET /api/test-inquiries
// @access  Private/Admin
export const getTestInquiries = asyncHandler(async (req, res) => {
  const inquiries = await TestInquiry.find({}).sort({ createdAt: -1 });
  res.json(inquiries);
});
