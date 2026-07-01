const UserPreset = require('../models/UserPreset');

module.exports = {
  list: async (req, res) => {
    try {
      const presets = await UserPreset.find({ userId: req.userId }).sort({ updatedAt: -1 });
      res.json(presets);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  createOrUpsert: async (req, res) => {
    try {
      const { name, settings } = req.body;
      if (!name || !settings) return res.status(400).json({ error: 'name and settings required' });

      const existing = await UserPreset.findOne({ userId: req.userId, name });
      if (existing) {
        existing.settings = settings;
        await existing.save();
        return res.json(existing);
      }

      const preset = await UserPreset.create({
        name,
        settings,
        userId: req.userId,
      });
      res.status(201).json(preset);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  update: async (req, res) => {
    try {
      const preset = await UserPreset.findOne({ _id: req.params.id, userId: req.userId });
      if (!preset) return res.status(404).json({ error: 'Not found' });
      const { name, settings } = req.body;
      if (name) preset.name = name;
      if (settings) preset.settings = settings;
      await preset.save();
      res.json(preset);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  remove: async (req, res) => {
    try {
      const preset = await UserPreset.findOneAndDelete({ _id: req.params.id, userId: req.userId });
      if (!preset) return res.status(404).json({ error: 'Not found' });
      res.json({ deleted: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
};
