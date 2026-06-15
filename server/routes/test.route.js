import express from "express";
import { createTest, getTests, getTestById, deleteTest, updateTest } from "../controllers/test.controller.js";

const router = express.Router();

router.route("/")
  .post(createTest)
  .get(getTests);

router.route("/:id")
  .get(getTestById)
  .delete(deleteTest)
  .put(updateTest);

export default router;
