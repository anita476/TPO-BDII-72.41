import express from "express";
import {
  listPolicy,
  getPolicy,
  createPolicy,
} from "../controllers/polizasController.js";
import {expiredPolicies} from "../query_handlers/ExpiredPolicies.js";
import {policiesSortedByStartDate} from "../query_handlers/PoliciesSortedByStartDate.js";
import {suspendedPolicies} from "../query_handlers/SuspendedPolicies.js";

const router = express.Router();


router.get("/vencidas",expiredPolicies)
router.get("/ordenadas-por-fecha-inicio",policiesSortedByStartDate)
router.get("/suspendidas",suspendedPolicies)
router.get("/", listPolicy);
router.get("/:id", getPolicy);
router.post("/", createPolicy);




export default router;
