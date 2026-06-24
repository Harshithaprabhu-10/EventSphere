const request = require('supertest');
const app = require('../src/app');
const Event = require('../src/models/Event');
const { connectTestDB, closeTestDB, clearTestDB } = require('./testSetup');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

// Helper: signs up a user and returns their token + id
const createUserAndLogin = async (email) => {
  const res = await request(app).post('/api/auth/signup').send({
    name: 'Test User',
    email,
    password: 'password123',
    role: 'organizer',
  });
  return { token: res.body.token, userId: res.body.user.id };
};

// Helper: creates an event as a given organizer, returns the event id
const createEvent = async (token, capacity) => {
  const res = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Concurrency Test Event',
      description: 'Testing race conditions on registration',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      location: 'Test Hall',
      capacity,
    });
  return res.body.event;
};

describe('POST /api/registrations/:eventId — concurrency safety', () => {
  it('allows exactly one registration to succeed when only one seat is available, under concurrent requests', async () => {
    const organizer = await createUserAndLogin('organizer@example.com');
    const event = await createEvent(organizer.token, 1); // only 1 seat

    // Create 5 different attendees competing for that 1 seat
    const attendeeTokens = await Promise.all(
      [1, 2, 3, 4, 5].map((i) => createUserAndLogin(`attendee${i}@example.com`))
    );

    // Fire all 5 registration requests at the exact same time
    const results = await Promise.all(
      attendeeTokens.map(({ token }) =>
        request(app)
          .post(`/api/registrations/${event._id}`)
          .set('Authorization', `Bearer ${token}`)
      )
    );

    const successes = results.filter((r) => r.statusCode === 201);
    const waitlisted = results.filter((r) => r.statusCode === 202);

    expect(successes.length).toBe(1);
    expect(waitlisted.length).toBe(4);    

    // Confirm the database state matches — no overselling, no drift
    const finalEvent = await Event.findById(event._id);
    expect(finalEvent.seatsLeft).toBe(0);
  });

  it('allows exactly N registrations to succeed when N seats are available', async () => {
    const organizer = await createUserAndLogin('organizer2@example.com');
    const event = await createEvent(organizer.token, 3); // 3 seats

    const attendeeTokens = await Promise.all(
      [1, 2, 3, 4, 5, 6].map((i) => createUserAndLogin(`bulkattendee${i}@example.com`))
    );

    const results = await Promise.all(
      attendeeTokens.map(({ token }) =>
        request(app)
          .post(`/api/registrations/${event._id}`)
          .set('Authorization', `Bearer ${token}`)
      )
    );

    const successes = results.filter((r) => r.statusCode === 201);
    const waitlisted = results.filter((r) => r.statusCode === 202);

    expect(successes.length).toBe(3);
    expect(waitlisted.length).toBe(3);

    const finalEvent = await Event.findById(event._id);
    expect(finalEvent.seatsLeft).toBe(0);
  });

  it('prevents the same user from registering twice for the same event', async () => {
    const organizer = await createUserAndLogin('organizer3@example.com');
    const event = await createEvent(organizer.token, 5);
    const attendee = await createUserAndLogin('repeatattendee@example.com');

    const first = await request(app)
      .post(`/api/registrations/${event._id}`)
      .set('Authorization', `Bearer ${attendee.token}`);

    const second = await request(app)
      .post(`/api/registrations/${event._id}`)
      .set('Authorization', `Bearer ${attendee.token}`);

    expect(first.statusCode).toBe(201);
    expect(second.statusCode).toBe(409);

    const finalEvent = await Event.findById(event._id);
    expect(finalEvent.seatsLeft).toBe(4); // only decremented once
  });
});