const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

module.exports = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      if (user.active === false) {
        return res.status(403).json({ error: 'Account is deactivated. Contact admin.' });
      }
      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  signup: async (req, res) => {
    return res.status(403).json({ error: 'Public signup is disabled. Contact admin to create an account.' });
  },
};
