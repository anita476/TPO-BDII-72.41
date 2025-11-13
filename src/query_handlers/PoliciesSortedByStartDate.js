import { withCache } from "../utils/cacheWrapper.js";
import { QUERY_TTL_MAP } from "../constants/cacheTTL.js";
import mongoose from "mongoose";

export async function policiesSortedByStartDate(req, res) {
  await withCache({
    cacheKey: "policiesSortedByStartDate:polizas-activas:v1",
    ttl: QUERY_TTL_MAP.query9,
    queryFn: async () => {
      const db = mongoose.connection.db;
      const result = await db
        .collection("polizas_activas_vista")
        .find({})
        .toArray();
      return result;
    },
    res,
    errorMessage: "No fue posible obtener las pólizas activas.",
  });
}
