const https = require('https');
const http = require('http');

const BASE_URL = 'https://url-shortener-ybpw.onrender.com';
const TEST_DURATION = 60; // seconds
const CONCURRENT_USERS = 100;

// Metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  redirectLatencies: [],
  shortenLatencies: [],
  cacheHits: 0,
  cacheMisses: 0,
  startTime: null,
  endTime: null
};

// Make HTTP request
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LoadTest/1.0'
      }
    };
    
    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }
    
    const startTime = Date.now();
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        const latency = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          data: responseData,
          latency,
          headers: res.headers
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Create short URL
async function createShortUrl() {
  try {
    const randomUrl = `https://example.com/test-${Math.random().toString(36).substring(7)}`;
    const response = await makeRequest('POST', '/shorten', { url: randomUrl });
    
    metrics.totalRequests++;
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      metrics.successfulRequests++;
      metrics.shortenLatencies.push(response.latency);
      const data = JSON.parse(response.data);
      return data.shortId;
    } else {
      metrics.failedRequests++;
      return null;
    }
  } catch (error) {
    metrics.failedRequests++;
    metrics.totalRequests++;
    return null;
  }
}

// Test redirect (first access - cache miss)
async function testRedirect(shortId, isCacheMiss = false) {
  try {
    const response = await makeRequest('GET', `/${shortId}`);
    
    metrics.totalRequests++;
    
    if (response.statusCode === 302 || response.statusCode === 301) {
      metrics.successfulRequests++;
      metrics.redirectLatencies.push(response.latency);
      
      if (isCacheMiss) {
        metrics.cacheMisses++;
      } else {
        metrics.cacheHits++;
      }
      
      return true;
    } else {
      metrics.failedRequests++;
      return false;
    }
  } catch (error) {
    metrics.failedRequests++;
    metrics.totalRequests++;
    return false;
  }
}

// Simulate user flow
async function simulateUser() {
  // Create a URL
  const shortId = await createShortUrl();
  
  if (shortId) {
    // First redirect (cache miss)
    await testRedirect(shortId, true);
    
    // Second redirect (cache hit)
    await testRedirect(shortId, false);
    
    // Third redirect (cache hit)
    await testRedirect(shortId, false);
  }
}

// Calculate percentile
function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = arr.slice().sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * p / 100) - 1;
  return sorted[index];
}

// Run load test
async function runLoadTest() {
  console.log('🚀 Starting Load Test...');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Duration: ${TEST_DURATION}s`);
  console.log(`Concurrent Users: ${CONCURRENT_USERS}\n`);
  
  metrics.startTime = Date.now();
  const endTime = metrics.startTime + (TEST_DURATION * 1000);
  
  const workers = [];
  
  // Start concurrent workers
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    workers.push((async () => {
      while (Date.now() < endTime) {
        await simulateUser();
        // Small delay between iterations
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    })());
  }
  
  // Wait for all workers to complete
  await Promise.all(workers);
  
  metrics.endTime = Date.now();
  
  // Print results
  printResults();
}

// Print detailed results
function printResults() {
  const duration = (metrics.endTime - metrics.startTime) / 1000;
  const rps = metrics.totalRequests / duration;
  
  console.log('\n📊 Load Test Results');
  console.log('='.repeat(60));
  
  console.log('\n📈 Overall Metrics:');
  console.log(`  Duration:           ${duration.toFixed(2)}s`);
  console.log(`  Total Requests:     ${metrics.totalRequests}`);
  console.log(`  Successful:         ${metrics.successfulRequests} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`  Failed:             ${metrics.failedRequests} (${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`  Requests/sec:       ${rps.toFixed(2)} RPS`);
  
  console.log('\n⚡ Redirect Performance (All):');
  if (metrics.redirectLatencies.length > 0) {
    console.log(`  Total Redirects:    ${metrics.redirectLatencies.length}`);
    console.log(`  Average Latency:    ${(metrics.redirectLatencies.reduce((a, b) => a + b, 0) / metrics.redirectLatencies.length).toFixed(2)}ms`);
    console.log(`  Min Latency:        ${Math.min(...metrics.redirectLatencies)}ms`);
    console.log(`  Max Latency:        ${Math.max(...metrics.redirectLatencies)}ms`);
    console.log(`  P50 Latency:        ${percentile(metrics.redirectLatencies, 50)}ms`);
    console.log(`  P95 Latency:        ${percentile(metrics.redirectLatencies, 95)}ms`);
    console.log(`  P99 Latency:        ${percentile(metrics.redirectLatencies, 99)}ms`);
  }
  
  console.log('\n🔗 URL Creation Performance:');
  if (metrics.shortenLatencies.length > 0) {
    console.log(`  Total Created:      ${metrics.shortenLatencies.length}`);
    console.log(`  Average Latency:    ${(metrics.shortenLatencies.reduce((a, b) => a + b, 0) / metrics.shortenLatencies.length).toFixed(2)}ms`);
    console.log(`  Min Latency:        ${Math.min(...metrics.shortenLatencies)}ms`);
    console.log(`  Max Latency:        ${Math.max(...metrics.shortenLatencies)}ms`);
    console.log(`  P95 Latency:        ${percentile(metrics.shortenLatencies, 95)}ms`);
  }
  
  console.log('\n💾 Cache Performance:');
  const totalCacheOps = metrics.cacheHits + metrics.cacheMisses;
  if (totalCacheOps > 0) {
    console.log(`  Cache Hits:         ${metrics.cacheHits} (${((metrics.cacheHits / totalCacheOps) * 100).toFixed(2)}%)`);
    console.log(`  Cache Misses:       ${metrics.cacheMisses} (${((metrics.cacheMisses / totalCacheOps) * 100).toFixed(2)}%)`);
  }
  
  console.log('\n='.repeat(60));
  
  // Save results to JSON
  const results = {
    timestamp: new Date().toISOString(),
    config: {
      target: BASE_URL,
      duration: TEST_DURATION,
      concurrentUsers: CONCURRENT_USERS
    },
    summary: {
      duration: duration,
      totalRequests: metrics.totalRequests,
      successfulRequests: metrics.successfulRequests,
      failedRequests: metrics.failedRequests,
      requestsPerSecond: rps,
      successRate: (metrics.successfulRequests / metrics.totalRequests) * 100
    },
    redirect: {
      count: metrics.redirectLatencies.length,
      avgLatency: metrics.redirectLatencies.reduce((a, b) => a + b, 0) / metrics.redirectLatencies.length,
      minLatency: Math.min(...metrics.redirectLatencies),
      maxLatency: Math.max(...metrics.redirectLatencies),
      p50: percentile(metrics.redirectLatencies, 50),
      p95: percentile(metrics.redirectLatencies, 95),
      p99: percentile(metrics.redirectLatencies, 99)
    },
    shorten: {
      count: metrics.shortenLatencies.length,
      avgLatency: metrics.shortenLatencies.reduce((a, b) => a + b, 0) / metrics.shortenLatencies.length,
      minLatency: Math.min(...metrics.shortenLatencies),
      maxLatency: Math.max(...metrics.shortenLatencies),
      p95: percentile(metrics.shortenLatencies, 95)
    },
    cache: {
      hits: metrics.cacheHits,
      misses: metrics.cacheMisses,
      hitRate: (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100
    }
  };
  
  const fs = require('fs');
  const resultsDir = './results';
  
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    `${resultsDir}/load-test-${Date.now()}.json`,
    JSON.stringify(results, null, 2)
  );
  
  console.log(`\n✅ Results saved to ${resultsDir}/load-test-${Date.now()}.json`);
}

// Run the test
runLoadTest().catch(console.error);
