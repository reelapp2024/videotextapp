const Project = require('../models/Project');

module.exports = {
  list: async (req, res) => {
    try {
      const filter = req.userId ? { userId: req.userId } : {};
      const projects = await Project.find(filter).sort({ updatedAt: -1 });
      res.json(projects);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  getById: async (req, res) => {
    try {
      const p = await Project.findById(req.params.id);
      if (!p) return res.status(404).json({ error: 'Not found' });
      res.json(p);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  create: async (req, res) => {
    try {
      const { name, config, thumbnail } = req.body;
      if (!name || !config) return res.status(400).json({ error: 'name and config required' });
      const project = await Project.create({
        name,
        config,
        thumbnail: thumbnail || null,
        userId: req.userId || null,
      });
      res.status(201).json(project);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  update: async (req, res) => {
    try {
      const p = await Project.findById(req.params.id);
      if (!p) return res.status(404).json({ error: 'Not found' });
      const { name, config, thumbnail } = req.body;
      if (name) p.name = name;
      if (config) p.config = config;
      if (thumbnail !== undefined) p.thumbnail = thumbnail;
      await p.save();
      res.json(p);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  remove: async (req, res) => {
    try {
      const p = await Project.findByIdAndDelete(req.params.id);
      if (!p) return res.status(404).json({ error: 'Not found' });
      res.json({ deleted: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
};
