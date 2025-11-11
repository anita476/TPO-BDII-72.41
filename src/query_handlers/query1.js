import { getJson, setJson } from "../utils/redisUtils.js";
import cliente from "../models/Cliente.js";

export async function query1(req, res) {
  try {
    const cacheKey = "query1:clientes-activos-polizas:v1";
    const cacheTtlSeconds = 450;

    const cache = await getJson(cacheKey);
    if (cache) {
      return res.json(cache);
    }

    const cli = cliente.aggregate([
      {
        $project: {
          activo: 1,
          apellido: 1,
          ciudad: 1,
          direccion: 1,
          dni: 1,
          email: 1,
          id_cliente: 1,
          nombre: 1,
          polizas: {
            $filter: {
              input: "$polizas",
              as: "poliza",
              cond: { $eq: ["$$poliza.estado", "Activa"] },
            },
          },
          provincia: 1,
          telefono: 1,
        },
      },
      {
        $match: {
          activo: true,
        },
      },
    ]);

    const resp = await cli.exec();
    await setJson(cacheKey, resp, cacheTtlSeconds);
    res.json(resp);
  } catch (error) {
    console.error("Error en query1:", error);
    res
      .status(500)
      .json({ mensaje: "No fue posible obtener los clientes activos." });
  }
}
