const express = require('express')
const router = express.Router()
const Url = require('../models/urlModel')
const { generateId } = require('../lib/idGen')
const { set } = require('../lib/cache')

router.post('/', async (req, res) => {
  try {
    const { url } = req.body
    if (!url) return res.status(400).json({ error: 'url required' })

    // generate unique id, avoid collisions
    let shortId, exists
    do {
      shortId = generateId()
      exists = await Url.findOne({ shortId })
    } while (exists)

    const doc = new Url({ 
      shortId, 
      originalUrl: url,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    })
    await doc.save()

    // warm cache
    await set(`short:${shortId}`, { originalUrl: url })

    const baseUrl = process.env.BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000'
    res.json({ shortUrl: `${baseUrl}/${shortId}`, shortId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

module.exports = router
