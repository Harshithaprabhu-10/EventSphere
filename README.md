# EventSphere — Event Management and Registration Platform

A production-grade full-stack event management platform built with Node.js, Express, React, and MongoDB. Built as a portfolio project targeting backend/software engineering placements.

## Live Demo

> Run locally with Docker: `docker-compose up --build`
> Access at: `http://localhost`

## Tech Stack

**Backend:** Node.js, Express, MongoDB Atlas, Mongoose, JWT, Zod, BcryptJS, Resend
**Frontend:** React, Vite, React Router, Axios, html5-qrcode
**Infrastructure:** Docker, Docker Compose, Nginx, GitHub Actions CI
**Testing:** Jest, Supertest, mongodb-memory-server, Artillery

## Features

### Core Backend Engineering

- **Concurrency-safe registration** — atomic seat claiming using MongoDB `findOneAndUpdate` with conditional filter, preventing race conditions when multiple users register for the last seat simultaneously. Verified under concurrent load with a custom test script and Artillery load testing.
- **Waitlist system** — when an event is full, users are automatically added to a waitlist. Cancelling a confirmed registration atomically promotes the next waitlisted user and triggers a confirmation email — no seat is ever double-counted.
- **Role-based access control (RBAC)** — three roles (Admin, Organizer, Attendee) with middleware-enforced route protection and ownership-based authorization (organizers can only edit their own events).
- **Business rule enforcement** — organizers cannot register for their own events, enforced at the API level regardless of client behavior.
- **QR code check-in** — unique cryptographic token per registration, rendered as a scannable QR code. Organizers verify attendance via a camera-based scanner or manual token entry. Duplicate check-in is prevented.
- **Email notifications** — transactional emails via Resend on registration confirmation and waitlist promotion, using a fire-and-forget pattern to avoid blocking HTTP responses.

### Security

- JWT authentication with refresh-aware middleware (re-validates user on every protected request)
- Password hashing with bcrypt, `select: false` on password field
- Input validation with Zod on all write endpoints
- Rate limiting on auth routes (brute-force protection) and general API routes
- Helmet.js security headers, CORS configuration
- Non-root user inside Docker containers

### Testing

- 9 automated tests (Jest + Supertest) covering auth flows, RBAC, concurrency safety, and duplicate registration prevention
- In-memory MongoDB via `mongodb-memory-server` for isolated, fast test runs
- Rate limiter disabled in test environment via `NODE_ENV=test` and `skip()` callback
- Load tested with Artillery at 20 req/sec sustained — 84ms median, 176ms p95 latency on successful requests

### DevOps

- Multi-stage Docker build for frontend (Node → Nginx), single-stage for backend
- `docker-compose.yml` orchestrates both containers on a private Docker network
- Nginx reverse proxy routes `/api/*` to the backend container, serves the React SPA with React Router fallback
- GitHub Actions CI pipeline runs on every push to `main`: installs dependencies, runs the Jest suite, builds both Docker images

## Project Structure

```
EventSphere/
├── backend/
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, RBAC, validation, rate limiting
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   └── utils/          # Token generation, email sending
│   └── tests/               # Jest + Supertest test suites
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client + endpoint functions
│   │   ├── components/      # Navbar, Footer, ProtectedRoute, QRCodeDisplay
│   │   ├── context/         # AuthContext (global auth state)
│   │   ├── hooks/           # useAuth convenience hook
│   │   └── pages/           # Home, Login, Signup, EventDetails, CreateEvent, MyRegistrations, CheckIn
│   ├── nginx.conf           # Nginx config with API proxy and React Router fallback
│   └── Dockerfile           # Two-stage build: Node (Vite build) → Nginx
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Database Design

Three collections: `Users`, `Events`, `Registrations`.

`Registrations` is a separate collection (not embedded in `Events`) with a compound unique index on `{ user, event }` — this enforces duplicate-registration prevention at the database level, not just application code, and enables fast indexed queries for "all registrations for this user."

`Events` stores `capacity` and `seatsLeft` as separate fields. The atomic `findOneAndUpdate` check operates on `seatsLeft` directly — the read-check-write is one indivisible database operation, not three separate steps.

## Running Locally

### With Docker (recommended)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/EventSphere.git
cd EventSphere

# Copy and fill in environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your MONGO_URI, JWT_SECRET, RESEND_API_KEY

# Start both containers
docker-compose up --build

# Open http://localhost
```

### Without Docker

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev     # runs on port 5000

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev     # runs on port 5173
```

### Running Tests

```bash
cd backend
npm test
```

## Environment Variables

### Backend (`backend/.env`)

```
MONGO_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
RESEND_API_KEY=re_...
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:5000/api
```

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `main`:

1. Installs backend dependencies
2. Runs the full Jest test suite
3. Builds the backend Docker image (only if tests pass)
4. Builds the frontend Docker image (in parallel with backend build)

## Key Engineering Decisions

**Why `findOneAndUpdate` with a conditional filter for seat claiming?**
A naive read-then-write approach (fetch event, check `seatsLeft > 0`, decrement) has a time-of-check-to-time-of-use (TOCTOU) race condition — two concurrent requests can both read `seatsLeft = 1`, both pass the check, and both create registrations, leaving `seatsLeft = -1`. Moving the condition into the filter of `findOneAndUpdate` makes the check-and-decrement a single atomic database operation.

**Why re-fetch the user from the database on every protected request instead of trusting the JWT payload?**
If a user's role is changed or their account is deleted, a pure JWT approach would allow the old token to remain valid until expiry (up to 7 days). Re-fetching ensures role changes take effect immediately at the cost of one extra database query per authenticated request.

**Why a separate Registrations collection instead of embedding in Events?**
Embedding registrations in the Event document would make the compound unique index `{ user, event }` impossible, remove the ability to query "all registrations for this user" efficiently, and make the atomic seat-claiming logic significantly more complex. The tradeoff is one extra collection and join, which is trivial compared to the benefits.
