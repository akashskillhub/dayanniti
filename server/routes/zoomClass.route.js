import express from "express";
import {
  createZoomClass,
  getActiveZoomClasses,
  deleteZoomClass,
} from "../controllers/zoomClass.controller.js";

const router = express.Router();

router.route("/")
  .post(createZoomClass)
  .get(getActiveZoomClasses);

router.route("/:id")
  .delete(deleteZoomClass);

export default router;
