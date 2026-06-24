const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    // Only allow 'organizer' or 'attendee' at signup — never let a client set themselves as admin
    const allowedRoles = ['organizer', 'attendee'];
    const finalRole = allowedRoles.includes(role) ? role : 'attendee';

    const user = await User.create({ name, email, password, role: finalRole });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // password has select:false in the schema, so we explicitly ask for it here
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      // Deliberately vague — don't reveal whether the email exists or the password was wrong
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    // req.user was attached by the protect middleware
    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe };