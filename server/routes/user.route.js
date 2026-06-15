import express from "express";
import { register, login, getProfile, updateProfile, deleteProfilePic, getAllUsers, unlockExam, payCertificate, saveExamResult } from "../controllers/user.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/register", register);
router.post("/login", login);
router.route("/profile")
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.delete("/profile/image", protect, deleteProfilePic);

router.post("/unlock-exam", protect, unlockExam);
router.post("/pay-certificate", protect, payCertificate);
router.post("/results", protect, saveExamResult);

export default router;
