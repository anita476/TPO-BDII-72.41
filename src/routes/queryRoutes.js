import express from 'express';
import Cliente from "../models/Cliente.js";
import {query1} from "../query_handlers/query1.js";

const router = express.Router();

// Query 1 endpoint
router.get('/query1', query1)



export default router;
