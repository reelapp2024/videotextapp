const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  config: { type: mongoose.Schema.Types.Mixed, required: true },
  thumbnail: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
