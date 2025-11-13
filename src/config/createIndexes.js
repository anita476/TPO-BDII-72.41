import mongoose from "mongoose";

/**
 * Indexes to optimize query performance
 */
export async function createIndexes() {
  try {
    const db = mongoose.connection.db;

    console.log("Creating indexes in MongoDB...");

    await db.collection("clientes").createIndex({ activo: 1 });
    await db.collection("clientes").createIndex({ id_cliente: 1 });
    await db.collection("clientes").createIndex({ "polizas.estado": 1 });
    await db.collection("clientes").createIndex({ "polizas.nro_poliza": 1 });
    await db.collection("clientes").createIndex({ "polizas.id_agente": 1 });
    await db
      .collection("clientes")
      .createIndex({ "polizas.cobertura_total": -1 });

    await db.collection("siniestros").createIndex({ estado: 1 });
    await db.collection("siniestros").createIndex({ tipo: 1 });
    await db.collection("siniestros").createIndex({ nro_poliza: 1 });
    await db.collection("siniestros").createIndex({ tipo: 1, fecha: 1 });

    await db.collection("vehiculos").createIndex({ asegurado: 1 });
    await db
      .collection("vehiculos")
      .createIndex({ id_cliente: 1, asegurado: 1 });

    await db.collection("agentes").createIndex({ activo: 1 });
    await db.collection("agentes").createIndex({ id_agente: 1 });

    console.log("Indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
    throw error;
  }
}
