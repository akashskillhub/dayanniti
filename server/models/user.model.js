import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    profilePic: {
      type: String,
      default: "",
    },
    age: { type: Number },
    mobile: { type: String, required: true },
    schoolName: { type: String },
    std: { type: String },
    district: { type: String },
    taluka: { type: String },
    village: { type: String },
    teacherName: { type: String },
    teacherContact: { type: String },
    unlockedExams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
    paidCertificates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
    examResults: [
      {
        examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
        score: { type: Number, required: true },
        totalMarks: { type: Number, required: true },
        percentage: { type: Number, required: true },
        passed: { type: Boolean, required: true },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
