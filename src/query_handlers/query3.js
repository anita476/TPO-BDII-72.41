import { withCache } from "../utils/cacheWrapper.js";
import { QUERY_TTL_MAP } from "../constants/cacheTTL.js";
import vehiculo from "../models/Vehiculo.js";

export async function query3(req, res) {
  await withCache({
    cacheKey: "query3:vehiculos-asegurados:v1",
    ttl: QUERY_TTL_MAP.query3,
    queryFn: async () => {
      const result = await vehiculo.aggregate([
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
      return result;
    },
    res,
    errorMessage: "No fue posible obtener los vehículos asegurados.",
  });
}
