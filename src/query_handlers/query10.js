import { withCache } from "../utils/cacheWrapper.js";
import { QUERY_TTL_MAP } from "../constants/cacheTTL.js";
import mongoose from "mongoose";

export async function query10(req, res) {
  await withCache({
    cacheKey: "query10:polizas-suspendidas:v1",
    ttl: QUERY_TTL_MAP.query10,
    queryFn: async () => {
      const db = mongoose.connection.db;
      const result = await db
        .collection("polizas_suspendidas_vista")
        .find({})
        .toArray();
      return result;
    },
    res,
    errorMessage: "No fue posible obtener las pólizas suspendidas.",
  });
}
