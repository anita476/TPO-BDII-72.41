import { getJson, setJson } from "../utils/redisUtils.js";
import cliente from "../models/Cliente.js";

export async function clientsWithInsuredVehicles(req, res) {
  try {
    const cacheKey = "clientsWithInsuredVehicles:clientes-con-multiples-vehiculos:v1";
    const cacheTtlSeconds = 600;

    const cache = await getJson(cacheKey);
    if (cache) {
      return res.json(cache);
    }

    const cli = cliente.aggregate([
      {
        $lookup: {
          from: "vehiculos",
          let: { clienteId: "$id_cliente" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$id_cliente", "$$clienteId"] },
                asegurado: true,
              },
            },
          ],
          as: "vehiculo",
        },
      },
      {
        $group: {
          _id: "$id_cliente",
          nombre: { $first: "$nombre" },
          apellido: { $first: "$apellido" },
          telefono: { $first: "$telefono" },
          email: { $first: "$email" },
          dni: { $first: "$dni" },
          ciudad: { $first: "$ciudad" },
          provincia: { $first: "$provincia" },
          direccion: { $first: "$direccion" },
          activo: { $first: "$activo" },
          total_vehiculos_asegurados: { $sum: { $size: "$vehiculo" } },
        },
      },
      {
        $match: { total_vehiculos_asegurados: { $gt: 1 } },
      },
    ]);
    const resp = await cli.exec();
    await setJson(cacheKey, resp, cacheTtlSeconds);
    res.json(resp);
  } catch (error) {
    console.error("Error en clientsWithInsuredVehicles:", error);
    res.status(500).json({
      mensaje: "No fue posible obtener los clientes con múltiples vehículos.",
    });
  }
}
