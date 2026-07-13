# TaskFlow

An internal tool for an IT Manager to create work items, assign them to team members,
and track them through a controlled lifecycle — with a visual Timeline as the
centerpiece. Built for the SpotOn Full Stack Developer Internship take-home assessment.

## What's built
- **Auth & roles** — register/login, bcrypt-hashed passwords, JWT, Manager/Member
  roles enforced server-side on every route (not just hidden in the UI).
- **Work items** — full CRUD, image attachment (type/size validated server-side,
  rejected before it ever touches disk), server-side field validation.
- **Assignment** — Manager assigns/reassigns/removes one or more Members;
  Member gets a scoped "assigned to me" view (their whole work-items list, since
  the API never shows them anything else).
- **Workflow engine** — a single transition table enforces every legal status
  change (Backlog → Assigned → In Progress → In Review → Done/Cancelled),
  role/assignee checks, the due-date extension request/approve/reject flow,
  overdue detection, auto-fallback to Backlog when unassigned, and a full
  activity log on every mutation.
- **Timeline & Phase Board** — the headline feature: a 6-column Kanban board, a
  chronological timeline with a live "Today" marker, a stats dashboard, all with
  loading/empty/error states and updates without a manual page refresh.
- **Filtering & access control** — Manager filters by phase/assignee/priority;
  data access is scoped in the database query itself, not filtered client-side.
- **Testing** — backend unit + integration tests (Jest/Supertest) and frontend
  component/logic tests (Vitest + Testing Library); see `TEST_PLAN.md`.

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
- [`TEST_PLAN.md`](./TEST_PLAN.md) — what's tested and how to run it

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
```bash
cd backend
npm run test        # unit tests (guards, workflow state machine)
npm run test:e2e    # integration tests (real DB — login/create/assign, 401/403/400)

cd frontend
npm run test        # component + logic tests (Vitest + Testing Library)
```
See [`TEST_PLAN.md`](./TEST_PLAN.md) for what each suite actually covers.

## Assumptions & tradeoffs
Core domain assumptions (role model, image-per-item, timezone handling, etc.) are
in the "Assumptions" section of [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md). Additional
tradeoffs made along the way:

- **JWT in `localStorage`, not an httpOnly cookie.** Simpler for a same-origin
  local dev setup and fine for this assessment; a real production app should use
  an httpOnly cookie to reduce XSS exposure.
- **Images on local disk (`backend/uploads/`), not object storage.** Works fine
  for local/dev use; wouldn't survive a redeploy on most hosting platforms, so a
  real deployment would need S3/R2/etc. instead.
- **Cloud Postgres (Neon) for dev, with a documented pooled-connection tradeoff.**
  Neon's *direct* connection adds multi-second latency on cold starts, which
  showed up as real, reproducible slowness during development (see commit
  history) — switched to the pooled connection string, documented in
  `.env.example` and here in the README. `docker-compose.yml` is provided so
  the app doesn't depend on Neon specifically.
- **`category` is free text, not a managed lookup table.** Keeps the CRUD surface
  small; a real product would likely want a managed, filterable category list.
- **No refresh tokens** — a single JWT with an 8h expiry. Simpler, appropriate for
  an internal tool assessment; a production app would want short-lived access
  tokens plus rotating refresh tokens.
- **`isOverdue` and dashboard counts are computed at read time**, not stored or
  cron-refreshed — always accurate, trivial cost at this data volume, but
  wouldn't scale indefinitely without an index-backed materialized view.
- **No Playwright config is checked in**, even though the app was extensively
  driven through a real browser during development (see `TEST_PLAN.md`) — the
  checked-in automated suites are Jest/Supertest and Vitest/Testing Library, per
  the assessment's explicit requirements.

## What I'd improve with more time
- **Bonus items skipped in favor of a solid core**, per the assessment's own
  guidance ("less, done well"): multiple attachments per item, soft delete,
  pagination, comments, in-app notifications, search, drag-to-reschedule,
  Playwright E2E in CI, Docker for the app itself (only Postgres is
  dockerized), and Swagger API docs.
- **Real-time updates via WebSockets/SSE** instead of the current 15s polling +
  mutation-triggered refetch — works well at this scale but wouldn't scale to
  many concurrent users watching the same board.
- **Optimistic UI updates** for workflow actions/assignment changes, instead of
  waiting for the round trip — the app always shows correct data, just not
  instantaneously.
- **Rate limiting and stronger auth hardening** (login attempt throttling,
  password complexity rules) — not implemented, since it wasn't in scope for an
  internal-tool assessment.
- **A dedicated activity-log UI on the Timeline/Board**, not just the work item
  detail page — the data and endpoint already support it.
