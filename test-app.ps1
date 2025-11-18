Write-Host "🧪 Testing URL Shortener..." -ForegroundColor Cyan

# Test 1: Create a short URL
Write-Host "`n1️⃣ Creating short URL..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/shorten" `
      -Method POST `
      -ContentType "application/json" `
      -Body '{"url":"https://github.com"}'

    $shortId = $result.shortId
    Write-Host "✅ Created: $($result.shortUrl)" -ForegroundColor Green
    Write-Host "   Short ID: $shortId" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create short URL. Is the server running?" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Test redirect
Write-Host "`n2️⃣ Testing redirect..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/$shortId" -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "✅ Redirect works! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        Write-Host "✅ Redirect triggered (302 redirect)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unexpected response: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test 3: Check statistics
Write-Host "`n3️⃣ Checking statistics..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/stats/$shortId"
    Write-Host "✅ Statistics retrieved:" -ForegroundColor Green
    Write-Host "   Clicks: $($stats.clicks)" -ForegroundColor Green
    Write-Host "   Original URL: $($stats.originalUrl)" -ForegroundColor Green
    Write-Host "   Created: $($stats.createdAt)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get statistics" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

# Test 4: Create another URL
Write-Host "`n4️⃣ Creating another short URL..." -ForegroundColor Yellow
try {
    $result2 = Invoke-RestMethod -Uri "http://localhost:3000/shorten" `
      -Method POST `
      -ContentType "application/json" `
      -Body '{"url":"https://www.google.com"}'

    Write-Host "✅ Created: $($result2.shortUrl)" -ForegroundColor Green
    Write-Host "   Short ID: $($result2.shortId)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create second URL" -ForegroundColor Red
}

Write-Host "`n🎉 All tests completed!" -ForegroundColor Cyan
Write-Host "`nℹ️  You can now:" -ForegroundColor White
Write-Host "   - Visit http://localhost:3000/$shortId in your browser" -ForegroundColor White
Write-Host "   - Check stats at http://localhost:3000/stats/$shortId" -ForegroundColor White
