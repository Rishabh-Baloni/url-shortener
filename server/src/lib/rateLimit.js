const rateMap = new Map()
const LIMIT = 100 // requests per window
const WINDOW_MS = 60 * 1000

module.exports = (req, res, next) => {
  const id = req.ip
  const now = Date.now()
  const entry = rateMap.get(id) || { count: 0, start: now }
  if (now - entry.start > WINDOW_MS) {
    entry.count = 1
    entry.start = now
  } else {
    entry.count++
  }
  rateMap.set(id, entry)
  if (entry.count > LIMIT) return res.status(429).json({ error: 'Too many requests' })
  next()
}
