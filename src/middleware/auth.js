const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'User account is deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    next();
  };
};

const requireTeamAccess = (teamId) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const team = user.teams.find(t => t.team.toString() === teamId);
      
      if (!team) {
        return res.status(403).json({ error: 'Access to team denied.' });
      }

      req.teamRole = team.role;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Error checking team access.' });
    }
  };
};

module.exports = {
  auth,
  requireRole,
  requireTeamAccess
};
