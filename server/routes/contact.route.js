import express from "express";
import { submitInquiry, getInquiries, markAsRead } from "../controllers/contact.controller.js";

const router = express.Router();

router.route("/")
  .post(submitInquiry)
  .get(getInquiries);

router.put("/:id/read", markAsRead);

export default router;
