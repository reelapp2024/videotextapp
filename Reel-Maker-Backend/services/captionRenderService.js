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
var captionRenderService_exports = {};
__export(captionRenderService_exports, {
  renderCaptionedVideo: () => renderCaptionedVideo
});
module.exports = __toCommonJS(captionRenderService_exports);
var import_ffmpeg = __toESM(require("@ffmpeg-installer/ffmpeg"), 1);
var import_ffprobe = __toESM(require("@ffprobe-installer/ffprobe"), 1);
var import_fluent_ffmpeg = __toESM(require("fluent-ffmpeg"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_util = require("util");
var import_assSubtitleBuilder = require("./assSubtitleBuilder");
import_fluent_ffmpeg.default.setFfmpegPath(import_ffmpeg.default.path);
import_fluent_ffmpeg.default.setFfprobePath(import_ffprobe.default.path);
const ffprobeAsync = (0, import_util.promisify)(import_fluent_ffmpeg.default.ffprobe);
function escAssPath(p) {
  return import_path.default.resolve(p).replace(/\\/g, "/").replace(/:/g, "\\:");
}
async function getDuration(filePath) {
  const meta = await ffprobeAsync(filePath);
  return meta?.format?.duration ?? 0;
}
async function renderCaptionedVideo(options) {
  const { videoPath, audioPath, segments, style, outDir, basename } = options;
  import_fs.default.mkdirSync(outDir, { recursive: true });
  const assPath = (0, import_assSubtitleBuilder.writeAssFile)(segments, style, outDir, basename);
  const outputPath = import_path.default.join(outDir, `${basename}.mp4`);
  const vf = `ass='${escAssPath(assPath)}'`;
  if (videoPath && import_fs.default.existsSync(videoPath)) {
    await new Promise((resolve, reject) => {
      (0, import_fluent_ffmpeg.default)(videoPath).input(audioPath).outputOptions([
        "-vf",
        vf,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        "-movflags",
        "+faststart"
      ]).output(outputPath).on("end", () => resolve()).on("error", reject).run();
    });
  } else {
    const dur = Math.max(1, await getDuration(audioPath));
    await new Promise((resolve, reject) => {
      (0, import_fluent_ffmpeg.default)().input(`color=c=black:s=1080x1920:d=${dur}`).inputFormat("lavfi").input(audioPath).outputOptions([
        "-vf",
        vf,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-shortest",
        "-movflags",
        "+faststart"
      ]).output(outputPath).on("end", () => resolve()).on("error", reject).run();
    });
  }
  return outputPath;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  renderCaptionedVideo
});
