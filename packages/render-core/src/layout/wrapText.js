/**
 * Word-wrap helper — mirrors Reel-Maker App.jsx wrapTextImpl.
 * @param {string} text
 * @param {number} wordsPerLine
 * @param {CanvasRenderingContext2D | { measureText: (s: string) => { width: number } } | null} ctx
 * @param {number | null} maxWidth
 */
export function wrapText(text, wordsPerLine, ctx, maxWidth) {
  if (!text) return [];
  const s = text.toString().trim();
  if (!s) return [];
  const blocks = s.split(/\r?\n/).map((b) => b.trim()).filter(Boolean);
  const lines = [];
  const wp = Math.max(1, wordsPerLine || 4);
  const useWidth = ctx && maxWidth != null && maxWidth > 0;
  for (const block of blocks) {
    const words = block.split(/\s+/).filter(Boolean);
    let i = 0;
    while (i < words.length) {
      let take = Math.min(wp, words.length - i);
      if (useWidth) {
        let lineStr = words.slice(i, i + take).join(' ');
        while (take > 0 && ctx.measureText(lineStr).width > maxWidth) {
          take--;
          lineStr = take > 0 ? words.slice(i, i + take).join(' ') : '';
        }
        if (take === 0) take = 1;
        lineStr = words.slice(i, i + take).join(' ');
        lines.push(lineStr);
        i += take;
      } else {
        lines.push(words.slice(i, i + wp).join(' '));
        i += wp;
      }
    }
  }
  return lines;
}
