const Event = require('../models/Event');
const Registration = require('../models/Registration');
const QRCode = require('qrcode');
const sendEmail = require('../utils/sendEmail');
const { registrationConfirmedTemplate, waitlistPromotedTemplate } = require('../utils/emailTemplates');

const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() === userId.toString()) {
      return res.status(403).json({ message: 'You cannot register for your own event.' });
    }

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, seatsLeft: { $gt: 0 } },
      { $inc: { seatsLeft: -1 } },
      { new: true }
    );

    if (!updatedEvent) {
      try {
        const waitlistEntry = await Registration.create({
          user: userId,
          event: eventId,
          status: 'waitlisted',
        });
        return res.status(202).json({
          message: 'Event is full. You have been added to the waitlist.',
          registration: waitlistEntry,
        });
      } catch (err) {
        if (err.code === 11000) {
          return res.status(409).json({ message: 'You are already registered or waitlisted for this event' });
        }
        throw err;
      }
    }

    try {
      const registration = await Registration.create({ user: userId, event: eventId, status: 'confirmed' });

      // Fire-and-forget — don't await, don't block the response on email delivery.
      sendEmail({
        to: req.user.email,
        subject: `You're registered for ${event.title}`,
        html: registrationConfirmedTemplate({
          userName: req.user.name,
          eventTitle: event.title,
          eventDate: event.eventDate,
          location: event.location,
        }),
      });

      return res.status(201).json({ registration });
    } catch (err) {
      await Event.findByIdAndUpdate(eventId, { $inc: { seatsLeft: 1 } });
      if (err.code === 11000) {
        return res.status(409).json({ message: 'You are already registered for this event' });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/registrations/me  (logged-in user's own registrations)
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('event', 'title eventDate location')
      .sort({ createdAt: -1 });

    res.status(200).json({ registrations });
  } catch (error) {
    next(error);
  }
};

const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only cancel your own registration' });
    }

    const wasConfirmed = registration.status === 'confirmed';
    const { event: eventId } = registration;

    await registration.deleteOne();

    if (!wasConfirmed) {
      return res.status(200).json({ message: 'Registration cancelled' });
    }

    // Populate user + event so we have what we need for the promotion email.
    const nextInLine = await Registration.findOneAndUpdate(
      { event: eventId, status: 'waitlisted' },
      { status: 'confirmed' },
      { sort: { createdAt: 1 }, new: true }
    ).populate('user', 'name email');

    if (nextInLine) {
      const event = await Event.findById(eventId);

      sendEmail({
        to: nextInLine.user.email,
        subject: `A seat opened up for ${event.title}`,
        html: waitlistPromotedTemplate({
          userName: nextInLine.user.name,
          eventTitle: event.title,
          eventDate: event.eventDate,
          location: event.location,
        }),
      });

      return res.status(200).json({
        message: 'Registration cancelled. The next person on the waitlist has been promoted.',
      });
    }

    await Event.findByIdAndUpdate(eventId, { $inc: { seatsLeft: 1 } });

    res.status(200).json({ message: 'Registration cancelled' });
  } catch (error) {
    next(error);
  }
};


// GET /api/registrations/:id/qrcode  (owner of the registration only)
const getRegistrationQRCode = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only view your own QR code' });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot generate QR code for a cancelled registration' });
    }

    const qrDataUrl = await QRCode.toDataURL(registration.qrToken);

    res.status(200).json({ qrCode: qrDataUrl });
  } catch (error) {
    next(error);
  }
};

// POST /api/registrations/checkin  (organizer of the event, or admin)
const checkInAttendee = async (req, res, next) => {
  try {
    const { qrToken } = req.body;

    if (!qrToken) {
      return res.status(400).json({ message: 'qrToken is required' });
    }

    const registration = await Registration.findOne({ qrToken }).populate('event');

    if (!registration) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({ message: 'This registration was cancelled' });
    }

    const isOrganizer = registration.event.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to check in attendees for this event' });
    }

    if (registration.checkedIn) {
      return res.status(409).json({ message: 'This attendee has already been checked in' });
    }

    registration.checkedIn = true;
    await registration.save();

    res.status(200).json({
      message: 'Check-in successful',
      attendee: registration.user,
      event: registration.event.title,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  getRegistrationQRCode,
  checkInAttendee,
};