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
var videoLayoutFilters_exports = {};
__export(videoLayoutFilters_exports, {
  buildContainZoomFilter: () => buildContainZoomFilter,
  buildFgOverBaseFilter: () => buildFgOverBaseFilter,
  buildTrimPts: () => buildTrimPts,
  clampOpacity: () => clampOpacity,
  clampZoom: () => clampZoom,
  readVideoLayoutFromConfig: () => readVideoLayoutFromConfig,
  resolveExportVideoVolume: () => resolveExportVideoVolume
});
module.exports = __toCommonJS(videoLayoutFilters_exports);
function clampZoom(z) {
  const n = Number(z);
  if (!Number.isFinite(n)) return 1;
  return Math.max(0.5, Math.min(1.5, n));
}
function clampOpacity(o) {
  const n = Number(o);
  if (!Number.isFinite(n)) return 1;
  return Math.max(0, Math.min(1, n));
}
function buildContainZoomFilter(w, h, zoomScale = 1) {
  const z = clampZoom(zoomScale);
  if (Math.abs(z - 1) < 1e-3) {
    return `scale=${w}:${h}:force_original_aspect_ratio=decrease:flags=fast_bilinear,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black`;
  }
  return [
    `scale=${w}:${h}:force_original_aspect_ratio=decrease:flags=fast_bilinear`,
    `scale=iw*${z}:ih*${z}:flags=fast_bilinear`,
    `crop=min(${w}\\,iw):min(${h}\\,ih):(iw-ow)/2:(ih-oh)/2`,
    `pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black`
  ].join(",");
}
function buildTrimPts(durStr) {
  return `trim=duration=${durStr},setpts=PTS-STARTPTS`;
}
function buildFgOverBaseFilter(fgLabel, baseLabel, outLabel, opacity) {
  const o = clampOpacity(opacity);
  if (o >= 0.999) {
    return `[${baseLabel}][${fgLabel}]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:format=auto[${outLabel}]`;
  }
  const fgAlpha = `${fgLabel}a`;
  return `[${fgLabel}]format=rgba,colorchannelmixer=aa=${o.toFixed(3)}[${fgAlpha}];[${baseLabel}][${fgAlpha}]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:format=auto[${outLabel}]`;
}
function readVideoLayoutFromConfig(config) {
  return {
    zoomScale: clampZoom(config?.video?.zoomScale ?? 1),
    opacity: clampOpacity(config?.video?.opacity ?? 1)
  };
}
function resolveExportVideoVolume(config, hasVoiceCaptions) {
  const videoVol = config?.video?.volumeEnabled !== false ? Number(config?.video?.volume ?? 1) : 0;
  return hasVoiceCaptions ? 0 : videoVol;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildContainZoomFilter,
  buildFgOverBaseFilter,
  buildTrimPts,
  clampOpacity,
  clampZoom,
  readVideoLayoutFromConfig,
  resolveExportVideoVolume
});
