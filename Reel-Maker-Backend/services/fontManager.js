var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var fontManager_exports = {};
__export(fontManager_exports, {
  WINDOWS_SYSTEM_FONTS: () => WINDOWS_SYSTEM_FONTS,
  downloadFontFamily: () => downloadFontFamily,
  ensureFontFamilies: () => ensureFontFamilies,
  familyToSlug: () => familyToSlug,
  getFontsDirectory: () => getFontsDirectory,
  getManifestPath: () => getManifestPath,
  hasBundledFont: () => hasBundledFont,
  installFontToWindows: () => installFontToWindows,
  isSystemFont: () => isSystemFont,
  listGoogleFontsToInstall: () => listGoogleFontsToInstall,
  loadAppFontList: () => loadAppFontList,
  loadManifest: () => loadManifest
});
module.exports = __toCommonJS(fontManager_exports);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
const BACKEND_ROOT = import_path.default.resolve(__dirname, "..");
const WINDOWS_SYSTEM_FONTS = /* @__PURE__ */ new Set([
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
  "Arial Black",
  "Courier New",
  "Palatino Linotype",
  "Lucida Sans",
  "Lucida Console",
  "Garamond",
  "Bookman",
  "Brush Script MT",
  "Chalkduster",
  "Copperplate",
  "Didot",
  "Futura",
  "Gill Sans",
  "Optima",
  "Papyrus",
  "American Typewriter",
  "Marker Felt"
]);
const GWFH_API = "https://gwfh.mranftl.com/api/fonts";
const VARIANTS_TO_FETCH = /* @__PURE__ */ new Set(["regular", "700"]);
function getFontsDirectory() {
  return import_path.default.join(BACKEND_ROOT, "fonts");
}
function getManifestPath() {
  return import_path.default.join(BACKEND_ROOT, "data", "font-manifest.json");
}
function migrateLegacyManifest() {
  const legacy = import_path.default.join(getFontsDirectory(), "manifest.json");
  const next = getManifestPath();
  if (!import_fs.default.existsSync(legacy)) return;
  import_fs.default.mkdirSync(import_path.default.dirname(next), { recursive: true });
  if (!import_fs.default.existsSync(next)) {
    import_fs.default.copyFileSync(legacy, next);
  }
  try {
    import_fs.default.unlinkSync(legacy);
  } catch {
  }
}
function loadManifest() {
  migrateLegacyManifest();
  const p = getManifestPath();
  if (!import_fs.default.existsSync(p)) return {};
  try {
    return JSON.parse(import_fs.default.readFileSync(p, "utf-8"));
  } catch {
    return {};
  }
}
function saveManifest(manifest) {
  const p = getManifestPath();
  import_fs.default.mkdirSync(import_path.default.dirname(p), { recursive: true });
  import_fs.default.writeFileSync(p, JSON.stringify(manifest, null, 2), "utf-8");
}
function familyToSlug(family) {
  return family.trim().toLowerCase().replace(/\s+/g, "-");
}
function isSystemFont(family) {
  return WINDOWS_SYSTEM_FONTS.has(family.trim());
}
function hasBundledFont(family) {
  if (isSystemFont(family)) return true;
  const manifest = loadManifest();
  return Boolean(manifest[family]?.files?.length);
}
function safeFileName(family, variantId) {
  const base = family.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
  const suffix = variantId === "regular" ? "Regular" : variantId === "700" ? "Bold" : variantId;
  return `${base}-${suffix}.ttf`;
}
async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Video-Text-App-FontSetup/1.0" }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}
async function downloadFile(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Video-Text-App-FontSetup/1.0" }
  });
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  import_fs.default.mkdirSync(import_path.default.dirname(dest), { recursive: true });
  import_fs.default.writeFileSync(dest, buf);
}
async function installFontToWindows(ttfPath) {
  if (process.platform !== "win32") return false;
  if (!import_fs.default.existsSync(ttfPath)) return false;
  const { execFile } = await import("child_process");
  const { promisify } = await import("util");
  const execFileAsync = promisify(execFile);
  const escaped = ttfPath.replace(/'/g, "''");
  const ps = `
$dest = Join-Path $env:LOCALAPPDATA 'Microsoft\\Windows\\Fonts'
New-Item -ItemType Directory -Force -Path $dest | Out-Null
$name = Split-Path -Leaf '${escaped}'
$target = Join-Path $dest $name
Copy-Item -LiteralPath '${escaped}' -Destination $target -Force
$reg = 'HKCU:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts'
$label = [System.IO.Path]::GetFileNameWithoutExtension($name) + ' (TrueType)'
Set-ItemProperty -Path $reg -Name $label -Value $name -Type String -Force
Write-Output 'ok'
`.trim();
  try {
    await execFileAsync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps], {
      timeout: 3e4
    });
    return true;
  } catch (err) {
    console.warn(`[fonts] Windows install failed for ${import_path.default.basename(ttfPath)}:`, err);
    return false;
  }
}
async function downloadFontFamily(family, opts = {}) {
  const name = family.trim();
  if (!name || isSystemFont(name)) return true;
  if (hasBundledFont(name)) return true;
  const slug = familyToSlug(name);
  let meta;
  try {
    meta = await fetchJson(`${GWFH_API}/${encodeURIComponent(slug)}`);
  } catch {
    console.warn(`[fonts] Not found on Google Fonts: ${name} (${slug})`);
    return false;
  }
  const fontsDir = getFontsDirectory();
  import_fs.default.mkdirSync(fontsDir, { recursive: true });
  const saved = [];
  for (const variant of meta.variants || []) {
    if (!VARIANTS_TO_FETCH.has(variant.id)) continue;
    const ttfUrl = variant.ttf;
    if (!ttfUrl) continue;
    const fileName = safeFileName(name, variant.id);
    const dest = import_path.default.join(fontsDir, fileName);
    if (!import_fs.default.existsSync(dest)) {
      try {
        await downloadFile(ttfUrl, dest);
        console.log(`[fonts] Downloaded ${fileName}`);
      } catch (err) {
        console.warn(`[fonts] Failed ${fileName}:`, err);
        continue;
      }
    }
    saved.push(fileName);
    if (opts.installWindows) await installFontToWindows(dest);
  }
  if (!saved.length) return false;
  const manifest = loadManifest();
  manifest[name] = {
    family: name,
    files: saved,
    installedWindows: Boolean(opts.installWindows)
  };
  saveManifest(manifest);
  return true;
}
async function ensureFontFamilies(families) {
  const unique = [...new Set(families.map((f) => String(f || "").trim()).filter(Boolean))];
  await Promise.all(
    unique.map(async (family) => {
      if (isSystemFont(family) || hasBundledFont(family)) return;
      await downloadFontFamily(family, { installWindows: process.platform === "win32" });
    })
  );
}

function loadAppFontList() {
  const presetsPath = import_path.default.resolve(BACKEND_ROOT, "../Reel-Maker/src/textStylePresets.js");
  if (!import_fs.default.existsSync(presetsPath)) return [];
  const src = import_fs.default.readFileSync(presetsPath, "utf-8");
  const block = src.match(/const FONTS_RAW = \[([\s\S]*?)\];/);
  if (!block) return [];
  const names = [];
  const re = /'([^']+)'|"([^"]+)"/g;
  let m;
  while (m = re.exec(block[1])) {
    names.push(m[1] || m[2]);
  }
  return [...new Set(names)];
}

function listGoogleFontsToInstall() {
  return loadAppFontList().filter((f) => !isSystemFont(f));
}

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WINDOWS_SYSTEM_FONTS,
  downloadFontFamily,
  ensureFontFamilies,
  familyToSlug,
  getFontsDirectory,
  getManifestPath,
  hasBundledFont,
  installFontToWindows,
  isSystemFont,
  listGoogleFontsToInstall,
  loadAppFontList,
  loadManifest
});