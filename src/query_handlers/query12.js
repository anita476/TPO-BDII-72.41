import { withCache } from "../utils/cacheWrapper.js";
import { QUERY_TTL_MAP } from "../constants/cacheTTL.js";
import agente from "../models/Agente.js";

export async function query12(req, res) {
  await withCache({
    cacheKey: "query12:agentes-con-siniestros:v1",
    ttl: QUERY_TTL_MAP.query12,
    queryFn: async () => {
      const result = await agente.aggregate([
        {
          $lookup: {
            from: "clientes",
            localField: "id_agente",
            foreignField: "polizas.id_agente",
            as: "cliente_info",
          },
        },
        {
          $lookup: {
            from: "siniestros",
            localField: "cliente_info.polizas.nro_poliza",
            foreignField: "nro_poliza",
            as: "siniestros_info",
          },
        },
        {
          $group: {
            _id: "$id_agente",
            nombre: { $first: "$nombre" },
            apellido: { $first: "$apellido" },
            activos: { $first: "$activo" },
            email: { $first: "$email" },
            matricula: { $first: "$matricula" },
            telefono: { $first: "$telefono" },
            zona: { $first: "$zona" },
            total_siniestros: { $sum: { $size: "$siniestros_info" } },
          },
        },
      ]);
      return result;
    },
    res,
    errorMessage: "No fue posible obtener la cantidad de siniestros por agente.",
  });
}
