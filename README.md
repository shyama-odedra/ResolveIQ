# ResolveIQ

> AI-powered support ticket triage and resolution intelligence platform.

ResolveIQ helps support and engineering teams turn incoming customer issues into structured, actionable tickets.

Instead of manually analyzing every ticket, ResolveIQ uses AI to classify the issue, determine its urgency, identify the responsible department, estimate resolution time, and generate practical resolution guidance.

## Live Demo

🌐 https://resolveiq.netlify.app/

---

## Why ResolveIQ?

Traditional support ticket systems mainly store and track issues.

ResolveIQ adds an intelligence layer on top of the ticket lifecycle.

When a ticket is created, ResolveIQ analyzes it and provides:

- Priority classification
- Priority reasoning
- Issue category
- Responsible department
- Estimated resolution time
- Likely root cause
- Recommended troubleshooting steps
- Suggested next action

This allows support teams to understand and act on issues faster.

---

## Key Features

### AI Ticket Triage

Every ticket can be analyzed using AI to determine:

- **Priority:** Critical, High, Medium, or Low
- **Category:** Software, Hardware, Network, Access, Security, Payments, or Other
- **Department:** Suggested team responsible for handling the issue
- **Estimated Resolution:** AI-generated resolution estimate
- **Likely Cause:** Probable technical cause of the issue
- **Recommended Steps:** Actionable troubleshooting instructions
- **Next Action:** Suggested immediate follow-up

### Intelligent Priority Classification

ResolveIQ combines AI analysis with deterministic priority rules to provide reliable ticket prioritization.

Critical issues such as production outages and security incidents can be identified and escalated appropriately, while lower-impact feature issues are assigned lower priorities.

### Similar Ticket Context

ResolveIQ can use previously resolved tickets as context when analyzing new issues, helping provide more relevant recommendations.

### Real-Time Ticket Updates

Socket.IO enables real-time updates so changes to tickets can be reflected without manually refreshing the application.

### Role-Based Access

The platform supports different levels of access for users and administrators.

### Ticket Lifecycle Management

Tickets can be:

- Created
- Assigned
- Updated
- Re-analyzed
- Resolved
- Soft-deleted

### Audit Trail

Important ticket actions can be tracked to provide visibility into changes throughout the ticket lifecycle.

---

## AI Architecture

ResolveIQ uses an OpenAI-compatible AI gateway architecture through OpenRouter.

```text
User
 │
 ▼
React + Vite Frontend
 │
 │ REST API
 ▼
Node.js + Express Backend
 │
 ├──────────────► MongoDB Atlas
 │
 ▼
OpenRouter
 │
 ▼
Gemini
 │
 ▼
Structured AI Triage
 │
 ▼
Priority + Cause + Resolution Steps + Next Action
