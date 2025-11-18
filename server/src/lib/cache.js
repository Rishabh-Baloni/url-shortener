const Redis = require('ioredis')

let client
let isRedisAvailable = false

try {
  client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
    connectTimeout: 2000
  })
  
  client.on('connect', () => {
    isRedisAvailable = true
    console.log('✅ Redis connected')
  })
  
  client.on('error', (err) => {
    isRedisAvailable = false
    console.log('⚠️  Redis unavailable, using in-memory cache fallback')
  })
} catch (err) {
  console.log('⚠️  Redis unavailable, using in-memory cache fallback')
  isRedisAvailable = false
}

// In-memory fallback cache
const memoryCache = new Map()

async function get(key) {
  if (isRedisAvailable) {
    try {
      const val = await client.get(key)
      return val ? JSON.parse(val) : null
    } catch (err) {
      // Fallback to memory cache
      return memoryCache.get(key) || null
    }
  } else {
    return memoryCache.get(key) || null
  }
}

async function set(key, value, ttl = parseInt(process.env.CACHE_TTL || 3600)) {
  if (isRedisAvailable) {
    try {
      await client.set(key, JSON.stringify(value), 'EX', ttl)
    } catch (err) {
      // Fallback to memory cache
      memoryCache.set(key, value)
      setTimeout(() => memoryCache.delete(key), ttl * 1000)
    }
  } else {
    memoryCache.set(key, value)
    setTimeout(() => memoryCache.delete(key), ttl * 1000)
  }
}

module.exports = { client, get, set }
