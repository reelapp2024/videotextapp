const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

function authMiddleware(optional = false) {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      if (optional) { req.userId = null; return next(); }
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      req.userRole = decoded.role || 'user';
      next();
    } catch {
      if (optional) { req.userId = null; return next(); }
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

function adminMiddleware() {
  return [
    authMiddleware(),
    (req, res, next) => {
      if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      next();
    },
  ];
}

module.exports = { authMiddleware, adminMiddleware, JWT_SECRET };
