const express = require('express')
const router = express.Router()
const Url = require('../models/urlModel')
const { get, set } = require('../lib/cache')

router.get('/:id', async (req, res) => {
  const shortId = req.params.id
  try {
    // 1) Try cache
    const cacheKey = `short:${shortId}`
    const cached = await get(cacheKey)
    if (cached && cached.originalUrl) {
      // increment analytics async (do not block redirect)
      Url.updateOne({ shortId }, { $inc: { clicks: 1 }, $set: { lastAccessed: new Date() } }).exec()
      return res.redirect(cached.originalUrl)
    }

    // 2) DB fallback
    const record = await Url.findOne({ shortId })
    if (!record) return res.status(404).send('Not found')

    // update cache and analytics
    await set(cacheKey, { originalUrl: record.originalUrl })
    record.clicks += 1
    record.lastAccessed = new Date()
    await record.save()

    return res.redirect(record.originalUrl)
  } catch (err) {
    console.error(err)
    return res.status(500).send('Server error')
  }
})

module.exports = router
