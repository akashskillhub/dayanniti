import mongoose from "mongoose";

const testInquirySchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    testTitle: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    whyChoose: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    medicalHistory: {
      type: String,
    },
    educationLevel: {
      type: String,
    },
    additionalInfo: {
      type: String,
    },
  },
  { timestamps: true }
);

const TestInquiry = mongoose.model("TestInquiry", testInquirySchema);
export default TestInquiry;
