const Redis = require('ioredis')
const client = new Redis(process.env.REDIS_URL)

async function get(key) {
  const val = await client.get(key)
  return val ? JSON.parse(val) : null
}
async function set(key, value, ttl = parseInt(process.env.CACHE_TTL || 3600)) {
  await client.set(key, JSON.stringify(value), 'EX', ttl)
}
module.exports = { client, get, set }
