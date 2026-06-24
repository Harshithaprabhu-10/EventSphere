const mongoose = require('mongoose');
const crypto = require('crypto');

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'waitlisted', 'cancelled'],
      default: 'confirmed',
    },
    qrToken: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(16).toString('hex'),
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevents the SAME user from registering for the SAME event twice,
// enforced at the database level — not just in application code.
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);