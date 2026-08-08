# ResolveIQ

### AI-Powered Enterprise Support Ticketing System

ResolveIQ is a full-stack MERN support ticketing system designed around real-world IT service management workflows.

It combines secure role-based access, real-time collaboration, AI-powered ticket triage, similarity-based resolution suggestions, analytics, and an auditable activity trail into one enterprise-style application.

Built as a placement-preparation portfolio project inspired by platforms such as ServiceNow and Jira.

---

## ✨ Features

- 🔐 JWT-based authentication
- 👥 Role-based access control
- 🎫 Complete ticket lifecycle management
- 🤖 AI-powered ticket triage with Google Gemini
- 🔎 Similarity-based resolution suggestions
- 💬 Real-time comments and ticket updates
- 🔔 Real-time notifications
- 📊 Support analytics dashboard
- 📝 Append-only activity and audit logs
- 📎 File attachments
- 🏢 Department management
- 👤 User management
- 🛡️ Server-side workflow validation
- ⚡ Real-time communication with Socket.io
- 🎨 Modern responsive React interface

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Socket.io Client
- Axios

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Socket.io
- Multer

### AI

- Google Gemini API

---

## 🧠 AI-Powered Ticket Triage

ResolveIQ uses a cost-aware AI pipeline instead of sending every ticket directly to Gemini.

When a new ticket is created:

1. The system first searches previously resolved tickets using MongoDB text-index similarity.
2. If a relevant resolved ticket is found, its resolution can be suggested.
3. If no sufficiently similar ticket is found, the system falls back to Google Gemini.
4. Gemini assists with intelligent ticket classification and triage.
5. The result is integrated into the ticket workflow.

This approach reduces unnecessary AI API calls while still providing intelligent assistance when required.

---

## 🔄 Ticket Lifecycle

Tickets follow a controlled state machine:

```text
open
  ↓
assigned
  ↓
in_progress
  ↓
resolved
  ↓
closed
