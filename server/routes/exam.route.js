import express from "express";
import { createExam, getExams, getExamById, deleteExam, updateExam } from "../controllers/exam.controller.js";

const router = express.Router();

router.route("/")
  .post(createExam)
  .get(getExams);

router.route("/:id")
  .get(getExamById)
  .delete(deleteExam)
  .put(updateExam);

export default router;
