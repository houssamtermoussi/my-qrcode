/**
 * Global Utility Helpers
 * Inspired by Laravel helper collections.
 */
class Helpers {
  /**
   * Sanitizes a string to prevent simple HTML/script injections.
   * @param {string} str - Raw string input.
   * @returns {string} Cleaned string.
   */
  static sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/<[^>]*>/g, '');
  }

  /**
   * Validates if a string is a valid URL.
   * Useful for validating QR Content when type is 'url'.
   * @param {string} string - The string to validate.
   * @returns {boolean} True if string is a valid URL, false otherwise.
   */
  static isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}

module.exports = Helpers;
