import { getJson, setJson } from "../utils/redisUtils.js";
import vehiculo from "../models/Vehiculo.js";

export async function query3(req, res) {
  try {
    const cacheKey = "query3:vehiculos-asegurados:v1";
    const cacheTtlSeconds = 600;

    const cache = await getJson(cacheKey);
    if (cache) {
      return res.json(cache);
    }

    const vehi = vehiculo.aggregate([
      {
        $match: { asegurado: true },
      },
      {
        $lookup: {
          from: "clientes",
          localField: "id_cliente",
          foreignField: "id_cliente",
          as: "cliente",
        },
      },
    ]);
    const resp = await vehi.exec();
    await setJson(cacheKey, resp, cacheTtlSeconds);
    res.json(resp);
  } catch (error) {
    console.error("Error en query3:", error);
    res.status(500).json({
      mensaje: "No fue posible obtener los vehículos asegurados.",
    });
  }
}
