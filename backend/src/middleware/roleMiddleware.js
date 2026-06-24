/**
 * Restricts a route to specific roles.
 * Usage: router.post('/events', protect, requireRole('organizer', 'admin'), createEvent)
 * Must be used AFTER the protect middleware, since it depends on req.user existing.
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }

    next();
  };
};

module.exports = requireRole;