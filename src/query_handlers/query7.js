import redis from "../config/redis.js";
import cliente from "../models/Cliente.js";

// El top 10 cambia poco, por lo que tiene sentido cachearlo

export async function query7(req, res) {
  try {
    const cacheKey = "query7:top10-clientes:all-polizas:v3";
    const cacheTtlSeconds = 600;

    const cache = await redis.get(cacheKey);
    if (cache) {
      return res.json(JSON.parse(cache));
    }

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

    const respuesta = await cliente.aggregate(pipeline).exec();
    await redis.set(cacheKey, JSON.stringify(respuesta), "EX", cacheTtlSeconds);
    res.json(respuesta);
  } catch (error) {
    console.error("Error en query7:", error);
    res.status(500).json({
      mensaje: "No fue posible obtener el top 10 de clientes por cobertura.",
    });
  }
}
