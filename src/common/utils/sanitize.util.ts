/**
 * Utility class for sanitizing input data.
 */
export class SanitizeUtil {
  /**
   * Recursively sanitizes input data by trimming strings and processing nested objects/arrays.
   * @param data The data to sanitize.
   * @returns The sanitized data.
   */
  static sanitizeInput<T>(data: T): T {
    if (Array.isArray(data)) {
      // Recursively sanitize array elements
      return data.map((item) => this.sanitizeInput(item)) as T;
    }

    if (data !== null && typeof data === 'object') {
      const sanitizedData = {} as T;

      for (const key of Object.keys(data)) {
        const value = data[key];
        if (value !== null && value !== undefined) {
          sanitizedData[key] = this.sanitizeInput(value);
        }
      }

      return sanitizedData;
    }

    if (typeof data === 'string') {
      return data.trim() as T;
    }

    // Return primitive values as-is
    return data;
  }
}
