import { withCache } from "../utils/cacheWrapper.js";
import { QUERY_TTL_MAP } from "../constants/cacheTTL.js";
import mongoose from "mongoose";

export async function query6(req, res) {
  await withCache({
    cacheKey: "query6:polizas-vencidas:v1",
    ttl: QUERY_TTL_MAP.query6,
    queryFn: async () => {
      const db = mongoose.connection.db;
      const result = await db
        .collection("polizas_vencidas_vista")
        .find({})
        .toArray();
      return result;
    },
    res,
    errorMessage: "No fue posible obtener las pólizas vencidas.",
  });
}
