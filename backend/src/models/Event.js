const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'general',
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    seatsLeft: {
      type: Number,
      required: true,
        default: function () {
    return this.capacity;
  },
    },
  },
  { timestamps: true }
);

// Before saving a NEW event, seatsLeft starts equal to capacity


// Index for the pagination/search feature coming later —
// speeds up sorting by date and filtering by category
eventSchema.index({ eventDate: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);