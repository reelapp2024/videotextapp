const ExportHistory = require('../models/ExportHistory');

module.exports = {
  create: async (req, res) => {
    try {
      const { projectId, format, duration } = req.body;
      const doc = await ExportHistory.create({
        userId: req.userId || null,
        projectId: projectId || null,
        format: format || 'mp4',
        duration: duration || 0,
      });
      res.status(201).json({ id: doc._id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  list: async (req, res) => {
    try {
      const filter = req.userId ? { userId: req.userId } : {};
      const list = await ExportHistory.find(filter).sort({ createdAt: -1 }).limit(50);
      res.json(list);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
};
