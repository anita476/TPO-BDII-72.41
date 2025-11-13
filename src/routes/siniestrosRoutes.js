import express from "express";
import {
  listClaims,
  getClaim,
  createClaim,
} from "../controllers/siniestrosController.js";
import {openAccidents} from "../query_handlers/OpenAccidents.js";
import {accidentsLastYear} from "../query_handlers/AccidentsLastYear.js";

const router = express.Router();


router.get("/open",openAccidents)
router.get("/accidente-ultimo-anio",accidentsLastYear)
router.get("/", listClaims);
router.get("/:id", getClaim);
router.post("/", createClaim);



export default router;
