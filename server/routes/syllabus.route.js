import express from "express";
import {
  createSyllabus,
  getSyllabusList,
  deleteSyllabus,
} from "../controllers/syllabus.controller.js";

const router = express.Router();

router.route("/")
  .post(createSyllabus)
  .get(getSyllabusList);

router.route("/:id")
  .delete(deleteSyllabus);

export default router;
