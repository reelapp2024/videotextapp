/**
 * Download Google Fonts used by the app and install them on Windows.
 *
 * Usage:
 *   npm run fonts:setup              # all app fonts (~200), Windows install
 *   npm run fonts:setup -- --quick   # preset fonts only (~35)
 */
const fs = require('fs');
const {
  downloadFontFamily,
  getFontsDirectory,
  listGoogleFontsToInstall,
  loadAppFontList,
} = require('../services/fontManager');

const QUICK_FONTS = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Poppins', 'Nunito', 'Raleway',
  'Bebas Neue', 'Anton', 'Impact', 'Playfair Display', 'Merriweather', 'Inter', 'Rubik',
  'Work Sans', 'Quicksand', 'Ubuntu', 'Exo 2', 'Kanit', 'Manrope', 'Outfit', 'Space Grotesk',
  'Sora', 'Lexend', 'DM Sans', 'Figtree', 'Plus Jakarta Sans', 'Pacifico', 'Dancing Script',
  'Lobster', 'Permanent Marker', 'Righteous', 'Bangers', 'Orbitron', 'Russo One', 'Staatliches',
  'Caveat', 'Amatic SC', 'Great Vibes', 'Satisfy', 'Comfortaa', 'Unbounded', 'Archivo Black',
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runPool(items, concurrency, fn) {
  let i = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const quick = process.argv.includes('--quick');
  const noWindows = process.argv.includes('--no-windows');
  const installWindows = process.platform === 'win32' && !noWindows;

  const all = loadAppFontList();
  const google = listGoogleFontsToInstall();
  const targets = quick ? QUICK_FONTS.filter((f) => all.includes(f)) : google;

  console.log(`[fonts:setup] ${targets.length} Google fonts to fetch`);
  console.log(`[fonts:setup] output: ${getFontsDirectory()}`);
  console.log(`[fonts:setup] Windows install: ${installWindows}`);

  fs.mkdirSync(getFontsDirectory(), { recursive: true });

  let ok = 0;
  let fail = 0;

  await runPool(targets, 4, async (family) => {
    const success = await downloadFontFamily(family, { installWindows });
    if (success) ok++;
    else fail++;
    await sleep(120);
  });

  console.log(`[fonts:setup] done — ok=${ok} failed=${fail}`);
  if (installWindows) {
    console.log('[fonts:setup] Fonts copied to %LOCALAPPDATA%\\Microsoft\\Windows\\Fonts');
    console.log('[fonts:setup] Agar abhi bhi purana font dikhe to app/backend restart karein.');
  }
}

main().catch((err) => {
  console.error('[fonts:setup] fatal:', err);
  process.exit(1);
});
