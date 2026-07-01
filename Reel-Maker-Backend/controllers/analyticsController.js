const Analytics = require('../models/Analytics');

module.exports = {
  track: async (req, res) => {
    try {
      const { action, payload } = req.body;
      if (!action) return res.status(400).json({ error: 'action required' });
      const doc = await Analytics.create({
        action,
        payload: payload || {},
        userId: req.userId || null,
      });
      res.status(201).json({ id: doc._id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
};
