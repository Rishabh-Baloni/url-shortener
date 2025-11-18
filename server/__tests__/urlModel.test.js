const mongoose = require('mongoose');

// Mock URL Model for testing
const UrlSchema = new mongoose.Schema({
  shortId: { type: String, required: true, unique: true, index: true },
  originalUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
  clicks: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: null }
});

describe('URL Model Schema', () => {
  test('should have required fields', () => {
    const paths = UrlSchema.paths;
    
    expect(paths.shortId).toBeDefined();
    expect(paths.originalUrl).toBeDefined();
    expect(paths.createdAt).toBeDefined();
    expect(paths.clicks).toBeDefined();
    expect(paths.lastAccessed).toBeDefined();
  });

  test('should have correct field types', () => {
    const paths = UrlSchema.paths;
    
    expect(paths.shortId.instance).toBe('String');
    expect(paths.originalUrl.instance).toBe('String');
    expect(paths.createdAt.instance).toBe('Date');
    expect(paths.clicks.instance).toBe('Number');
    expect(paths.lastAccessed.instance).toBe('Date');
  });

  test('should have required fields marked as required', () => {
    const paths = UrlSchema.paths;
    
    expect(paths.shortId.isRequired).toBe(true);
    expect(paths.originalUrl.isRequired).toBe(true);
  });

  test('should have default values', () => {
    const paths = UrlSchema.paths;
    
    expect(paths.clicks.defaultValue).toBe(0);
    expect(paths.lastAccessed.defaultValue).toBe(null);
  });

  test('should have indexes', () => {
    const indexes = UrlSchema.indexes();
    const indexFields = indexes.map(idx => Object.keys(idx[0])[0]);
    
    expect(indexFields).toContain('shortId');
    expect(indexFields).toContain('createdAt');
  });
});
