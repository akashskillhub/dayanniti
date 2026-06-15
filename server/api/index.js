import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const mockIo = { emit: () => {} };

import userRoutes from "../routes/user.route.js";
import adminRoutes from "../routes/admin.route.js";
import authRoutes from "../routes/auth.route.js";
import examRoutes from "../routes/exam.route.js";
import testRoutes from "../routes/test.route.js";
import contactRoutes from "../routes/contact.route.js";
import uploadRoutes from "../routes/upload.route.js";
import zoomClassRoutes from "../routes/zoomClass.route.js";
import testInquiryRoutes from "../routes/testInquiry.route.js";
import syllabusRoutes from "../routes/syllabus.route.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("io", mockIo);

const uploadDir = process.env.VERCEL
  ? "/tmp/uploads"
  : path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));

app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/zoom-classes", zoomClassRoutes);
app.use("/api/test-inquiries", testInquiryRoutes);
app.use("/api/syllabus", syllabusRoutes);

app.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

export default app;
