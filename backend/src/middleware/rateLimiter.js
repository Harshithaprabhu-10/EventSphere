const rateLimit = require('express-rate-limit');

const isTestEnv = process.env.NODE_ENV === 'test';

// Strict limiter for auth routes — prevents brute-force login/signup attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv, // disable rate limiting entirely during automated tests
});

// Looser limiter for general API usage
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
});

module.exports = { authLimiter, generalLimiter };