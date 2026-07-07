const mongoose = require('mongoose');

const videoJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['queued', 'processing', 'done', 'error', 'cancelled'], default: 'queued' },
  progress: { type: Number, default: 0 },
  resultUrl: { type: String, default: null },
  outputFiles: [{ type: String }],
  error: { type: String, default: null },
  totalVideos: { type: Number, default: 0 },
  completedVideos: { type: Number, default: 0 },
  /** Per-row render progress 0–100, keys are row index strings */
  exportRowProgress: { type: Object, default: {} },
  /** Parallel row exports for this job */
  parallelJobs: { type: Number, default: 4 },
  /** M8 — optional progress phase: asset_loading | rendering | encoding | finalizing | completed */
  exportPhase: { type: String, default: null },
  /** When export processing started (server clock) */
  exportStartedAt: { type: Date, default: null },
  /** Total wall-clock export time in ms (set when job completes) */
  exportDurationMs: { type: Number, default: null },
}, { timestamps: true });

module.exports = mongoose.model('VideoJob', videoJobSchema);
