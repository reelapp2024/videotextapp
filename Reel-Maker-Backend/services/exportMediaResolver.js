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
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var exportMediaResolver_exports = {};
__export(exportMediaResolver_exports, {
  resolveSettingsBackgroundPaths: () => resolveSettingsBackgroundPaths
});
module.exports = __toCommonJS(exportMediaResolver_exports);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_https = __toESM(require("https"), 1);
var import_http = __toESM(require("http"), 1);
function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? import_https.default : import_http.default;
    const file = import_fs.default.createWriteStream(dest);
    proto.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        import_fs.default.unlinkSync(dest);
        downloadUrl(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        import_fs.default.unlinkSync(dest);
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (e) => {
      try {
        import_fs.default.unlinkSync(dest);
      } catch {
      }
      reject(e);
    });
  });
}
function extFromUrl(url, fallback) {
  try {
    const p = new URL(url).pathname;
    const ext = import_path.default.extname(p).toLowerCase();
    if (ext && ext.length <= 5) return ext;
  } catch {
  }
  return fallback;
}
async function resolveSettingsBackgroundPaths(config, jobDir) {
  import_fs.default.mkdirSync(jobDir, { recursive: true });
  const bg = config?.background || {};
  let imagePath = null;
  let videoPath = null;
  if (bg.type === "image" && bg.images?.length > 0) {
    const idx = bg.imageVideoMode === "first" ? 0 : 0;
    const url = bg.images[idx]?.url;
    if (url && /^https?:\/\//i.test(url)) {
      const dest = import_path.default.join(jobDir, `settings_bg${extFromUrl(url, ".jpg")}`);
      try {
        await downloadUrl(url, dest);
        if (import_fs.default.existsSync(dest) && import_fs.default.statSync(dest).size > 0) imagePath = dest;
      } catch (e) {
        console.warn("[export-media] settings bg image download failed:", e.message);
      }
    }
  }
  if (bg.type === "video" && bg.videos?.length > 0) {
    const url = bg.videos[0]?.url;
    if (url && /^https?:\/\//i.test(url)) {
      const dest = import_path.default.join(jobDir, `settings_bg_vid${extFromUrl(url, ".mp4")}`);
      try {
        await downloadUrl(url, dest);
        if (import_fs.default.existsSync(dest) && import_fs.default.statSync(dest).size > 0) videoPath = dest;
      } catch (e) {
        console.warn("[export-media] settings bg video download failed:", e.message);
      }
    }
  }
  return { imagePath, videoPath };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  resolveSettingsBackgroundPaths
});
