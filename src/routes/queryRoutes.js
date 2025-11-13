import express from "express";

import { activeClientsWithPolicy } from "../query_handlers/ActiveClientsWithPolicy.js";
import { openAccidents } from "../query_handlers/OpenAccidents.js";
import { insuredVehicles } from "../query_handlers/InsuredVehicles.js";
import { clientWithouthActivePolicy } from "../query_handlers/ClientWithouthActivePolicy.js";
import { activeAgents } from "../query_handlers/ActiveAgents.js";
import { expiredPolicies } from "../query_handlers/ExpiredPolicies.js";
import { topClientsByCover } from "../query_handlers/TopClientsByCover.js";
import { accidentsLastYear } from "../query_handlers/AccidentsLastYear.js";
import { policiesSortedByStartDate } from "../query_handlers/PoliciesSortedByStartDate.js";
import { suspendedPolicies } from "../query_handlers/SuspendedPolicies.js";
import { clientsWithInsuredVehicles } from "../query_handlers/ClientsWithInsuredVehicles.js";
import { agentWithAccidents } from "../query_handlers/AgentWithAccidents.js";

const router = express.Router();

router.get("/query1", activeClientsWithPolicy);
router.get("/query2", openAccidents);
router.get("/query3", insuredVehicles);
router.get("/query4", clientWithouthActivePolicy);
router.get("/query5", activeAgents);
router.get("/query6", expiredPolicies);
router.get("/query7", topClientsByCover);
router.get("/query8", accidentsLastYear);
router.get("/query9", policiesSortedByStartDate);
router.get("/query10", suspendedPolicies);
router.get("/query11", clientsWithInsuredVehicles);
router.get("/query12", agentWithAccidents);

export default router;
