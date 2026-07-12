/**
 * src/utils/helpers.js
 * Common utility functions.
 */

/**
 * Truncates text to a specified length and adds an ellipsis.
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Basic email validation.
 */
export const isValidEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};
