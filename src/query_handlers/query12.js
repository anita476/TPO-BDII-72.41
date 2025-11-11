import { getJson, setJson } from "../utils/redisUtils.js";
import agente from "../models/Agente.js";

export async function query12(req, res) {
  try {
    const cacheKey = "query12:agentes-con-siniestros:v1";
    const cacheTtlSeconds = 300;

    const cache = await getJson(cacheKey);
    if (cache) {
      return res.json(cache);
    }

    const agent = agente.aggregate([
      {
        $lookup: {
          from: "clientes",
          localField: "id_agente",
          foreignField: "polizas.id_agente",
          as: "cliente_info",
        },
      },
      {
        $lookup: {
          from: "siniestros",
          localField: "cliente_info.polizas.nro_poliza",
          foreignField: "nro_poliza",
          as: "siniestros_info",
        },
      },
      {
        $group: {
          _id: "$id_agente",
          nombre: { $first: "$nombre" },
          apellido: { $first: "$apellido" },
          activos: { $first: "$activo" },
          email: { $first: "$email" },
          matricula: { $first: "$matricula" },
          telefono: { $first: "$telefono" },
          zona: { $first: "$zona" },
          total_siniestros: { $sum: { $size: "$siniestros_info" } },
        },
      },
    ]);
    const resp = await agent.exec();
    await setJson(cacheKey, resp, cacheTtlSeconds);
    res.json(resp);
  } catch (error) {
    console.error("Error en query12:", error);
    res.status(500).json({
      mensaje: "No fue posible obtener la cantidad de siniestros por agente.",
    });
  }
}
