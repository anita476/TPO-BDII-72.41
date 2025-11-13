import express from "express";
import { insuredVehicles } from "../query_handlers/InsuredVehicles.js";

const router = express.Router();

router.get("/asegurados", insuredVehicles);

export default router;
