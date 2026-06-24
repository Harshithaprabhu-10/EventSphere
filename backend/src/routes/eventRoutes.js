const express = require('express');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const protect = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { createEventSchema, updateEventSchema } = require('../validators/eventValidators');

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);

router.post('/', protect, requireRole('organizer', 'admin'), validate(createEventSchema), createEvent);
router.put('/:id', protect, requireRole('organizer', 'admin'), validate(updateEventSchema), updateEvent);
router.delete('/:id', protect, requireRole('organizer', 'admin'), deleteEvent);

module.exports = router;