import Exam from "../models/exam.model.js";
import asyncHandler from "express-async-handler";

// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private/Admin
export const createExam = asyncHandler(async (req, res) => {
  const { title, description, duration, totalMarks, questions, std } = req.body;

  const exam = await Exam.create({
    title,
    description,
    duration,
    totalMarks,
    questions,
    createdBy: req.user?._id, // Assuming auth middleware sets req.user
    std,
  });

  if (exam) {
    req.app.get("io").emit("exam_added", exam);
    res.status(201).json(exam);
  } else {
    res.status(400);
    throw new Error("Invalid exam data");
  }
});

// @desc    Get all exams
// @route   GET /api/exams
// @access  Public (or Private depending on needs)
export const getExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find({});
  res.json(exams);
});

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Private
export const getExamById = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (exam) {
    res.json(exam);
  } else {
    res.status(404);
    throw new Error("Exam not found");
  }
});

// @desc    Delete an exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin
export const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (exam) {
    await exam.deleteOne();
    req.app.get("io").emit("exam_deleted", req.params.id);
    res.json({ message: "Exam removed" });
  } else {
    res.status(404);
    throw new Error("Exam not found");
  }
});

// @desc    Update an exam
// @route   PUT /api/exams/:id
// @access  Private/Admin
export const updateExam = asyncHandler(async (req, res) => {
  const { title, description, duration, totalMarks, questions, std } = req.body;

  const exam = await Exam.findById(req.params.id);

  if (exam) {
    exam.title = title || exam.title;
    exam.description = description || exam.description;
    exam.duration = duration || exam.duration;
    exam.totalMarks = totalMarks || exam.totalMarks;
    exam.questions = questions || exam.questions;
    exam.std = std !== undefined ? std : exam.std;

    const updatedExam = await exam.save();
    req.app.get("io").emit("exam_updated", updatedExam);
    res.json(updatedExam);
  } else {
    res.status(404);
    throw new Error("Exam not found");
  }
});
