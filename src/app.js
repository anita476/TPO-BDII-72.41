import express from "express";
import compose from "docker-compose";
import { fileURLToPath } from "url";
import path from "path";
import connectMongoDB from "./config/mongodb.js";
import mongoose from "mongoose";
import redis from "./config/redis.js";
import { importAllCSVFiles } from "./services/csvImporterService.js";
import {
  createPolizasActivasView,
  createPolizasVencidasView,
  createPolizasSuspendidasView,
} from "./services/createViews.js";
import { createIndexes } from "./config/createIndexes.js";
import queryRoutes from "./routes/queryRoutes.js";
import clientesRoutes from "./routes/clientesRoutes.js";
import siniestrosRoutes from "./routes/siniestrosRoutes.js";
import polizasRoutes from "./routes/polizasRoutes.js";
import agenteRoutes from "./routes/agenteRoutes.js";
import vehiculoRoutes from "./routes/vehiculoRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const DATASETS_PATH = process.argv[2] || null;

const app = express();
app.use(express.json()); // return responses in json format
app.use(express.urlencoded({ extended: true })); // parse urlencoded bodies

startContainers(); // auto-start containers
startServer();

app.get("/", (req, res) => {
  res.send("Contenedores inicializados y Express en ejecución!");
});

// to check if the db are still connected ....
app.get("/health", async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "ok" : "error";
  const redisStatus = redis.status === "ready" ? "ok" : "error";

  res.json({
    status: "running",
    mongodb: mongoStatus,
    redis: redisStatus,
    timestamp: new Date().toISOString(),
  });
});

// LOGGING:
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/queries", queryRoutes);
app.use("/clientes", clientesRoutes);
app.use("/siniestros", siniestrosRoutes);
app.use("/polizas", polizasRoutes);
app.use("/agentes", agenteRoutes);
app.use("/vehiculos", vehiculoRoutes);

process.on("SIGINT", async () => {
  console.log("\nDeteniendo contenedores y eliminando volúmenes...");
  try {
    await compose.down({
      cwd: path.resolve(__dirname, "../"),
      log: true,
      commandOptions: ["-v", "--remove-orphans"], // removes volumes
    });
    console.log("Contenedores y volúmenes eliminados exitosamente.");
  } catch (err) {
    console.error("Error al detener contenedores:", err);
  } finally {
    process.exit(0);
  }
});

/*************HELPERS **********/

async function startServer() {
  try {
    await connectMongoDB();

    // Import CSV files after MongoDB connection is established
    await importAllCSVFiles(DATASETS_PATH);

    // Create MongoDB views
    await createPolizasActivasView();
    await createPolizasVencidasView();
    await createPolizasSuspendidasView();

    // Create MongoDB indexes
    await createIndexes();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

async function startContainers() {
  console.log("Iniciando contenedores...");
  try {
    await compose.upMany(["mongodb", "redis"], {
      cwd: path.resolve(__dirname, "../"),
      log: true,
      commandOptions: ["--no-recreate"],
    });
    console.log("Todos los contenedores iniciados");
  } catch (err) {
    console.error("Error al iniciar contenedores:", err);
  }
}

export default app;
