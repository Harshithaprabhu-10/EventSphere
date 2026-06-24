const express = require('express');
const { signup, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { signupSchema, loginSchema } = require('../validators/authValidators');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', protect, getMe);

module.exports = router;