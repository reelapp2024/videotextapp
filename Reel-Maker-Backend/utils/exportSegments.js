var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var exportSegments_exports = {};
__export(exportSegments_exports, {
  buildSegmentsFromText: () => buildSegmentsFromText,
  getCaptionColumnText: () => getCaptionColumnText,
  resolveTrackSegments: () => resolveTrackSegments
});
module.exports = __toCommonJS(exportSegments_exports);
function buildSegmentsFromText(text, durationSec = 30) {
  const t = String(text ?? "").trim();
  if (!t) return [];
  const dur = Math.max(1, Number(durationSec) || 30);
  const words = t.split(/\s+/).filter(Boolean);
  if (!words.length) {
    return [{ id: "seg-0", start: 0, end: dur, text: t, words: [] }];
  }
  const wDur = dur / words.length;
  return [
    {
      id: "seg-0",
      start: 0,
      end: dur,
      text: t,
      words: words.map((word, i) => ({
        word,
        start: +(i * wDur).toFixed(3),
        end: +((i + 1) * wDur).toFixed(3)
      }))
    }
  ];
}
function getCaptionColumnText(row, config) {
  if (row == null) return "";
  const col = config?.captionSync?.columnIndex != null ? Number(config.captionSync.columnIndex) || 0 : 0;
  const arr = Array.isArray(row) ? row : [String(row ?? "")];
  return String(arr[col] ?? "").trim();
}
function resolveTrackSegments(opts) {
  const { segments, excelRow, config, fallbackDuration = 60 } = opts;
  if (segments?.length) return segments;
  const excelText = getCaptionColumnText(excelRow, config);
  if (excelText) return buildSegmentsFromText(excelText, fallbackDuration);
  const syncSegs = config?.captionSync?.segments;
  if (syncSegs?.length) {
    const script = syncSegs.map((s) => String(s.text ?? "").trim()).filter(Boolean).join(" ");
    if (script) return buildSegmentsFromText(script, fallbackDuration);
  }
  return [];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildSegmentsFromText,
  getCaptionColumnText,
  resolveTrackSegments
});
