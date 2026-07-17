/**
 * Word-wrap helper — mirrors Reel-Maker App.jsx wrapTextImpl.
 * Width-based wrap always wins over wordsPerLine so large fonts stay inside the frame.
 * Oversized single words are split into character chunks that fit maxWidth.
 *
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

  const pushCharChunks = (word) => {
    if (!useWidth) {
      lines.push(word);
      return;
    }
    // If even one character is wider than maxWidth, keep a single char (clamp elsewhere).
    let chunk = '';
    for (const ch of Array.from(word)) {
      const test = chunk + ch;
      if (chunk && ctx.measureText(test).width > maxWidth) {
        lines.push(chunk);
        chunk = ch;
      } else {
        chunk = test;
      }
    }
    if (chunk) lines.push(chunk);
  };

  for (const block of blocks) {
    const words = block.split(/\s+/).filter(Boolean);
    let i = 0;
    while (i < words.length) {
      let take = Math.min(wp, words.length - i);
      if (useWidth) {
        let lineStr = words.slice(i, i + take).join(' ');
        while (take > 0 && ctx.measureText(lineStr).width > maxWidth) {
          take -= 1;
          lineStr = take > 0 ? words.slice(i, i + take).join(' ') : '';
        }
        if (take === 0) {
          // One word is wider than the safe line — break it across lines.
          pushCharChunks(words[i]);
          i += 1;
          continue;
        }
        lines.push(words.slice(i, i + take).join(' '));
        i += take;
      } else {
        lines.push(words.slice(i, i + wp).join(' '));
        i += wp;
      }
    }
  }
  return lines;
}
