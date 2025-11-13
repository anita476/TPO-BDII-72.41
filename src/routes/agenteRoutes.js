import express from "express";
import { activeAgents } from "../query_handlers/ActiveAgents.js";
import { agentWithAccidents } from "../query_handlers/AgentWithAccidents.js";

const router = express.Router();

router.get("/activos", activeAgents);
router.get("/con-siniestros", agentWithAccidents);

export default router;