/**
 * Constants cache TTL (in seconds)
 *
 * Cache strategy based on 4 categories according to data volatility:
 * - TRANSACTIONAL: Data that changes constantly (siniestros)
 * - OPERATIONAL: Operational data of the day-to-day (polizas, clientes)
 * - SEMI_STATIC: Data that changes occasionally (vehiculos, suspensiones)
 * - ANALYTIC: Reports and historical data
 *
 * Review section X of the report (in docs/informe) for detailed justification 
 */
//TODO: complete with real seccion del informe una vez q este terminado 

export const CACHE_TTL = {
  TRANSACTIONAL: 120,
  OPERATIONAL: 600,
  SEMI_STATIC: 1200,
  ANALYTIC: 3600,
};

export const QUERY_TTL_MAP = {
  query2: CACHE_TTL.TRANSACTIONAL,

  query1: CACHE_TTL.OPERATIONAL,
  query4: CACHE_TTL.OPERACIONAL,
  query5: CACHE_TTL.OPERACIONAL,
  query9: CACHE_TTL.OPERACIONAL,
  query12: CACHE_TTL.OPERACIONAL,

  query3: CACHE_TTL.SEMI_STATIC,
  query10: CACHE_TTL.SEMI_STATIC,
  query11: CACHE_TTL.SEMI_STATIC,

  query6: CACHE_TTL.ANALYTIC,
  query7: CACHE_TTL.ANALYTIC,
  query8: CACHE_TTL.ANALYTIC,
};
