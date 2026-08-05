/**
 * sanitize.js — lightweight client-side input sanitization utilities.
 *
 * These helpers guard against obvious injection attempts (e.g. HTML/script
 * tags in text fields) and normalize whitespace before values are sent to
 * the API. They do NOT replace server-side validation.
 */

/**
 * Strip HTML/script tags and normalize whitespace in a plain text string.
 * @param {string} str
 * @returns {string}
 */
export function sanitizeText(str) {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    // Remove HTML tags (e.g. <script>, <img onerror=…>, etc.)
    .replace(/<[^>]*>/g, '')
    // Collapse multiple consecutive whitespace characters into one
    .replace(/\s{2,}/g, ' ');
}

/**
 * Sanitize an email address: trim whitespace and lowercase.
 * @param {string} str
 * @returns {string}
 */
export function sanitizeEmail(str) {
  if (typeof str !== 'string') return str;
  return str.trim().toLowerCase();
}

/**
 * Apply sanitizeText to every string value in a form-data object.
 * Non-string values (numbers, booleans, etc.) are passed through unchanged.
 * @param {Object} obj
 * @returns {Object}
 */
export function sanitizeFormData(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === 'string' ? sanitizeText(value) : value;
  }
  return result;
}
