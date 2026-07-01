const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = {
  listUsers: async (req, res) => {
    try {
      const users = await User.find({}, '-password').sort({ createdAt: -1 });
      res.json({ users });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  createUser: async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'Email already exists' });
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        password: hashed,
        name: name || '',
        role: role === 'admin' ? 'admin' : 'user',
        active: true,
      });
      res.status(201).json({
        user: { id: user._id, email: user.email, name: user.name, role: user.role, active: user.active, createdAt: user.createdAt },
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { name, email, role, active, password } = req.body;
      const update = {};
      if (name !== undefined) update.name = name;
      if (email !== undefined) update.email = email;
      if (role !== undefined) update.role = role;
      if (active !== undefined) update.active = active;
      if (password) update.password = await bcrypt.hash(password, 10);

      const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, select: '-password' });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const adminId = req.userId;
      if (req.params.id === adminId) return res.status(400).json({ error: 'Cannot delete your own account' });
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  getStats: async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ active: true });
      const adminCount = await User.countDocuments({ role: 'admin' });
      res.json({ totalUsers, activeUsers, adminCount });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
};
