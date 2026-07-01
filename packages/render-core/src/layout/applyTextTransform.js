/**
 * Apply overlay textTransform to raw string.
 * @param {string} text
 * @param {string | undefined} transform
 */
export function applyTextTransform(text, transform) {
  if (!text) return '';
  if (transform === 'uppercase') return text.toUpperCase();
  if (transform === 'lowercase') return text.toLowerCase();
  if (transform === 'capitalize') {
    return text
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
  return text;
}
