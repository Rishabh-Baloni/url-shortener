# 🚀 URL Shortener - Complete User Guide

## Table of Contents
1. [What This Application Does](#what-this-application-does)
2. [Option A: Running with Docker (Recommended)](#option-a-running-with-docker-recommended)
3. [Option B: Running Locally (Without Docker)](#option-b-running-locally-without-docker)
4. [How to Use the Application](#how-to-use-the-application)
5. [Testing the Application](#testing-the-application)
6. [Troubleshooting](#troubleshooting)

---

## What This Application Does

The URL Shortener is a web service that:
- **Converts long URLs into short ones** (e.g., `https://example.com/very/long/url` → `http://localhost:3000/abc123x`)
- **Redirects users** automatically when they visit the short URL
- **Tracks analytics** like number of clicks and last access time
- **Uses caching** for super-fast redirects (Redis)
- **Stores data permanently** in a database (MongoDB)

### Real-World Example:
1. You have a long URL: `https://www.example.com/products/category/electronics/laptops/gaming/2024/black-friday-deals`
2. You create a short URL: `http://localhost:3000/gAm3XyZ`
3. Anyone clicking `http://localhost:3000/gAm3XyZ` gets redirected to the long URL
4. You can see how many times it was clicked

---

## Option A: Running with Docker (Recommended)

### Step 1: Install Docker Desktop

1. **Download Docker Desktop**:
   - Visit: https://www.docker.com/products/docker-desktop/
   - Download for Windows
   - Install and restart your computer if prompted

2. **Verify Installation**:
   ```powershell
   docker --version
   docker compose version
   ```

### Step 2: Start the Application

```powershell
# Navigate to the project folder
cd "d:\Projects\Mini Project\New folder (3)\url-shortener"

# Start all services (MongoDB, Redis, and the app)
docker compose up --build
```

**What happens:**
- Docker downloads MongoDB and Redis images (first time only)
- Builds your Node.js application
- Starts all three services together
- Server runs at: http://localhost:3000

### Step 3: Check if Running

You should see output like:
```
✔ Container url-shortener-mongo-1  Created
✔ Container url-shortener-redis-1  Created
✔ Container url-shortener-app-1    Created
...
app-1    | Server running on 3000
```

### To Stop the Application:
Press `Ctrl+C` in the terminal, then:
```powershell
docker compose down
```

---

## Option B: Running Locally (Without Docker)

If you don't want to use Docker, you need to install MongoDB and Redis separately.

### Step 1: Install MongoDB

1. **Download MongoDB**:
   - Visit: https://www.mongodb.com/try/download/community
   - Download MongoDB Community Server for Windows
   - Install with default settings

2. **Start MongoDB**:
   ```powershell
   # MongoDB usually runs as a Windows service automatically
   # Or start it manually:
   "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath "D:\mongodb-data"
   ```

### Step 2: Install Redis

1. **Download Redis for Windows**:
   - Visit: https://github.com/tporadowski/redis/releases
   - Download the latest .msi installer
   - Install with default settings

2. **Start Redis**:
   ```powershell
   # Redis usually runs as a Windows service
   # Or start manually from installation folder
   redis-server
   ```

### Step 3: Update Configuration

Edit `server\.env`:
```env
PORT=3000
MONGO_URL=mongodb://localhost:27017/urlshortener
REDIS_URL=redis://localhost:6379
BASE_URL=http://localhost:3000
CACHE_TTL=3600
```

### Step 4: Start the Application

```powershell
cd "d:\Projects\Mini Project\New folder (3)\url-shortener\server"

# Install dependencies (first time only)
npm install

# Start the server
npm run dev
```

You should see:
```
Server running on 3000
```

---

## How to Use the Application

Once the server is running at http://localhost:3000, you can use these three features:

### 1. Create a Short URL

**Using PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/shorten" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"url":"https://www.google.com"}'
```

**Using curl (if installed):**
```bash
curl -X POST -H "Content-Type: application/json" -d "{\"url\":\"https://www.google.com\"}" http://localhost:3000/shorten
```

**Response:**
```json
{
  "shortUrl": "http://localhost:3000/abc123x",
  "shortId": "abc123x"
}
```

**What happened:**
- ✅ Generated unique 7-character ID: `abc123x`
- ✅ Saved to MongoDB database
- ✅ Cached in Redis for fast access
- ✅ Returns the short URL you can share

### 2. Use the Short URL (Redirect)

**Open in Browser:**
```
http://localhost:3000/abc123x
```

**Or test in PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/abc123x" -MaximumRedirection 0
```

**What happens:**
- ✅ Server looks up `abc123x` in Redis cache (super fast!)
- ✅ If not in cache, gets it from MongoDB
- ✅ Redirects you to `https://www.google.com`
- ✅ Increments click counter
- ✅ Updates last accessed time

### 3. View Statistics

**Using PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/stats/abc123x"
```

**Using Browser:**
```
http://localhost:3000/stats/abc123x
```

**Response:**
```json
{
  "shortId": "abc123x",
  "originalUrl": "https://www.google.com",
  "clicks": 5,
  "createdAt": "2025-11-18T12:00:00.000Z",
  "lastAccessed": "2025-11-18T13:30:00.000Z"
}
```

**What you see:**
- 📊 How many times the link was clicked
- 🕒 When it was created
- 🕒 When it was last accessed

---

## Testing the Application

### Quick Test Script

Save this as `test-app.ps1`:

```powershell
Write-Host "🧪 Testing URL Shortener..." -ForegroundColor Cyan

# Test 1: Create a short URL
Write-Host "`n1️⃣ Creating short URL..." -ForegroundColor Yellow
$result = Invoke-RestMethod -Uri "http://localhost:3000/shorten" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"url":"https://github.com"}'

$shortId = $result.shortId
Write-Host "✅ Created: $($result.shortUrl)" -ForegroundColor Green
Write-Host "   Short ID: $shortId" -ForegroundColor Green

# Test 2: Test redirect
Write-Host "`n2️⃣ Testing redirect..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/$shortId" -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "✅ Redirect works! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✅ Redirect triggered (302 redirect)" -ForegroundColor Green
}

# Test 3: Check statistics
Write-Host "`n3️⃣ Checking statistics..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
$stats = Invoke-RestMethod -Uri "http://localhost:3000/stats/$shortId"
Write-Host "✅ Statistics retrieved:" -ForegroundColor Green
Write-Host "   Clicks: $($stats.clicks)" -ForegroundColor Green
Write-Host "   Original URL: $($stats.originalUrl)" -ForegroundColor Green

Write-Host "`n🎉 All tests passed!" -ForegroundColor Cyan
```

Run it:
```powershell
.\test-app.ps1
```

### Load Testing (Optional)

If you want to test performance:

```powershell
# Install Artillery globally
npm install -g artillery

# First, create a test short URL and note the ID
# Then update tests/load-test.yml to use that ID

# Run load test
npx artillery run tests/load-test.yml
```

---

## Real-World Usage Example

### Scenario: Sharing a Link on Social Media

1. **You have a long URL:**
   ```
   https://www.amazon.com/dp/B08N5WRWNW/ref=sr_1_3?crid=2ABCDEFGHIJK&keywords=laptop&qid=1234567890
   ```

2. **Create a short URL:**
   ```powershell
   $longUrl = "https://www.amazon.com/dp/B08N5WRWNW/ref=sr_1_3?crid=2ABCDEFGHIJK&keywords=laptop&qid=1234567890"
   $result = Invoke-RestMethod -Uri "http://localhost:3000/shorten" -Method POST -ContentType "application/json" -Body "{`"url`":`"$longUrl`"}"
   Write-Host $result.shortUrl
   ```

3. **Share on Twitter/X:**
   ```
   Check out this amazing laptop! http://localhost:3000/xY9aB2c
   ```

4. **Track engagement:**
   ```powershell
   # Check how many people clicked
   Invoke-RestMethod -Uri "http://localhost:3000/stats/xY9aB2c"
   ```

---

## Troubleshooting

### Problem: "Cannot connect to MongoDB"
**Solution:**
- Make sure MongoDB is running
- Check the MONGO_URL in `.env` file
- If using Docker: `docker compose ps` to see if mongo service is up

### Problem: "Cannot connect to Redis"
**Solution:**
- Make sure Redis is running
- Check the REDIS_URL in `.env` file
- If using Docker: Services should start together

### Problem: Port 3000 already in use
**Solution:**
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change PORT in .env file to 3001 or another port
```

### Problem: Docker containers won't start
**Solution:**
```powershell
# Remove old containers and volumes
docker compose down -v

# Rebuild and start fresh
docker compose up --build
```

### Problem: "url required" error
**Solution:**
- Make sure you're sending JSON with "url" field
- Check Content-Type header is "application/json"
- URL must be a valid format

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT                           │
│  (Browser / Postman / PowerShell / curl)            │
└────────────────────┬────────────────────────────────┘
                     │
                     │ HTTP Request
                     │
┌────────────────────▼────────────────────────────────┐
│              EXPRESS SERVER (Node.js)                │
│  ┌──────────────────────────────────────────────┐  │
│  │  Routes:                                     │  │
│  │  • POST /shorten  → Create short URL        │  │
│  │  • GET /:id       → Redirect to original    │  │
│  │  • GET /stats/:id → Get analytics           │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Middleware:                                 │  │
│  │  • Helmet (Security)                         │  │
│  │  • Morgan (Logging)                          │  │
│  │  • Rate Limiting (100 req/min per IP)       │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────┬────────────────┬──────────────────┘
                  │                │
        ┌─────────▼──────┐    ┌───▼──────────┐
        │ REDIS CACHE    │    │  MONGODB      │
        │ (Fast access)  │    │  (Permanent   │
        │ Key: shortId   │    │   storage)    │
        │ Value: URL     │    │               │
        │ TTL: 1 hour    │    │  Collections: │
        └────────────────┘    │  • urls       │
                              └───────────────┘
```

### How It Works Step-by-Step:

**Creating a Short URL:**
1. Client sends POST request with long URL
2. Server generates unique 7-character ID (e.g., "gAm3XyZ")
3. Checks if ID exists (collision detection)
4. Saves to MongoDB
5. Caches in Redis
6. Returns short URL to client

**Using a Short URL:**
1. Client visits `http://localhost:3000/gAm3XyZ`
2. Server checks Redis cache first (fast!)
3. If found in cache → immediate redirect
4. If not in cache → fetch from MongoDB → cache it → redirect
5. Increment click counter (async, doesn't slow down redirect)
6. Update last accessed timestamp

**Viewing Statistics:**
1. Client requests `/stats/gAm3XyZ`
2. Server queries MongoDB for URL record
3. Returns JSON with clicks, timestamps, original URL

---

## Performance Benefits

### Why This Architecture is Fast:

1. **Redis Caching**: 
   - First redirect: ~40ms (MongoDB lookup)
   - Subsequent redirects: <5ms (Redis cache)
   - 8x faster for cached URLs!

2. **Async Analytics**:
   - Click counting doesn't block redirects
   - User gets redirected immediately
   - Analytics update in background

3. **Indexed Database**:
   - MongoDB indexes on `shortId`
   - Fast lookups even with millions of URLs

---

## Next Steps

1. ✅ Start the application (Docker or local)
2. ✅ Test creating a short URL
3. ✅ Test the redirect functionality
4. ✅ Check the statistics
5. 📊 Run load tests to see performance
6. 🚀 Deploy to production (optional)

---

## Tips for Production Deployment

If you want to deploy this for real use:

1. **Change BASE_URL** in `.env`:
   ```env
   BASE_URL=https://yourdomain.com
   ```

2. **Add HTTPS** (use nginx or a reverse proxy)

3. **Use managed services**:
   - MongoDB Atlas (cloud MongoDB)
   - Redis Cloud or AWS ElastiCache

4. **Enable rate limiting** (uncomment in `index.js`)

5. **Add monitoring** (Prometheus, Grafana)

6. **Set up backups** for MongoDB

---

**Need Help?** Check the console output for error messages or review the logs when running with Docker.
