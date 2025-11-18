const express = require('express');
const router = express.Router();
const UrlModel = require('../models/urlModel');
const cache = require('../lib/cache');

// Performance metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    // Get total URLs created
    const totalUrls = await UrlModel.countDocuments();
    
    // Get top 10 most clicked URLs
    const topUrls = await UrlModel.find()
      .sort({ clicks: -1 })
      .limit(10)
      .select('shortId originalUrl clicks lastAccessed');
    
    // Get recent URLs (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentUrls = await UrlModel.countDocuments({
      createdAt: { $gte: yesterday }
    });
    
    // Get total clicks across all URLs
    const clickStats = await UrlModel.aggregate([
      {
        $group: {
          _id: null,
          totalClicks: { $sum: '$clicks' }
        }
      }
    ]);
    
    const totalClicks = clickStats.length > 0 ? clickStats[0].totalClicks : 0;
    
    // Cache statistics
    const cacheStats = cache.getStats ? cache.getStats() : { 
      hits: 'N/A', 
      misses: 'N/A', 
      hitRate: 'N/A' 
    };
    
    // System uptime
    const uptimeSeconds = process.uptime();
    const uptimeFormatted = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`;
    
    // Memory usage
    const memUsage = process.memoryUsage();
    const memoryMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024)
    };
    
    res.json({
      timestamp: new Date().toISOString(),
      uptime: uptimeFormatted,
      database: {
        totalUrls,
        recentUrls24h: recentUrls,
        totalClicks,
        averageClicksPerUrl: totalUrls > 0 ? (totalClicks / totalUrls).toFixed(2) : 0
      },
      topUrls: topUrls.map(url => ({
        shortId: url.shortId,
        shortUrl: `${req.protocol}://${req.get('host')}/${url.shortId}`,
        originalUrl: url.originalUrl,
        clicks: url.clicks,
        lastAccessed: url.lastAccessed
      })),
      cache: cacheStats,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: memoryMB
      }
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

module.exports = router;
