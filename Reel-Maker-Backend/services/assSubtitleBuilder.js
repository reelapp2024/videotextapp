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
var assSubtitleBuilder_exports = {};
__export(assSubtitleBuilder_exports, {
  buildAssFromSegments: () => buildAssFromSegments,
  writeAssFile: () => writeAssFile
});
module.exports = __toCommonJS(assSubtitleBuilder_exports);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
function assColor(hex, alpha = "00") {
  const h = (hex || "#FFFFFF").replace("#", "");
  if (h.length !== 6) return "&H00FFFFFF&";
  return `&H${alpha}${h.slice(4, 6)}${h.slice(2, 4)}${h.slice(0, 2)}&`;
}
function formatAssTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor(sec % 3600 / 60);
  const s = Math.floor(sec % 60);
  const cs = Math.floor(sec % 1 * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}
function esc(t) {
  return String(t ?? "").replace(/\{/g, "\\{").replace(/\}/g, "\\}").replace(/\n/g, "\\N");
}
function buildAssFromSegments(segments, style, playResX = 1080, playResY = 1920) {
  const fontSize = style.fontSize ?? 52;
  const marginV = style.marginV ?? 72;
  const align = style.position === "top" ? 8 : style.position === "center" ? 5 : 2;
  const bold = style.bold ? -1 : 0;
  const outline = style.outlineWidth ?? 3;
  const primary = assColor(style.primaryColor || "#FFFFFF");
  const outlineC = assColor(style.outlineColor || "#000000");
  const back = assColor(style.backgroundColor || "#000000", "80");
  let header = `[Script Info]
ScriptType: v4.00+
PlayResX: ${playResX}
PlayResY: ${playResY}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${style.fontFamily || "Arial"},${fontSize},${primary},${primary},${outlineC},${back},${bold},0,0,0,100,100,0,0,1,${outline},${style.shadow ? 2 : 0},${align},40,40,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  for (const seg of segments) {
    const start = formatAssTime(seg.start);
    const end = formatAssTime(seg.end);
    if (style.karaoke && seg.words?.length) {
      let line = "";
      for (const w of seg.words) {
        const k = Math.max(1, Math.round((w.end - w.start) * 100));
        line += `{\\k${k}}${esc(w.word)} `;
      }
      header += `Dialogue: 0,${start},${end},Default,,0,0,0,,${line.trim()}
`;
    } else {
      header += `Dialogue: 0,${start},${end},Default,,0,0,0,,${esc(seg.text)}
`;
    }
  }
  return header;
}
function writeAssFile(segments, style, outDir, basename) {
  import_fs.default.mkdirSync(outDir, { recursive: true });
  const p = import_path.default.join(outDir, `${basename}.ass`);
  import_fs.default.writeFileSync(p, buildAssFromSegments(segments, style), "utf-8");
  return p;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildAssFromSegments,
  writeAssFile
});
