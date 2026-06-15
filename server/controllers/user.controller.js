import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import fs from "fs";
import path from "path";

export const register = asyncHandler(async (req, res) => {
  const { 
    name, email, password, age, mobile, schoolName, std, 
    district, taluka, village, teacherName, teacherContact 
  } = req.body;

  if (!name || !email || !password || !mobile) {
    res.status(400);
    throw new Error("Please fill in all required fields (Name, Email, Password, Mobile)");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    age,
    mobile,
    schoolName,
    std,
    district,
    taluka,
    village,
    teacherName,
    teacherContact,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      std: user.std,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      std: user.std,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

export const updateProfile = asyncHandler(async (req, res) => {
  console.log('🔧 updateProfile called', { userId: req.user?._id, body: req.body });
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.age = req.body.age || user.age;
    user.mobile = req.body.mobile || user.mobile;
    user.schoolName = req.body.schoolName || user.schoolName;
    user.std = req.body.std || user.std;
    user.district = req.body.district || user.district;
    user.taluka = req.body.taluka || user.taluka;
    user.village = req.body.village || user.village;
    user.teacherName = req.body.teacherName || user.teacherName;
    user.teacherContact = req.body.teacherContact || user.teacherContact;

    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    }

    if (req.body.password) {
      if (!req.body.oldPassword) {
        res.status(400);
        throw new Error('Old password is required to change password');
      }
      // Guard: ensure stored password exists before comparing
      if (!user.password) {
        console.error('🔧 updateProfile error: user.password missing for user', user._id);
        res.status(400);
        throw new Error('User does not have a password set');
      }
      console.log('🔧 Password change attempt: oldPassword provided, hashing new password');
      console.log('🔧 Stored hash length:', user.password?.length);
      try {
        const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
        console.log('🔧 bcrypt.compare result:', isMatch);
        if (!isMatch) {
          res.status(400);
          throw new Error('Invalid old password');
        }
      } catch (err) {
        console.error('🔧 bcrypt compare failed:', err);
        res.status(500);
        throw new Error('Password verification failed');
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
      console.log('🔧 New password hashed');
    }

    let updatedUser;
    try {
      updatedUser = await user.save();
    } catch (saveErr) {
      console.error('🔧 Save user failed:', saveErr);
      res.status(500);
      throw new Error('Failed to update profile');
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      std: updatedUser.std,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.json(users);
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      mobile: user.mobile,
      schoolName: user.schoolName,
      std: user.std,
      district: user.district,
      taluka: user.taluka,
      village: user.village,
      teacherName: user.teacherName,
      teacherContact: user.teacherContact,
      profilePic: user.profilePic,
      unlockedExams: user.unlockedExams || [],
      paidCertificates: user.paidCertificates || [],
      examResults: user.examResults || [],
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Unlock an exam after payment
// @route   POST /api/users/unlock-exam
// @access  Private
export const unlockExam = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const { examId } = req.body;
  if (!examId) {
    res.status(400);
    throw new Error("Exam ID is required");
  }
  if (!user.unlockedExams) {
    user.unlockedExams = [];
  }
  const stringExams = user.unlockedExams.map(id => id.toString());
  if (!stringExams.includes(examId.toString())) {
    user.unlockedExams.push(examId);
    await user.save();
  }
  res.json({ message: "Exam unlocked successfully", unlockedExams: user.unlockedExams });
});

// @desc    Mark certificate as paid after payment
// @route   POST /api/users/pay-certificate
// @access  Private
export const payCertificate = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const { examId } = req.body;
  if (!examId) {
    res.status(400);
    throw new Error("Exam ID is required");
  }
  if (!user.paidCertificates) {
    user.paidCertificates = [];
  }
  const stringCertificates = user.paidCertificates.map(id => id.toString());
  if (!stringCertificates.includes(examId.toString())) {
    user.paidCertificates.push(examId);
    await user.save();
  }
  res.json({ message: "Certificate payment recorded successfully", paidCertificates: user.paidCertificates });
});

// @desc    Save exam result on submission
// @route   POST /api/users/results
// @access  Private
export const saveExamResult = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const { examId, score, totalMarks, percentage, passed } = req.body;
  if (!examId || score === undefined || !totalMarks) {
    res.status(400);
    throw new Error("Exam ID, score and totalMarks are required");
  }
  if (!user.examResults) {
    user.examResults = [];
  }
  user.examResults.push({
    examId,
    score,
    totalMarks,
    percentage,
    passed
  });
  await user.save();
  res.json({ message: "Exam result saved successfully", examResults: user.examResults });
});

export const deleteProfilePic = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (user.profilePic) {
      const filePath = path.join(path.resolve(), user.profilePic);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Failed to delete file:", err);
        }
      }
      user.profilePic = "";
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        std: updatedUser.std,
      });
    } else {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        std: user.std,
      });
    }
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
