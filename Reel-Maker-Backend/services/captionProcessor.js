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
var captionProcessor_exports = {};
__export(captionProcessor_exports, {
  incrementTranscribed: () => incrementTranscribed,
  markFirstEditorReady: () => markFirstEditorReady,
  runRenderPipeline: () => runRenderPipeline,
  runTranscriptionPipeline: () => runTranscriptionPipeline,
  transcribeOneTrack: () => transcribeOneTrack,
  zipRenderedOutputs: () => zipRenderedOutputs
});
module.exports = __toCommonJS(captionProcessor_exports);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_archiver = __toESM(require("archiver"), 1);
var import_url = require("url");
var import_CaptionJob = __toESM(require("../models/CaptionJob"), 1);
var import_CaptionTrack = __toESM(require("../models/CaptionTrack"), 1);
var import_fasterWhisperService = require("./fasterWhisperService");
var import_captionRenderService = require("./captionRenderService");
var import_caption = require("../constants/caption");
const PROCESSED = import_path.default.join(__dirname, "../uploads/processed");
async function markFirstEditorReady(captionJobId, trackId) {
  const job = await import_CaptionJob.default.findOne({ jobId: captionJobId });
  if (!job || job.editorReady) return;
  await import_CaptionJob.default.findOneAndUpdate(
    { jobId: captionJobId },
    {
      editorReady: true,
      editorReadyAt: /* @__PURE__ */ new Date(),
      firstTrackId: trackId,
      status: "editor_ready"
    }
  );
}
async function incrementTranscribed(captionJobId) {
  await import_CaptionJob.default.findOneAndUpdate({ jobId: captionJobId }, { $inc: { transcribedCount: 1 } });
  const job = await import_CaptionJob.default.findOne({ jobId: captionJobId });
  if (job && job.transcribedCount >= job.totalTracks && job.status !== "rendering") {
    const readyCount = await import_CaptionTrack.default.countDocuments({ captionJobId, status: "ready" });
    const updates = { status: readyCount > 0 ? "editor_ready" : "error" };
    if (readyCount > 0) updates.editorReady = true;
    await import_CaptionJob.default.findOneAndUpdate(
      { jobId: captionJobId },
      updates
    );
  }
}
async function transcribeOneTrack(captionJobId, trackId, model, language) {
  const track = await import_CaptionTrack.default.findById(trackId);
  if (!track) throw new Error(`Caption track not found: ${trackId}`);
  if (track.status === "ready" || track.status === "done") return;
  const shouldCountCompletion = track.status !== "error";
  let counted = false;
  try {
    await import_CaptionTrack.default.findByIdAndUpdate(track._id, { status: "transcribing" });
    const result = await (0, import_fasterWhisperService.transcribeWithFasterWhisper)(track.audioPath, { model, language });
    const segments = Array.isArray(result.segments) ? result.segments : [];
    if (!segments.length) {
      const msg =
        "No speech/captions detected in this audio. Try a clearer voice file, or force Hindi/Punjabi/English in the language dropdown.";
      await import_CaptionTrack.default.findByIdAndUpdate(track._id, {
        status: "error",
        segments: [],
        language: result.language || null,
        duration: result.duration ?? null,
        error: msg,
      });
      if (shouldCountCompletion) {
        await incrementTranscribed(captionJobId);
        counted = true;
      }
      throw new Error(msg);
    }
    await import_CaptionTrack.default.findByIdAndUpdate(track._id, {
      status: "ready",
      segments,
      language: result.language,
      duration: result.duration,
      error: null
    });
    await markFirstEditorReady(captionJobId, String(track._id));
    if (shouldCountCompletion) {
      await incrementTranscribed(captionJobId);
      counted = true;
    }
  } catch (e) {
    const current = await import_CaptionTrack.default.findById(trackId).select("status").lean();
    if (current?.status !== "error") {
      await import_CaptionTrack.default.findByIdAndUpdate(track._id, {
        status: "error",
        error: e.message
      });
    }
    if (shouldCountCompletion && !counted) await incrementTranscribed(captionJobId);
    throw e;
  }
}
async function runTranscriptionPipeline(captionJobId, model, language) {
  const tracks = await import_CaptionTrack.default.find({ captionJobId }).sort({ trackIndex: 1 });
  const parallel = Math.max(1, parseInt(process.env.CAPTION_CPU_PARALLEL || "1", 10));
  await import_CaptionJob.default.findOneAndUpdate(
    { jobId: captionJobId },
    { status: "transcribing", totalTracks: tracks.length }
  );
  const ordered = [...tracks].sort((a, b) => a.trackIndex - b.trackIndex);
  if (ordered.length === 0) return;
  let idx = 0;
  const workers = Array.from({ length: Math.min(parallel, ordered.length) }, async () => {
    while (idx < ordered.length) {
      const i = idx++;
      await transcribeOneTrack(captionJobId, String(ordered[i]._id), model, language).catch(() => {});
    }
  });
  await Promise.all(workers);
}
async function zipRenderedOutputs(captionJobId) {
  const dir = import_path.default.join(PROCESSED, captionJobId, "rendered");
  if (!import_fs.default.existsSync(dir)) return null;
  const files = import_fs.default.readdirSync(dir).filter((f) => f.endsWith(".mp4"));
  if (!files.length) return null;
  const zipPath = import_path.default.join(PROCESSED, captionJobId, "captions.zip");
  await new Promise((resolve, reject) => {
    const output = import_fs.default.createWriteStream(zipPath);
    const archive = (0, import_archiver.default)("zip", { zlib: { level: 5 } });
    output.on("close", () => resolve());
    archive.on("error", reject);
    archive.pipe(output);
    for (const f of files) archive.file(import_path.default.join(dir, f), { name: f });
    archive.finalize();
  });
  return `/uploads/processed/${captionJobId}/captions.zip`;
}
async function runRenderPipeline(captionJobId, style) {
  const job = await import_CaptionJob.default.findOne({ jobId: captionJobId });
  if (!job) return;
  const tracks = await import_CaptionTrack.default.find({ captionJobId, status: "ready" }).sort({ trackIndex: 1 });
  const snap = style || job.styleSnapshot || import_caption.DEFAULT_CAPTION_STYLE;
  await import_CaptionJob.default.findOneAndUpdate(
    { jobId: captionJobId },
    { status: "rendering", styleSnapshot: snap }
  );
  let rendered = 0;
  for (const track of tracks) {
    try {
      await import_CaptionTrack.default.findByIdAndUpdate(track._id, { status: "rendering" });
      const outDir = import_path.default.join(PROCESSED, captionJobId, "rendered");
      const outputPath = await (0, import_captionRenderService.renderCaptionedVideo)({
        videoPath: track.videoPath,
        audioPath: track.audioPath,
        segments: track.segments,
        style: snap,
        outDir,
        basename: `track_${track.trackIndex}`
      });
      const url = `/uploads/processed/${captionJobId}/rendered/${import_path.default.basename(outputPath)}`;
      await import_CaptionTrack.default.findByIdAndUpdate(track._id, { status: "done", outputVideoUrl: url });
      rendered++;
      await import_CaptionJob.default.findOneAndUpdate({ jobId: captionJobId }, { renderedCount: rendered });
    } catch (e) {
      await import_CaptionTrack.default.findByIdAndUpdate(track._id, {
        status: "error",
        error: e.message
      });
    }
  }
  const zipUrl = await zipRenderedOutputs(captionJobId);
  await import_CaptionJob.default.findOneAndUpdate(
    { jobId: captionJobId },
    { status: "done", resultZipUrl: zipUrl, renderedCount: rendered }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  incrementTranscribed,
  markFirstEditorReady,
  runRenderPipeline,
  runTranscriptionPipeline,
  transcribeOneTrack,
  zipRenderedOutputs
});
