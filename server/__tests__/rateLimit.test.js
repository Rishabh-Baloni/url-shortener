describe('Rate Limiter', () => {
  const createRateLimiter = (maxRequests = 100, windowMs = 60000) => {
    const ipMap = new Map();
    
    return (ip) => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!ipMap.has(ip)) {
        ipMap.set(ip, [now]);
        return { allowed: true, remaining: maxRequests - 1 };
      }
      
      const requests = ipMap.get(ip).filter(time => time > windowStart);
      
      if (requests.length >= maxRequests) {
        return { allowed: false, remaining: 0, retryAfter: requests[0] + windowMs - now };
      }
      
      requests.push(now);
      ipMap.set(ip, requests);
      return { allowed: true, remaining: maxRequests - requests.length };
    };
  };

  test('should allow requests under the limit', () => {
    const limiter = createRateLimiter(5, 60000);
    
    for (let i = 0; i < 5; i++) {
      const result = limiter('127.0.0.1');
      expect(result.allowed).toBe(true);
    }
  });

  test('should block requests over the limit', () => {
    const limiter = createRateLimiter(3, 60000);
    
    limiter('127.0.0.1');
    limiter('127.0.0.1');
    limiter('127.0.0.1');
    
    const result = limiter('127.0.0.1');
    expect(result.allowed).toBe(false);
  });

  test('should track different IPs separately', () => {
    const limiter = createRateLimiter(2, 60000);
    
    const result1 = limiter('127.0.0.1');
    const result2 = limiter('192.168.1.1');
    
    expect(result1.allowed).toBe(true);
    expect(result2.allowed).toBe(true);
  });

  test('should return correct remaining count', () => {
    const limiter = createRateLimiter(5, 60000);
    
    let result = limiter('127.0.0.1');
    expect(result.remaining).toBe(4);
    
    result = limiter('127.0.0.1');
    expect(result.remaining).toBe(3);
  });

  test('should provide retry-after time when blocked', () => {
    const limiter = createRateLimiter(2, 1000);
    
    limiter('127.0.0.1');
    limiter('127.0.0.1');
    
    const result = limiter('127.0.0.1');
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });
});
