import { withCache } from "../utils/cacheWrapper.js";
import { QUERY_TTL_MAP } from "../constants/cacheTTL.js";
import siniestro from "../models/Siniestro.js";

export async function query2(req, res) {
  await withCache({
    cacheKey: "query2:siniestros-abiertos:v1",
    ttl: QUERY_TTL_MAP.query2,
    queryFn: async () => {
      const result = await siniestro.aggregate([
        {
          $match: {
            estado: "Abierto",
          },
        },
        {
          $lookup: {
            from: "clientes",
            localField: "nro_poliza",
            foreignField: "polizas.nro_poliza",
            as: "cliente",
          },
        },
        {
          $project: {
            tipo: 1,
            monto_estimado: 1,
            "cliente.nombre": 1,
            "cliente.apellido": 1,
            "cliente.email": 1,
            "cliente.ciudad": 1,
            "cliente.direccion": 1,
            "cliente.dni": 1,
            "cliente.id_cliente": 1,
            "cliente.provincia": 1,
            "cliente.telefono": 1,
          },
        },
      ]);
      return result;
    },
    res,
    errorMessage: "No fue posible obtener los siniestros abiertos.",
  });
}
