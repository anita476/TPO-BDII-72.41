import express from "express";
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clientesController.js";
import {activeClientsWithPolicy} from "../query_handlers/ActiveClientsWithPolicy.js";
import {clientWithouthActivePolicy} from "../query_handlers/ClientWithouthActivePolicy.js";
import {topClientsByCover} from "../query_handlers/TopClientsByCover.js";
import {clientsWithInsuredVehicles} from "../query_handlers/ClientsWithInsuredVehicles.js";

const router = express.Router();


router.get("/activos", activeClientsWithPolicy)
router.get("/sin-poliza-activa",clientWithouthActivePolicy)
router.get("/top-por-cobertura",topClientsByCover)
router.get("/con-vehiculos-asegurados",clientsWithInsuredVehicles)
router.get("/", listClients);
router.get("/:id", getClient);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);



export default router;
