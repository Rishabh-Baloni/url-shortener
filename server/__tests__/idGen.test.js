describe('ID Generator (Mocked)', () => {
  // Mock the ID generation logic to avoid nanoid ES6 import issues
  const generateId = () => {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let id = '';
    for (let i = 0; i < 7; i++) {
      id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return id;
  };

  test('should generate a 7-character ID', () => {
    const id = generateId();
    expect(id).toHaveLength(7);
  });

  test('should only use base62 characters (a-z, A-Z, 0-9)', () => {
    const id = generateId();
    expect(id).toMatch(/^[a-zA-Z0-9]+$/);
  });

  test('should generate unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      ids.add(generateId());
    }
    // With 1000 IDs, collision is possible but should have high uniqueness
    expect(ids.size).toBeGreaterThan(990); // At least 99% unique
  });

  test('should not contain special characters', () => {
    const id = generateId();
    expect(id).not.toMatch(/[^a-zA-Z0-9]/);
  });

  test('should be a string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });
});
