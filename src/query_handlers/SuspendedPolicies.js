import { getJson, setJson } from "../utils/redisUtils.js";
import cliente from "../models/Cliente.js";

export async function suspendedPolicies(req, res) {
  try {
    const cacheKey = "suspendedPolicies:polizas-suspendidas:v1";
    const cacheTtlSeconds = 300;

    const cache = await getJson(cacheKey);
    if (cache) {
      return res.json(cache);
    }

    const cli = cliente.aggregate([
      { $unwind: "$polizas" },
      {
        $match: { "polizas.estado": "Suspendida" },
      },
      {
        $project: {
          estadoCliente: "$activo",
          polizas: 1,
        },
      },
    ]);
    const resp = await cli.exec();
    await setJson(cacheKey, resp, cacheTtlSeconds);
    res.json(resp);
  } catch (error) {
    console.error("Error en suspendedPolicies:", error);
    res.status(500).json({
      mensaje: "No fue posible obtener las pólizas suspendidas.",
    });
  }
}
