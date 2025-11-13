import { getJson, setJson } from "./redisUtils.js";

/**
 * Wrapper for cache implementation in queries
 *
 * @param {Object} options - Configuration options
 * @param {string} options.cacheKey - Unique key for the cache
 * @param {number} options.ttl - TTL (in seconds)
 * @param {Function} options.queryFn - Async function that executes the query
 * @param {Object} options.res - Express response object
 * @param {string} options.errorMessage - Custom error message
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
