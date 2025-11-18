describe('URL Validation', () => {
  const isValidUrl = (urlString) => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  describe('Valid URLs', () => {
    test('should accept standard HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    test('should accept standard HTTPS URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    test('should accept URLs with paths', () => {
      expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
    });

    test('should accept URLs with query parameters', () => {
      expect(isValidUrl('https://example.com?param=value&other=123')).toBe(true);
    });

    test('should accept URLs with ports', () => {
      expect(isValidUrl('https://example.com:8080')).toBe(true);
    });

    test('should accept URLs with subdomains', () => {
      expect(isValidUrl('https://sub.example.com')).toBe(true);
    });

    test('should accept URLs with fragments', () => {
      expect(isValidUrl('https://example.com#section')).toBe(true);
    });
  });

  describe('Invalid URLs', () => {
    test('should reject URLs without protocol', () => {
      expect(isValidUrl('example.com')).toBe(false);
    });

    test('should reject empty strings', () => {
      expect(isValidUrl('')).toBe(false);
    });

    test('should reject invalid protocols', () => {
      expect(isValidUrl('ftp://example.com')).toBe(false);
    });

    test('should reject malformed URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
    });

    test('should reject null or undefined', () => {
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
    });
  });
});
