import { withCache } from "../utils/cacheWrapper.js";
import { QUERY_TTL_MAP } from "../constants/cacheTTL.js";
import cliente from "../models/Cliente.js";

export async function query1(req, res) {
  await withCache({
    cacheKey: "query1:clientes-activos-polizas:v1",
    ttl: QUERY_TTL_MAP.query1,
    queryFn: async () => {
      const result = await cliente.aggregate([
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
      return result;
    },
    res,
    errorMessage: "No fue posible obtener los clientes activos.",
  });
}
