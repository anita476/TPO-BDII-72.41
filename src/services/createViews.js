import mongoose from "mongoose";

/**
 * Active policies view (query 9)
 */
export async function createPolizasActivasView() {
  try {
    const db = mongoose.connection.db;

    const collections = await db
      .listCollections({ name: "polizas_activas_vista" })
      .toArray();

    if (collections.length > 0) {
      console.log(
        "Vista 'polizas_activas_vista' ya existe, eliminándola para recrearla..."
      );
      await db.dropCollection("polizas_activas_vista");
    }

    await db.createCollection("polizas_activas_vista", {
      viewOn: "clientes",
      pipeline: [
        {
          $unwind: "$polizas",
        },
        {
          $match: { "polizas.estado": "Activa" },
        },
        {
          $addFields: {
            fechaOrdenamiento: {
              $dateFromParts: {
                year: {
                  $toInt: {
                    $arrayElemAt: [
                      { $split: ["$polizas.fecha_inicio", "/"] },
                      2,
                    ],
                  },
                },
                month: {
                  $toInt: {
                    $arrayElemAt: [
                      { $split: ["$polizas.fecha_inicio", "/"] },
                      1,
                    ],
                  },
                },
                day: {
                  $toInt: {
                    $arrayElemAt: [
                      { $split: ["$polizas.fecha_inicio", "/"] },
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $sort: { fechaOrdenamiento: -1 },
        },
        {
          $project: {
            _id: 0,
            nro_poliza: "$polizas.nro_poliza",
            id_cliente: "$polizas.id_cliente",
            tipo: "$polizas.tipo",
            fecha_inicio: "$polizas.fecha_inicio",
            fecha_fin: "$polizas.fecha_fin",
            prima_mensual: "$polizas.prima_mensual",
            cobertura_total: "$polizas.cobertura_total",
            id_agente: "$polizas.id_agente",
            estado: "$polizas.estado",
          },
        },
      ],
    });

    console.log("Vista 'polizas_activas_vista' creada exitosamente");
  } catch (error) {
    console.error("Error al crear la vista de pólizas activas:", error);
    throw error;
  }
}

/**
 * Expired policies view (query 6)
 */
export async function createPolizasVencidasView() {
  try {
    const db = mongoose.connection.db;

    const collections = await db
      .listCollections({ name: "polizas_vencidas_vista" })
      .toArray();

    if (collections.length > 0) {
      console.log(
        "Vista 'polizas_vencidas_vista' ya existe, eliminándola para recrearla..."
      );
      await db.dropCollection("polizas_vencidas_vista");
    }

    await db.createCollection("polizas_vencidas_vista", {
      viewOn: "clientes",
      pipeline: [
        { $unwind: "$polizas" },
        { $match: { "polizas.estado": "Vencida" } },
        {
          $project: {
            _id: 1,
            polizas: 1,
            nombre: 1,
          },
        },
      ],
    });

    console.log("Vista 'polizas_vencidas_vista' creada exitosamente");
  } catch (error) {
    console.error("Error al crear la vista de pólizas vencidas:", error);
    throw error;
  }
}

/**
 * Suspended policies view (query 10)
 */
export async function createPolizasSuspendidasView() {
  try {
    const db = mongoose.connection.db;

    const collections = await db
      .listCollections({ name: "polizas_suspendidas_vista" })
      .toArray();

    if (collections.length > 0) {
      console.log(
        "Vista 'polizas_suspendidas_vista' ya existe, eliminándola para recrearla..."
      );
      await db.dropCollection("polizas_suspendidas_vista");
    }

    await db.createCollection("polizas_suspendidas_vista", {
      viewOn: "clientes",
      pipeline: [
        { $unwind: "$polizas" },
        { $match: { "polizas.estado": "Suspendida" } },
        {
          $project: {
            estadoCliente: "$activo",
            polizas: 1,
          },
        },
      ],
    });

    console.log("Vista 'polizas_suspendidas_vista' creada exitosamente");
  } catch (error) {
    console.error("Error al crear la vista de pólizas suspendidas:", error);
    throw error;
  }
}
