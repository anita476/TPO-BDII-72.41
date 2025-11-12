import { getJson, setJson } from "../utils/redisUtils.js";
import agente from "../models/Agente.js";

export async function query5(req, res) {
  try {
    const cacheKey = "query5:agentes-activos-total-polizas:v1";
    const cacheTtlSeconds = 300;

    const cache = await getJson(cacheKey);
    if (cache) {
      return res.json(cache);
    }

    const ag = agente.aggregate([
      {
        $match: { activo: true },
      },
      {
        $lookup: {
          from: "clientes",
          let: { agenteId: "$id_agente" },
          pipeline: [
            { $unwind: "$polizas" },
            {
              $match: {
                $expr: {
                  $eq: ["$polizas.id_agente", "$$agenteId"],
                },
              },
            },
          ],
          as: "polizas_matched",
        },
      },
      {
        $addFields: {
          total_polizas: { $size: "$polizas_matched" },
        },
      },
      {
        $project: {
          polizas_matched: 0,
        },
      },
    ]);
    const resp = await ag.exec();
    await setJson(cacheKey, resp, cacheTtlSeconds);
    res.json(resp);
  } catch (error) {
    console.error("Error en query5:", error);
    res.status(500).json({
      mensaje:
        "No fue posible obtener los agentes activos con total de pólizas.",
    });
  }
}
