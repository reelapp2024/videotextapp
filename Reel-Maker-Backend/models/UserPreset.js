const mongoose = require('mongoose');

const userPresetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  settings: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

userPresetSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('UserPreset', userPresetSchema);
