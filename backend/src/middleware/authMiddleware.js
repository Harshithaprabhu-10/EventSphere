const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies the JWT from the Authorization header.
 * On success, attaches the authenticated user to req.user.
 * Expected header format: Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user fresh from the DB rather than trusting the token blindly —
    // this way, if a user's role changes or they're deleted, the token can't be misused
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = protect;