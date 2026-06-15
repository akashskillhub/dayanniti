import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
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

import path from "path";

const __dirname = path.resolve();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`📡 Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

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

// Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🌟 MongoDB Connected Successfully!");
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Backend Server is running on http://localhost:${PORT}`);
      console.log(`✅ Ready to handle API requests!`);
    });
  })
  .catch((error) => {
    console.log("❌ Error connecting to MongoDB:", error.message);
  });

// Trigger reload to load new env port 5050
