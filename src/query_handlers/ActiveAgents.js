import { withCache } from "../utils/cacheWrapper.js";
import { QUERY_TTL_MAP } from "../constants/cacheTTL.js";
import agente from "../models/Agente.js";

export async function activeAgents(req, res) {
  await withCache({
    cacheKey: "activeAgents:agentes-activos-total-polizas:v1",
    ttl: QUERY_TTL_MAP.query5,
    queryFn: async () => {
      const result = await agente.aggregate([
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
      return result;
    },
    res,
    errorMessage: "No fue posible obtener los agentes activos con total de pólizas.",
  });
}
