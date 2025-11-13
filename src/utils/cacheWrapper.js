import { getJson, setJson } from "./redisUtils.js";

/**
 * Wrapper generico para implementar caché en queries
 *
 * @param {Object} options - Opciones de config
 * @param {string} options.cacheKey - Key única para el cache
 * @param {number} options.ttl - TTL (en segundos)
 * @param {Function} options.queryFn - Funcion async que ejecuta la query
 * @param {Object} options.res - Express response object
 * @param {string} options.errorMessage - Mensaje de error personalizado
 *
 * @example
 * await withCache({
 *   cacheKey: "query1:clientes-activos",
 *   ttl: CACHE_TTL.OPERACIONAL,
 *   queryFn: async () => await Cliente.find({ activo: true }),
 *   res,
 *   errorMessage: "No fue posible obtener los clientes"
 * });
 */
export async function withCache({
  cacheKey,
  ttl,
  queryFn,
  res,
  errorMessage = "Error al procesar la consulta",
}) {
  try {
    const cachedData = await getJson(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const data = await queryFn();

    await setJson(cacheKey, data, ttl);

    return res.json(data);
  } catch (error) {
    console.error(`Error en ${cacheKey}:`, error);
    return res.status(500).json({ mensaje: errorMessage });
  }
}
