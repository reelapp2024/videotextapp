const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  start: Number,
  end: Number,
  word: String,
}, { _id: false });

const segmentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  start: Number,
  end: Number,
  text: String,
  words: [wordSchema],
}, { _id: false });

const captionTrackSchema = new mongoose.Schema({
  captionJobId: { type: String, required: true, index: true },
  trackIndex: { type: Number, required: true },
  label: { type: String, default: '' },
  audioPath: { type: String, required: true },
  videoPath: { type: String, default: null },
  status: {
    type: String,
    enum: ['queued', 'transcribing', 'ready', 'rendering', 'done', 'error'],
    default: 'queued',
  },
  error: { type: String, default: null },
  language: { type: String, default: null },
  duration: { type: Number, default: null },
  segments: [segmentSchema],
  outputVideoUrl: { type: String, default: null },
}, { timestamps: true });

captionTrackSchema.index({ captionJobId: 1, trackIndex: 1 }, { unique: true });

module.exports = mongoose.model('CaptionTrack', captionTrackSchema);
