const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { client } = require('../lib/cache')

router.get('/', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      mongodb: 'unknown',
      redis: 'unknown',
      server: 'healthy'
    }
  }

  // Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      health.services.mongodb = 'healthy'
    } else {
      health.services.mongodb = 'unhealthy'
      health.status = 'degraded'
    }
  } catch (error) {
    health.services.mongodb = 'unhealthy'
    health.status = 'degraded'
  }

  // Check Redis
  try {
    if (client && client.status === 'ready') {
      await client.ping()
      health.services.redis = 'healthy'
    } else {
      health.services.redis = 'degraded'
      health.status = 'degraded'
    }
  } catch (error) {
    health.services.redis = 'unhealthy'
    health.status = 'degraded'
  }

  // Memory usage
  const memUsage = process.memoryUsage()
  health.memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
  }

  const statusCode = health.status === 'healthy' ? 200 : 503
  res.status(statusCode).json(health)
})

module.exports = router
