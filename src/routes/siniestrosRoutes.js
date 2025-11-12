import express from "express";
import {
  listClaims,
  getClaim,
  createClaim,
} from "../controllers/siniestrosController.js";

const router = express.Router();

router.get("/", listClaims);
router.get("/:id", getClaim);
router.post("/", createClaim);

export default router;
