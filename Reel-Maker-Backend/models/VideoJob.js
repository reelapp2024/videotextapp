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
  /** M8 — optional progress phase: asset_loading | rendering | encoding | finalizing | completed */
  exportPhase: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('VideoJob', videoJobSchema);
