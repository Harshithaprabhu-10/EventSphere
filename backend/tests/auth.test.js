const request = require('supertest');
const app = require('../src/app');
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

describe('POST /api/auth/signup', () => {
  it('creates a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'attendee',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.password).toBeUndefined(); // password should never be returned
  });

  it('rejects duplicate email signup', async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      email: 'duplicate@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/signup').send({
      name: 'Another User',
      email: 'duplicate@example.com',
      password: 'password456',
    });

    expect(res.statusCode).toBe(409);
  });

  it('rejects invalid email format via validation', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      email: 'not-an-email',
      password: 'password123',
    });

    expect(res.statusCode).toBe(400);
  });

it('rejects a client-supplied admin role at the validation layer', async () => {
  const res = await request(app).post('/api/auth/signup').send({
    name: 'Sneaky User',
    email: 'sneaky@example.com',
    password: 'password123',
    role: 'admin',
  });

  // Zod's enum validation rejects 'admin' before the controller's
  // own role-whitelisting logic ever runs — defense in depth at two layers
  expect(res.statusCode).toBe(400);
});
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Login Test',
      email: 'login@example.com',
      password: 'correctpassword',
    });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'correctpassword',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'wrongpassword',
    });

    expect(res.statusCode).toBe(401);
  });
});