const mongoose = require('mongoose');
const { DEFAULT_CAPTION_STYLE } = require('../constants/caption');

const captionJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['queued', 'transcribing', 'editor_ready', 'rendering', 'done', 'error'],
    default: 'queued',
  },
  error: { type: String, default: null },
  totalTracks: { type: Number, default: 0 },
  transcribedCount: { type: Number, default: 0 },
  renderedCount: { type: Number, default: 0 },
  editorReady: { type: Boolean, default: false },
  editorReadyAt: { type: Date, default: null },
  firstTrackId: { type: String, default: null },
  styleSnapshot: { type: mongoose.Schema.Types.Mixed, default: () => ({ ...DEFAULT_CAPTION_STYLE }) },
  resultZipUrl: { type: String, default: null },
  whisperModel: { type: String, default: 'base' },
  language: { type: String, default: 'auto' },
}, { timestamps: true });

module.exports = mongoose.model('CaptionJob', captionJobSchema);
