import { withCache } from "../utils/cacheWrapper.js";
import { QUERY_TTL_MAP } from "../constants/cacheTTL.js";
import siniestro from "../models/Siniestro.js";

export async function query8(req, res) {
  await withCache({
    cacheKey: "query8:siniestros-accidentes-ultimo-anio:v1",
    ttl: QUERY_TTL_MAP.query8,
    queryFn: async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const today = new Date(currentYear, now.getMonth(), now.getDate());

      const result = await siniestro.aggregate([
        {
          $match: {
            tipo: "Accidente",
          },
        },
        {
          $addFields: {
            fechaDate: {
              $dateFromParts: {
                year: {
                  $toInt: {
                    $arrayElemAt: [{ $split: ["$fecha", "/"] }, 2],
                  },
                },
                month: {
                  $toInt: {
                    $arrayElemAt: [{ $split: ["$fecha", "/"] }, 1],
                  },
                },
                day: {
                  $toInt: {
                    $arrayElemAt: [{ $split: ["$fecha", "/"] }, 0],
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            fechaDate: {
              $gte: yearStart,
              $lte: today,
            },
          },
        },
        {
          $project: {
            fechaDate: 0,
          },
        },
      ]);
      return result;
    },
    res,
    errorMessage:
      "No fue posible obtener los siniestros tipo Accidente del último año.",
  });
}