/**
 * A utility class for common string operations.
 */
export class StringUtil {
  /**
   * Sanitizes a string by removing special characters and extra spaces.
   * @param input The input string to sanitize.
   * @returns The sanitized string.
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/gi, '');
  }

  /**
   * Truncates a string to the specified length and appends a suffix if truncated.
   * @param str The string to truncate.
   * @param length The maximum length of the string.
   * @param suffix The suffix to append if the string is truncated. Defaults to '...'.
   * @returns The truncated string.
   */
  static truncate(str: string, length: number, suffix = '...'): string {
    return str.length > length ? str.substring(0, length) + suffix : str;
  }

  /**
   * Converts a string to a slug, making it URL-friendly.
   * @param input The string to convert to a slug.
   * @returns The slugified string.
   */
  static toSlug(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Validates an email string format.
   * @param email The email string to validate.
   * @returns True if the email is valid, false otherwise.
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Masks parts of a string, showing only specified parts at the start and end.
   * @param input The string to mask.
   * @param visibleStart The number of visible characters at the start. Defaults to 3.
   * @param visibleEnd The number of visible characters at the end. Defaults to 2.
   * @returns The masked string.
   */
  static maskString(input: string, visibleStart = 3, visibleEnd = 2): string {
    if (input.length <= visibleStart + visibleEnd) {
      return input;
    }

    const start = input.slice(0, visibleStart);
    const end = input.slice(-visibleEnd);
    const maskedPart = '*'.repeat(input.length - visibleStart - visibleEnd);

    return start + maskedPart + end;
  }

  /**
   * Calculates a similarity score between two strings (0 to 1).
   * Uses Levenshtein distance for calculation.
   * @param str1 The first string.
   * @param str2 The second string.
   * @returns A similarity score between 0 (completely different) and 1 (identical).
   */
  static similarityScore(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);

    return 1 - distance / maxLength;
  }

  /**
   * Capitalizes the first letter of a string.
   * @param input The string to capitalize.
   * @returns The capitalized string.
   */
  static capitalize(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  }

  /**
   * Converts a string to title case.
   * @param input The string to convert.
   * @returns The title-cased string.
   */
  static toTitleCase(input: string): string {
    return input
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
