const Event = require('../models/Event');

// POST /api/events  (organizer or admin only)
const createEvent = async (req, res, next) => {
  try {
    const { title, description, eventDate, location, category, capacity } = req.body;

    const event = await Event.create({
      title,
      description,
      eventDate,
      location,
      category,
      capacity,
      organizer: req.user._id, // taken from the authenticated user, never trusted from the body
    });

    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
};

// GET /api/events  (public, paginated)
const getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build a filter object dynamically based on optional query params
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      // Case-insensitive partial match on title
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ eventDate: 1 })
        .skip(skip)
        .limit(limit)
        .populate('organizer', 'name email'),
      Event.countDocuments(filter),
    ]);

    res.status(200).json({
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id  (public)
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ event });
  } catch (error) {
    next(error);
  }
};

// PUT /api/events/:id  (organizer who owns it, or admin)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isOwner = event.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only edit your own events' });
    }

    // Don't allow capacity to be edited here once registrations may exist —
    // that's a separate, more careful operation. Keep this update limited to safe fields.
    const { title, description, eventDate, location, category } = req.body;
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (eventDate !== undefined) event.eventDate = eventDate;
    if (location !== undefined) event.location = location;
    if (category !== undefined) event.category = category;

    await event.save();

    res.status(200).json({ event });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/events/:id  (organizer who owns it, or admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isOwner = event.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own events' });
    }

    await event.deleteOne();

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent };