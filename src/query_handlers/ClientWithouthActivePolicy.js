import { withCache } from "../utils/cacheWrapper.js";
import { QUERY_TTL_MAP } from "../constants/cacheTTL.js";
import cliente from "../models/Cliente.js";

export async function clientWithouthActivePolicy(req, res) {
  await withCache({
    cacheKey: "clientWithouthActivePolicy:clientes-sin-polizas-activas:v1",
    ttl: QUERY_TTL_MAP.query4,
    queryFn: async () => {
      const result = await cliente.find({
        polizas: {
          $not: {
            $elemMatch: {
              estado: "Activa",
            },
          },
        },
      });
      return result;
    },
    res,
    errorMessage: "No fue posible obtener los clientes sin pólizas activas.",
  });
}
