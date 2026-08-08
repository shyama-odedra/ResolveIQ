# TicketFlow AI

An enterprise-style MERN support ticketing system with real-time updates and Gemini-powered triage — built as a placement-prep portfolio project (ServiceNow/Jira-style domain).

## Stack

- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Recharts, Socket.io client
- **Backend:** Node.js, Express, MongoDB/Mongoose, JWT auth, Socket.io, Multer, Google Gemini API

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm install
npm run seed     # creates demo accounts + departments
npm run dev       # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`, so both must be running.

## Demo accounts (after seeding)

All passwords: `password123`

| Role     | Email                   |
|----------|--------------------------|
| Admin    | admin@ticketflow.ai     |
| Manager  | manager@ticketflow.ai   |
| Agent    | agent@ticketflow.ai     |
| Employee | employee@ticketflow.ai  |

## Architecture notes worth knowing for interviews

- **Ticket state machine** (`open → assigned → in_progress → resolved → closed`) is enforced server-side in a Mongoose `pre('save')` hook (`backend/models/Ticket.js`), not just hidden in the UI — invalid transitions are rejected with a 400 regardless of what the client sends.
- **Audit trail is append-only and separate** from the ticket document (`ActivityLog` model), matching how real ITSM systems track history rather than mutating a single record.
- **AI pipeline order:** on ticket creation, a cheap MongoDB text-index similarity search runs first against resolved tickets before falling back to a live Gemini call — a cost-aware design choice, not just "call the AI every time."
- **Real-time layer:** Socket.io rooms are per-user (`user:<id>`) for notifications and per-ticket (`ticket:<id>`) for live comments/status/activity, authenticated via JWT on the socket handshake.
- **Role-based access** is enforced in Express middleware (`authorize(...)`), not just conditionally rendered in the frontend.

## Project structure

```
backend/
  config/        MongoDB connection
  controllers/   Route handlers (auth, tickets, comments, analytics, users, departments, notifications)
  middleware/    JWT auth, role authorization, file upload, error handling
  models/        User, Ticket, Comment, ActivityLog, Notification, Department
  routes/        Express routers
  sockets/       Socket.io init + emit helpers
  utils/         JWT generation, Gemini service, similarity service, activity/notification helper, seed script

frontend/
  src/
    components/  Shared UI kit + ticket-specific components (cards, modals, timelines)
    context/     Auth and Socket React contexts
    pages/       Route-level pages
    utils/       Axios client, formatting helpers
```
