import { getJson, setJson } from "../utils/redisUtils.js";
import cliente from "../models/Cliente.js";

export async function clientWithouthActivePolicy(req, res) {
  try {
    const cacheKey = "clientWithouthActivePolicy:clientes-sin-polizas-activas:v1";
    const cacheTtlSeconds = 600;

    const cache = await getJson(cacheKey);
    if (cache) {
      return res.json(cache);
    }

    const cli = cliente.find({
      polizas: {
        $not: {
          $elemMatch: {
            estado: "Activa",
          },
        },
      },
    });
    const resp = await cli.exec();
    await setJson(cacheKey, resp, cacheTtlSeconds);
    res.json(resp);
  } catch (error) {
    console.error("Error en clientWithouthActivePolicy:", error);
    res.status(500).json({
      mensaje: "No fue posible obtener los clientes sin pólizas activas.",
    });
  }
}
