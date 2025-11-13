import { getJson, setJson } from "../utils/redisUtils.js";
import cliente from "../models/Cliente.js";

export async function expiredPolicies(req, res) {
  try {
    const cacheKey = "expiredPolicies:clientes-polizas-vencidas:v1";
    const cacheTtlSeconds = 300;

    const cache = await getJson(cacheKey);
    if (cache) {
      return res.json(cache);
    }

    const cli = cliente.aggregate([
      {
        $unwind: "$polizas",
      },
      { $match: { "polizas.estado": "Vencida" } },
      {
        $project: {
          polizas: 1,
          nombre: 1,
        },
      },
    ]);
    const resp = await cli.exec();
    await setJson(cacheKey, resp, cacheTtlSeconds);
    res.json(resp);
  } catch (error) {
    console.error("Error en expiredPolicies:", error);
    res.status(500).json({
      mensaje: "No fue posible obtener los clientes con pólizas vencidas.",
    });
  }
}
