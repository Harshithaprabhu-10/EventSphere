const express = require('express');
const {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getRegistrationQRCode,
  checkInAttendee,
} = require('../controllers/registrationController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Specific routes FIRST
router.post('/checkin', protect, checkInAttendee);
router.get('/me', protect, getMyRegistrations);

// Parameter routes AFTER
router.post('/:eventId', protect, registerForEvent);
router.delete('/:id', protect, cancelRegistration);
router.get('/:id/qrcode', protect, getRegistrationQRCode);

module.exports = router;