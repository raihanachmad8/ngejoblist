import { SanitizeUtil } from './sanitize.util';

describe('SanitizeUtil', () => {
  it('should trim strings', () => {
    const input = { name: '  John Doe  ', email: '  john@example.com ' };
    const sanitized = SanitizeUtil.sanitizeInput(input);
    expect(sanitized).toEqual({ name: 'John Doe', email: 'john@example.com' });
  });

  it('should sanitize nested objects', () => {
    const input = { user: { name: '  John  ', address: { city: '  NYC  ' } } };
    const sanitized = SanitizeUtil.sanitizeInput(input);
    expect(sanitized).toEqual({
      user: { name: 'John', address: { city: 'NYC' } },
    });
  });

  it('should sanitize arrays', () => {
    const input = ['  hello  ', '  world  '];
    const sanitized = SanitizeUtil.sanitizeInput(input);
    expect(sanitized).toEqual(['hello', 'world']);
  });

  it('should handle primitive types', () => {
    expect(SanitizeUtil.sanitizeInput('  hello  ')).toBe('hello');
    expect(SanitizeUtil.sanitizeInput(123)).toBe(123);
    expect(SanitizeUtil.sanitizeInput(true)).toBe(true);
  });

  it('should ignore null and undefined', () => {
    const input = { name: '  John  ', age: null, country: undefined };
    const sanitized = SanitizeUtil.sanitizeInput(input);
    expect(sanitized).toEqual({ name: 'John' });
  });
});
