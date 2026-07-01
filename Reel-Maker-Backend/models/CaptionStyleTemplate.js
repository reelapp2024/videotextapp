const mongoose = require('mongoose');

const captionStyleTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  style: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

captionStyleTemplateSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('CaptionStyleTemplate', captionStyleTemplateSchema);
