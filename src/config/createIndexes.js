import mongoose from "mongoose";

/**
 * Indexes to optimize query performance
 */
export async function createIndexes() {
  try {
    const db = mongoose.connection.db;

    console.log("Creando indices en MongoDB...");

    // Clientes indexes
    await db.collection("clientes").createIndex({ activo: 1 });
    await db.collection("clientes").createIndex({ "polizas.estado": 1 });

    // Siniestros indexes
    await db.collection("siniestros").createIndex({ estado: 1 });
    await db.collection("siniestros").createIndex({ nro_poliza: 1 });
    await db.collection("siniestros").createIndex({ tipo: 1, fecha: 1 });

    // Vehiculos indexes
    await db
      .collection("vehiculos")
      .createIndex({ id_cliente: 1, asegurado: 1 });

    // Agentes indexes
    await db.collection("agentes").createIndex({ activo: 1 });

    console.log("Indices creados exitosamente!");
  } catch (error) {
    console.error("Error creando indices:", error);
    throw error;
  }
}
