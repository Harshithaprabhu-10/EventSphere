const { z } = require('zod');

const createEventSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  eventDate: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Event date must be in the future',
  }),
  location: z.string().trim().min(2, 'Location is required'),
  category: z.string().trim().optional(),
  capacity: z.number().int().positive('Capacity must be a positive number'),
});

// Update allows partial fields — anything provided gets validated, nothing is required
const updateEventSchema = z.object({
  title: z.string().trim().min(3).optional(),
  description: z.string().trim().min(10).optional(),
  eventDate: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Event date must be in the future',
  }).optional(),
  location: z.string().trim().min(2).optional(),
  category: z.string().trim().optional(),
});

module.exports = { createEventSchema, updateEventSchema };