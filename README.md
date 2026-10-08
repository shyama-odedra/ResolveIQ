# ResolveIQ

An enterprise-style MERN support ticketing system with real-time updates and Gemini-powered triage — built as a placement-prep portfolio project (ServiceNow/Jira-style domain).

## Stack

- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Recharts, Socket.io client
- **Backend:** Node.js, Express, MongoDB/Mongoose, JWT auth, Socket.io, Multer, Google Gemini API

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, GEMINI_API_KEY (optionally )
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

## How ticket priority is decided

Priority (low / medium / high) is set when a ticket is created, in this order:

1. `backend/utils/priorityService.js` scores the ticket text with weighted phrases (outage, breach, "all users", payment failing push it up; "how do I", "request", "not urgent", cosmetic push it down). It returns the priority plus a one-line reason shown on the ticket.
2. Gemini triages the ticket as well. Clear high-urgency wording from the rules always wins, and a clear low signal beats an AI "medium".
3. If Gemini is unavailable (no key, retired model, quota, bad reply), the rule-based result is used on its own, so priority never silently falls back to "medium". The failure is logged in the server console.

The Gemini model name is read from `` in `.env`, so a retired model never needs a code change.

## Deleting tickets

Every ticket card and the ticket page has a Delete button (with a confirm step) for tickets raised by mistake.

- An **employee** can delete their own ticket only while it is still `open`. Once an agent picks it up, they have to ask a manager.
- **Managers and admins** can delete a ticket at any stage.
- Agents cannot delete tickets.
- It is a **soft delete** (`deletedAt` / `deletedBy` on the ticket). The ticket disappears from lists, search, similar-ticket matching and analytics, but the audit log keeps a `deleted` entry. A query hook in `models/Ticket.js` hides deleted tickets everywhere, so no controller has to remember to filter them.

## Architecture notes worth knowing for interviews

- **Ticket state machine** (`open → assigned → in_progress → resolved → closed`) is enforced server-side in a Mongoose `pre('save')` hook (`backend/models/Ticket.js`), not just hidden in the UI — invalid transitions are rejected with a 400 regardless of what the client sends.
- **Soft delete with a global query filter:** deleting a ticket sets `deletedAt`; a Mongoose `pre(/^find/)`, `pre('countDocuments')` and `pre('aggregate')` hook excludes those tickets from every read (opt back in with `{ withDeleted: true }`).
- **Audit trail is append-only and separate** from the ticket document (`ActivityLog` model), matching how real ITSM systems track history rather than mutating a single record.
- **Graceful AI fallback:** if Gemini fails, a local rule-based triage (category, department, priority, steps) takes over, and the ticket shows "Auto Triage" instead of "AI Triage Suggestion".
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
