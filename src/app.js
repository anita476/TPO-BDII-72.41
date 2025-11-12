import express from "express";
import compose from "docker-compose";
import { fileURLToPath } from "url";
import path from "path";
import connectMongoDB from "./config/mongodb.js";
import mongoose from "mongoose";
import redis from "./config/redis.js";
import { importAllCSVFiles } from "./services/csvImporterService.js";
import queryRoutes from "./routes/queryRoutes.js";
import clientesRoutes from "./routes/clientesRoutes.js";
import siniestrosRoutes from "./routes/siniestrosRoutes.js";
import polizasRoutes from "./routes/polizasRoutes.js";

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
  res.send("Containers are up and Express is running!");
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

process.on("SIGINT", async () => {
  console.log("\nStopping containers...");
  await compose.down({ cwd: __dirname });
  process.exit(0);
});

/*************HELPERS **********/

async function startServer() {
  try {
    await connectMongoDB();

    // Import CSV files after MongoDB connection is established
    await importAllCSVFiles(DATASETS_PATH);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

async function startContainers() {
  console.log("Starting containers...");
  try {
    await compose.upAll({ cwd: path.resolve(__dirname, "../"), log: true });
    console.log("All containers started");
  } catch (err) {
    console.error("Error starting containers:", err);
  }
}

export default app;
