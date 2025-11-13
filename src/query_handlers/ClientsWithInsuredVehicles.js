import { withCache } from "../utils/cacheWrapper.js";
import { QUERY_TTL_MAP } from "../constants/cacheTTL.js";
import cliente from "../models/Cliente.js";

export async function clientsWithInsuredVehicles(req, res) {
  await withCache({
    cacheKey: "clientsWithInsuredVehicles:clientes-con-multiples-vehiculos:v1",
    ttl: QUERY_TTL_MAP.query11,
    queryFn: async () => {
      const result = await cliente.aggregate([
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
      return result;
    },
    res,
    errorMessage:
      "No fue posible obtener los clientes con múltiples vehículos.",
  });
}
