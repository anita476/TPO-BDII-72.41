import express from "express";
import {
  listPolicy,
  getPolicy,
  createPolicy,
} from "../controllers/polizasController.js";

const router = express.Router();

router.get("/", listPolicy);
router.get("/:id", getPolicy);
router.post("/", createPolicy);

export default router;
