import mongoose from "mongoose";

const syllabusSchema = new mongoose.Schema(
  {
    std: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    pdfUrl: {
      type: String,
      required: true,
    },
    pdfName: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

const Syllabus = mongoose.model("Syllabus", syllabusSchema);
export default Syllabus;
