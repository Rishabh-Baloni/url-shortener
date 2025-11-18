const mongoose = require('mongoose')

const UrlSchema = new mongoose.Schema({
  shortId: { type: String, required: true, unique: true, index: true },
  originalUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
  clicks: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: null },
  expiresAt: { type: Date, index: true }
})

// TTL index: MongoDB automatically deletes documents when expiresAt is reached
UrlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('Url', UrlSchema)
