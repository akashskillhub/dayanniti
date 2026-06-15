import mongoose from "mongoose";

const testQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionImage: { type: String }, // Optional image for the question
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String }, // Optional explanation text
  explanationImage: { type: String }, // Optional explanation image
});

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    testCode: { type: String },
    description: { type: String },
    author: { type: String },
    ageRange: { type: String },
    administration: { type: String }, // GROUP, INDIVIDUAL, etc.
    language: { type: String },
    category: { type: String },
    questions: [testQuestionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const Test = mongoose.model("Test", testSchema);
export default Test;
