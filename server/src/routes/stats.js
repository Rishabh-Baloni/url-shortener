const express = require('express')
const router = express.Router()
const Url = require('../models/urlModel')

router.get('/:id', async (req, res) => {
  const shortId = req.params.id
  const record = await Url.findOne({ shortId }).lean()
  if (!record) return res.status(404).json({ error: 'Not found' })
  res.json({
    shortId: record.shortId,
    originalUrl: record.originalUrl,
    clicks: record.clicks,
    createdAt: record.createdAt,
    lastAccessed: record.lastAccessed
  })
})

module.exports = router
