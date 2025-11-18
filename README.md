# URL Shortener

A high-performance URL shortener with intelligent caching, real-time analytics, and automatic URL expiration. Built as a production-ready portfolio project demonstrating scalable system design.

**Live Demo**: [https://url-shortener-ybpw.onrender.com](https://url-shortener-ybpw.onrender.com)

## 🚀 Tech Stack

- **Backend**: Node.js 22.x, Express 5.1
- **Database**: MongoDB Atlas (persistent storage with TTL indexing)
- **Cache**: Redis Cloud (read-through caching)
- **Deployment**: Render.com with auto-deploy
- **ID Generation**: nanoid (7-character base62 IDs)
- **Security**: Helmet.js, CORS, rate limiting
- **Testing**: Jest with 27 passing unit tests

## 📋 Features

- ✅ Generate short URLs with unique 7-character IDs (~3.5 trillion combinations)
- ✅ Redis caching for fast redirects (reduces latency from ~40ms to <5ms)
- ✅ Real-time click analytics and tracking
- ✅ **Smart TTL expiration**: URLs auto-delete after 5 minutes if unused, extend to 1 day on each click
- ✅ IP-based rate limiting (100 requests/min on URL creation)
- ✅ Health monitoring endpoint for production
- ✅ Real-time performance dashboard
- ✅ Modern black/off-white UI design
- ✅ Comprehensive unit test coverage

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
┌──────▼──────────┐
│  Express Server │
│  (Node.js)      │
└──────┬──────────┘
       │
   ┌───┴────┐
   │        │
┌──▼──┐  ┌─▼────┐
│Redis│  │MongoDB│
└─────┘  └───────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 22.x or higher
- MongoDB instance (local or cloud)
- Redis instance (local or cloud)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Rishabh-Baloni/url-shortener.git
cd url-shortener

# Install dependencies
cd server
npm install

# Configure environment variables
# Create a .env file with:
# - MONGO_URL (your MongoDB connection string)
# - REDIS_URL (your Redis connection string)
# - BASE_URL (e.g., http://localhost:3000)
# - PORT (default: 3000)

# Start the server
npm start

# For development with hot reload
npm run dev
```

## 📡 API Documentation

### 1. Create Short URL
```bash
POST /shorten
Content-Type: application/json

{
  "url": "https://example.com"
}

# Response:
{
  "shortUrl": "https://url-shortener-ybpw.onrender.com/abc123x",
  "shortId": "abc123x"
}
```

### 2. Redirect to Original URL
```bash
GET /:shortId

# Returns 302 redirect to original URL
# Extends expiration to 1 day from now
# Updates click count and lastAccessed timestamp
```

### 3. Get URL Statistics
```bash
GET /stats/:shortId

# Response:
{
  "shortId": "abc123x",
  "originalUrl": "https://example.com",
  "clicks": 42,
  "createdAt": "2025-11-18T12:00:00.000Z",
  "lastAccessed": "2025-11-18T13:30:00.000Z",
  "expiresAt": "2025-11-19T13:30:00.000Z"
}
```

### 4. Health Check
```bash
GET /health

# Response:
{
  "status": "ok",
  "mongodb": "connected",
  "redis": "connected",
  "timestamp": "2025-11-18T12:00:00.000Z"
}
```

### 5. Performance Metrics
```bash
GET /metrics

# Response:
{
  "totalUrls": 1523,
  "totalClicks": 8945,
  "topUrls": [...],
  "recentActivity": [...],
  "system": {
    "uptime": "2h 34m",
    "memory": "128 MB",
    "nodeVersion": "22.0.0"
  }
}
```

## 🎯 Key Features Explained

### Smart URL Expiration (TTL System)
- New URLs automatically expire after **5 minutes** if never accessed
- First click extends expiration to **1 day**
- Each subsequent click resets the 1-day countdown
- MongoDB TTL index handles automatic cleanup (no manual intervention)
- Keeps database clean and storage costs minimal

### Read-Through Caching
- First checks Redis cache for the short ID
- On cache miss, queries MongoDB and populates cache
- Reduces redirect latency from ~40ms to <5ms
- Cache automatically invalidated on updates

### Analytics Tracking
- Non-blocking async updates for cached redirects
- Tracks total clicks and last accessed timestamp
- Zero performance impact on redirect speed

### Rate Limiting
- IP-based throttling: 100 requests/min per IP address
- Only applied to `/shorten` endpoint
- Prevents abuse while maintaining usability

## 🛠️ Development

### Running Tests
```bash
cd server

# Run all unit tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- **27 passing unit tests** covering:
  - ID generation and collision handling
  - URL validation
  - Rate limiting logic
  - Schema validation
  - Edge cases

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=3000
NODE_ENV=development
MONGO_URL=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
BASE_URL=http://localhost:3000
CACHE_TTL=3600
```

**Note**: Never commit your `.env` file or expose credentials publicly.

## 📂 Project Structure

```
url-shortener/
├── server/
│   ├── src/
│   │   ├── index.js                 # Express app entry point
│   │   ├── routes/
│   │   │   ├── shorten.js          # POST /shorten endpoint
│   │   │   ├── redirect.js         # GET /:id redirect + TTL extension
│   │   │   ├── stats.js            # GET /stats/:id analytics
│   │   │   ├── health.js           # GET /health monitoring
│   │   │   └── metrics.js          # GET /metrics dashboard API
│   │   ├── lib/
│   │   │   ├── idGen.js            # nanoid ID generator
│   │   │   ├── cache.js            # Redis client wrapper
│   │   │   └── rateLimit.js        # IP-based rate limiter
│   │   └── models/
│   │       └── urlModel.js         # MongoDB schema with TTL index
│   ├── public/
│   │   ├── index.html              # Main UI (black/off-white theme)
│   │   └── dashboard.html          # Performance dashboard
│   ├── tests/
│   │   ├── idGen.test.js
│   │   ├── urlValidation.test.js
│   │   ├── rateLimit.test.js
│   │   └── urlModel.test.js
│   ├── package.json
│   └── .env                        # Environment config (not in git)
├── render.yaml                     # Render deployment config
├── .node-version                   # Node.js version specification
└── README.md
```

## 🏗️ Architecture Highlights

### ID Generation
- Uses nanoid with custom base62 alphabet (a-zA-Z0-9)
- 7-character IDs provide ~3.5 trillion unique combinations
- Collision detection with automatic retry logic
- Cryptographically secure random generation

### Caching Strategy
- **Read-through cache**: Check Redis → Miss → Query MongoDB → Update Redis
- Significantly reduces database load
- Cached redirects: <5ms latency
- Uncached redirects: ~40ms latency

### Database Design
- MongoDB with TTL index on `expiresAt` field
- Background thread checks for expired documents every 60 seconds
- Automatic cleanup requires zero manual intervention
- Runs independently on MongoDB Atlas (24/7 uptime)

## 🔐 Security Features

- **Helmet.js**: Secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- **CORS**: Configured for production origin
- **Rate Limiting**: IP-based throttling (100 requests/min on `/shorten`)
- **Input Validation**: URL format validation before processing
- **Environment Variables**: Sensitive credentials never hardcoded

## 📊 Performance Dashboard

Access the real-time dashboard at `/dashboard.html`:
- Total URLs created and clicks tracked
- Top 10 most clicked URLs
- Recent activity (last 24 hours)
- System metrics (uptime, memory usage, Node.js version)
- Auto-refreshes every 5 seconds

## 🎨 UI Design

- **Modern minimal theme**: Black (#0a0a0a) and off-white (#f5f5f5)
- **No unnecessary decorations**: Clean, professional appearance
- **Fully responsive**: Works on desktop and mobile
- **Real-time updates**: Recent URLs displayed instantly
- **Auto-cleanup**: URLs older than 1 day removed from view

## 🚀 Deployment

This project is deployed on **Render.com** with automatic deployment from the main branch.

**Live URL**: [https://url-shortener-ybpw.onrender.com](https://url-shortener-ybpw.onrender.com)

### Deployment Features
- Auto-deploy on git push to main branch
- MongoDB Atlas (cloud-hosted, 24/7 uptime)
- Redis Cloud (managed caching)
- Environment variables configured securely
- Health monitoring endpoint

### To Deploy Your Own Instance
1. Fork this repository
2. Sign up for free accounts:
   - [Render](https://render.com) (web hosting)
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (database)
   - [Redis Cloud](https://redis.com/try-free/) (caching)
3. Connect your GitHub repo to Render
4. Configure environment variables (see `.env` example above)
5. Deploy!

## 🎯 Future Enhancements

Potential features for further development:
- [ ] Custom vanity URLs
- [ ] QR code generation for short links
- [ ] Analytics export (CSV/JSON)
- [ ] Integration tests with mocked services
- [ ] Unique visitor tracking (HyperLogLog)
- [ ] Custom domain support
- [ ] Bulk URL shortening API
- [ ] Browser extension

## 📝 License

ISC

## 👤 About

**Built by**: [Rishabh Baloni](https://github.com/Rishabh-Baloni)

This project demonstrates:
- **System Design**: Scalable architecture with caching and database optimization
- **Backend Development**: RESTful API design with Node.js and Express
- **Database Management**: MongoDB with TTL indexing and Redis caching
- **Production Deployment**: Cloud hosting with CI/CD pipeline
- **Testing**: Unit tests with Jest (27 passing tests)
- **Security**: Rate limiting, input validation, secure headers

**Interview-Ready Features**:
- Read-through caching pattern
- TTL-based automatic cleanup
- Non-blocking analytics tracking
- Collision-proof ID generation
- Rate limiting and security best practices
- Production monitoring and health checks

---

⭐ **Star this repo** if you find it useful for learning or interviews!
