import express from "express";
import {
  submitTestInquiry,
  getTestInquiries,
} from "../controllers/testInquiry.controller.js";

const router = express.Router();

router.route("/")
  .post(submitTestInquiry)
  .get(getTestInquiries);

export default router;
