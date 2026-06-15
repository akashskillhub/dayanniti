import Test from "../models/test.model.js";
import asyncHandler from "express-async-handler";

// @desc    Create a new test
// @route   POST /api/tests
// @access  Private/Admin
export const createTest = asyncHandler(async (req, res) => {
  const { testCode, title, description, author, ageRange, administration, language, category, questions } = req.body;

  const test = await Test.create({
    testCode,
    title,
    description,
    author,
    ageRange,
    administration,
    language,
    category,
    questions,
    createdBy: req.user?._id,
  });

  if (test) {
    res.status(201).json(test);
  } else {
    res.status(400);
    throw new Error("Invalid test data");
  }
});

// @desc    Get all tests
// @route   GET /api/tests
// @access  Public
export const getTests = asyncHandler(async (req, res) => {
  const tests = await Test.find({});
  res.json(tests);
});

// @desc    Get test by ID
// @route   GET /api/tests/:id
// @access  Public
export const getTestById = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (test) {
    res.json(test);
  } else {
    res.status(404);
    throw new Error("Test not found");
  }
});

// @desc    Delete a test
// @route   DELETE /api/tests/:id
// @access  Private/Admin
export const deleteTest = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (test) {
    await test.deleteOne();
    res.json({ message: "Test removed" });
  } else {
    res.status(404);
    throw new Error("Test not found");
  }
});

// @desc    Update a test
// @route   PUT /api/tests/:id
// @access  Private/Admin
export const updateTest = asyncHandler(async (req, res) => {
  const { testCode, title, description, author, ageRange, administration, language, category, questions } = req.body;

  const test = await Test.findById(req.params.id);

  if (test) {
    test.testCode = testCode !== undefined ? testCode : test.testCode;
    test.title = title || test.title;
    test.description = description || test.description;
    test.author = author || test.author;
    test.ageRange = ageRange || test.ageRange;
    test.administration = administration || test.administration;
    test.language = language || test.language;
    test.category = category || test.category;
    test.questions = questions || test.questions;

    const updatedTest = await test.save();
    res.json(updatedTest);
  } else {
    res.status(404);
    throw new Error("Test not found");
  }
});
