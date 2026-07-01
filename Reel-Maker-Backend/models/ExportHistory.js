const mongoose = require('mongoose');

const exportHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  format: { type: String, default: 'mp4' },
  duration: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('ExportHistory', exportHistorySchema);
