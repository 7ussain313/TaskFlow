# TaskFlow

An internal tool for an IT Manager to create work items, assign them to team members,
and track them through a controlled lifecycle — with a visual Timeline as the
centerpiece. Built for the SpotOn Full Stack Developer Internship take-home assessment.

> **Status: work in progress.** This README is being filled in as the project is
> built (see `TODO.md` for phase-by-phase progress). Setup instructions below will
> be completed and verified against a clean clone before submission.

## Stack
- **Frontend:** Next.js (App Router) + React + TypeScript, Tailwind CSS, TanStack
  React Query, Axios, React Hook Form + Zod
- **Backend:** NestJS, Prisma ORM, PostgreSQL, JWT auth (Passport), Multer
- **Testing:** Jest + Supertest (backend), Vitest + Testing Library (frontend)

## Documentation
- [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md) — domain model, workflow state machine,
  business rules, role permissions, assumptions
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — folder structure, REST API reference,
  auth flow, image upload flow, testing strategy
- [`TODO.md`](./TODO.md) — development checklist / progress tracker
- `TEST_PLAN.md` — what's tested and how to run it (added in the testing phase)

## Setup instructions

### Prerequisites
- Node.js 20+ and npm
- A PostgreSQL database — either:
  - **Cloud (recommended, no local install):** a free [Neon](https://neon.tech) or
    [Supabase](https://supabase.com) Postgres project. **On Neon, use the pooled
    connection string** (the one with `-pooler` in the hostname, `pgbouncer=true`
    query param) — this app makes several short-lived queries per page, and Neon's
    direct (non-pooled) connection adds several seconds of connection-setup latency
    per burst of activity that the pooled endpoint avoids.
  - **Local via Docker:** `docker compose up -d` from the repo root starts Postgres
    on `localhost:5432` (user/pass/db: `taskflow`).

### Backend
```bash
cd backend
npm install
cp .env.example .env      # then set DATABASE_URL (and JWT_SECRET) in .env
npm run db:migrate        # creates the schema (users, work_items, etc.) in your DB
npm run db:seed           # wipes and repopulates demo data (see accounts below)
npm run start:dev         # http://localhost:3001/api
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # defaults already point at the backend above
npm run dev                 # http://localhost:3000
```

Other useful backend scripts: `npm run db:studio` opens Prisma Studio (a GUI to
browse/edit the database), and `npm run db:seed` can be re-run any time to reset the
demo data back to its starting state.

## Seed / demo accounts
All seeded accounts share the password `Password123!`.

| Role | Email | Name |
|---|---|---|
| Manager | `manager@taskflow.dev` | Morgan Reyes |
| Member | `alice@taskflow.dev` | Alice Chen |
| Member | `bob@taskflow.dev` | Bob Nguyen |
| Member | `carol@taskflow.dev` | Carol Diaz |

The seed also creates 8 work items spanning every workflow status (Backlog, Assigned,
In Progress, In Review, Done, Cancelled), two of which are overdue, plus one pending
due-date extension request — so the Timeline/Board and dashboard have meaningful data
on first load.

## Running tests
_To be added once the test suites exist (Phase 9)._

## Assumptions & tradeoffs
See the "Assumptions" section of `SYSTEM_DESIGN.md`. This section will be expanded
with any additional decisions made during implementation.

## What I'd improve with more time
_To be filled in at submission time._
