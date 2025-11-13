import { withCache } from "../utils/cacheWrapper.js";
import { QUERY_TTL_MAP } from "../constants/cacheTTL.js";
import cliente from "../models/Cliente.js";

export async function query7(req, res) {
  await withCache({
    cacheKey: "query7:top10-clientes:all-polizas:v3",
    ttl: QUERY_TTL_MAP.query7,
    queryFn: async () => {
      const pipeline = [
        { $unwind: "$polizas" },
        {
          $group: {
            _id: "$id_cliente",
            nombre: { $first: "$nombre" },
            apellido: { $first: "$apellido" },
            coberturaTotal: {
              $sum: {
                $cond: [
                  { $isNumber: "$polizas.cobertura_total" },
                  "$polizas.cobertura_total",
                  {
                    $toDouble: {
                      $replaceAll: {
                        input: {
                          $ifNull: ["$polizas.cobertura_total", "0"],
                        },
                        find: ",",
                        replacement: ".",
                      },
                    },
                  },
                ],
              },
            },
            cantidadPolizas: { $sum: 1 },
          },
        },
        { $sort: { coberturaTotal: -1, _id: 1 } },
        { $limit: 10 },
        { $sort: { apellido: 1, nombre: 1 } },
        {
          $project: {
            _id: 0,
            id_cliente: "$_id",
            nombre: 1,
            apellido: 1,
            coberturaTotal: 1,
            cantidadPolizas: 1,
          },
        },
      ];

      const result = await cliente.aggregate(pipeline);
      return result;
    },
    res,
    errorMessage: "No fue posible obtener el top 10 de clientes por cobertura.",
  });
}
