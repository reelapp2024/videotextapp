const mongoose = require('mongoose');

const processingJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true, index: true },
  type: {
    type: String,
    required: true,
    enum: ['video', 'image', 'audio_extract', 'thumbnail', 'merge', 'tts'],
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'done', 'error', 'cancelled'],
    default: 'queued',
  },
  progress: { type: Number, default: 0 },
  resultUrl: { type: String, default: null },
  error: { type: String, default: null },
  totalItems: { type: Number, default: 0 },
  completedItems: { type: Number, default: 0 },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
  inputFiles: [{ type: String }],
  outputFiles: [{ type: String }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('ProcessingJob', processingJobSchema);
