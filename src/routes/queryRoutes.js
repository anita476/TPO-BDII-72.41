import express from "express";

import { query1 } from "../query_handlers/query1.js";
import { query2 } from "../query_handlers/query2.js";
import { query3 } from "../query_handlers/query3.js";
import { query4 } from "../query_handlers/query4.js";
import { query5 } from "../query_handlers/query5.js";
import { query6 } from "../query_handlers/query6.js";
import { query7 } from "../query_handlers/query7.js";
import { query8 } from "../query_handlers/query8.js";
import { query9 } from "../query_handlers/query9.js";
import { query10 } from "../query_handlers/query10.js";
import { query11 } from "../query_handlers/query11.js";
import { query12 } from "../query_handlers/query12.js";

const router = express.Router();

router.get("/query1", query1);
router.get("/query2", query2);
router.get("/query3", query3);
router.get("/query4", query4);
router.get("/query5", query5);
router.get("/query6", query6);
router.get("/query7", query7);
router.get("/query8", query8);
router.get("/query9", query9);
router.get("/query10", query10);
router.get("/query11", query11);
router.get("/query12", query12);

export default router;
