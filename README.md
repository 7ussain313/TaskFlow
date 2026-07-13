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
    [Supabase](https://supabase.com) Postgres project, or
  - **Local via Docker:** `docker compose up -d` from the repo root starts Postgres
    on `localhost:5432` (user/pass/db: `taskflow`).

### Backend
```bash
cd backend
npm install
cp .env.example .env      # then set DATABASE_URL (and JWT_SECRET) in .env
npm run start:dev         # http://localhost:3001/api
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # defaults already point at the backend above
npm run dev                 # http://localhost:3000
```

Database schema, migrations, and seed data are added in Phase 2 — instructions for
`prisma migrate` and seeding will land here once that's in place.

## Seed / demo accounts
_To be added once the database seed script is written (Phase 2)._

## Running tests
_To be added once the test suites exist (Phase 9)._

## Assumptions & tradeoffs
See the "Assumptions" section of `SYSTEM_DESIGN.md`. This section will be expanded
with any additional decisions made during implementation.

## What I'd improve with more time
_To be filled in at submission time._
