require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

const shortenRoute = require('./routes/shorten')
const redirectRoute = require('./routes/redirect')
const statsRoute = require('./routes/stats')
const healthRoute = require('./routes/health')
const metricsRoute = require('./routes/metrics')

const app = express()

// Configure Helmet with relaxed CSP for local development
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}))

// Enable CORS
app.use(cors())

app.use(morgan('tiny'))
app.use(express.json())

// Rate limiting for POST endpoints
const rateLimit = require('./lib/rateLimit')
app.use('/shorten', rateLimit)

// API routes first
app.use('/health', healthRoute)
app.use('/metrics', metricsRoute)
app.use('/shorten', shortenRoute)
app.use('/stats', statsRoute)

// Serve static files (frontend)
app.use(express.static('public'))

// Redirect route last (catch-all for short IDs)
app.use('/', redirectRoute)

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '0.0.0.0'

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB connected successfully')
    app.listen(PORT, HOST, () => {
      console.log(`✅ Server running on http://${HOST}:${PORT}`)
      console.log(`📊 Dashboard: http://${HOST}:${PORT}/dashboard.html`)
    })
  })
  .catch(err => {
    console.error('❌ DB connect error:', err.message)
    process.exit(1)
  })
