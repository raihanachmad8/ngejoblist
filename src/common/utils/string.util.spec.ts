import { StringUtil } from './string.util';

describe('StringUtil', () => {
  it('sanitizeInput should remove special characters and extra spaces', () => {
    const input = '  Hello   World!!! ';
    const sanitized = StringUtil.sanitizeInput(input);
    expect(sanitized).toBe('Hello World');
  });

  it('truncate should shorten the string and add suffix if needed', () => {
    const input = 'This is a long string.';
    expect(StringUtil.truncate(input, 10)).toBe('This is a ...');
    expect(StringUtil.truncate(input, 50)).toBe(input);
  });

  it('toSlug should convert a string to a slug', () => {
    const input = 'Hello World! Slug Test';
    const slug = StringUtil.toSlug(input);
    expect(slug).toBe('hello-world-slug-test');
  });

  it('isValidEmail should validate email strings', () => {
    expect(StringUtil.isValidEmail('test@example.com')).toBe(true);
    expect(StringUtil.isValidEmail('invalid-email')).toBe(false);
  });

  it('maskString should mask parts of a string', () => {
    expect(StringUtil.maskString('1234567890', 3, 2)).toBe('123*****90');
    expect(StringUtil.maskString('abc', 2, 1)).toBe('abc');
  });

  it('similarityScore should calculate similarity between two strings', () => {
    expect(StringUtil.similarityScore('kitten', 'sitting')).toBeCloseTo(
      0.571,
      3,
    );
    expect(StringUtil.similarityScore('test', 'test')).toBe(1);
    expect(StringUtil.similarityScore('test', 'abcd')).toBe(0);
  });

  it('capitalize should capitalize the first letter of a string', () => {
    expect(StringUtil.capitalize('hello')).toBe('Hello');
    expect(StringUtil.capitalize('HELLO')).toBe('Hello');
  });

  it('toTitleCase should convert a string to title case', () => {
    const input = 'hello world title case';
    const titleCased = StringUtil.toTitleCase(input);
    expect(titleCased).toBe('Hello World Title Case');
  });
});
