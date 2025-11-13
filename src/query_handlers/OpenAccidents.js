import { getJson, setJson } from "../utils/redisUtils.js";
import siniestro from "../models/Siniestro.js";

export async function openAccidents(req, res) {
  try {
    const cacheKey = "openAccidents:siniestros-abiertos:v1";
    const cacheTtlSeconds = 300;

    const cache = await getJson(cacheKey);
    if (cache) {
      return res.json(cache);
    }

    const sini = siniestro.aggregate([
      {
        $match: {
          estado: "Abierto",
        },
      },
      {
        $lookup: {
          from: "clientes",
          localField: "nro_poliza",
          foreignField: "polizas.nro_poliza",

          as: "cliente",
        },
      },
      {
        $project: {
          tipo: 1,
          monto_estimado: 1,
          "cliente.nombre": 1,
          "cliente.apellido": 1,
          "cliente.email": 1,
          "cliente.ciudad": 1,
          "cliente.direccion": 1,
          "cliente.dni": 1,
          "cliente.id_cliente": 1,
          "cliente.provincia": 1,
          "cliente.telefono": 1,
        },
      },
    ]);
    const resp = await sini.exec();
    await setJson(cacheKey, resp, cacheTtlSeconds);
    res.json(resp);
  } catch (error) {
    console.error("Error en openAccidents:", error);
    res.status(500).json({
      mensaje: "No fue posible obtener los siniestros abiertos.",
    });
  }
}
