const {
  BACKGROUND_EFFECT_CATEGORIES,
  ALL_BACKGROUND_EFFECTS,
  DEFAULT_BACKGROUND_EFFECTS_SETTINGS,
  getBackgroundEffectById,
} = require('../data/backgroundEffectsCatalog');

module.exports = {
  getCatalog: (_req, res) => {
    res.json({
      categories: BACKGROUND_EFFECT_CATEGORIES,
      total: ALL_BACKGROUND_EFFECTS.length,
      defaults: DEFAULT_BACKGROUND_EFFECTS_SETTINGS,
    });
  },

  getById: (req, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0] ?? '';
    const effect = getBackgroundEffectById(id);
    if (!effect) {
      res.status(404).json({ error: 'Effect not found' });
      return;
    }
    res.json(effect);
  },
};
