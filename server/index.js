import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import examRoutes from "./routes/exam.route.js";
import testRoutes from "./routes/test.route.js";
import contactRoutes from "./routes/contact.route.js";
import uploadRoutes from "./routes/upload.route.js";
import zoomClassRoutes from "./routes/zoomClass.route.js";
import testInquiryRoutes from "./routes/testInquiry.route.js";
import syllabusRoutes from "./routes/syllabus.route.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = process.env.VERCEL
  ? "/tmp/uploads"
  : path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "DnyanNiti API Server" });
});

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

if (!process.env.VERCEL) {
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    console.log(`📡 Socket connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("🌟 MongoDB Connected Successfully!");
      httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Backend Server is running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.log("❌ Error connecting to MongoDB:", error.message);
    });
} else {
  const mockIo = { emit: () => {} };
  app.set("io", mockIo);

  mongoose.connect(process.env.MONGO_URI).catch(() => {});
}

export default app;
