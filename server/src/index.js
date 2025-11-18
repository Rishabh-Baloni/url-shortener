require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const helmet = require('helmet')

const shortenRoute = require('./routes/shorten')
const redirectRoute = require('./routes/redirect')
const statsRoute = require('./routes/stats')

const app = express()
app.use(helmet())
app.use(morgan('tiny'))
app.use(express.json())

// Serve static files (frontend)
app.use(express.static('public'))

// optional rate limit middleware for POSTs
// const rateLimit = require('./lib/rateLimit')
// app.use('/shorten', rateLimit)

app.use('/shorten', shortenRoute)
app.use('/stats', statsRoute)
app.use('/', redirectRoute)

const PORT = process.env.PORT || 3000
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB connected successfully')
    app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`))
  })
  .catch(err => {
    console.error('❌ DB connect error:', err.message)
    process.exit(1)
  })
