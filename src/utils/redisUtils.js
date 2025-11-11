import redis from "../config/redis.js";

const DEFAULT_TTL_SECONDS = 300;

export async function getJson(key) {
  const cached = await redis.get(key);
  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached);
  } catch (error) {
    console.warn(`redisUtils:getJson falló al parsear ${key}`, error);
    return null;
  }
}

export async function setJson(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const payload = JSON.stringify(value);
  await redis.set(key, payload, "EX", ttlSeconds);
}

export default {
  getJson,
  setJson,
};
