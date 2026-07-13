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
_To be completed once the backend and frontend projects are scaffolded (Phase 1)._

## Seed / demo accounts
_To be added once the database seed script is written (Phase 2)._

## Running tests
_To be added once the test suites exist (Phase 9)._

## Assumptions & tradeoffs
See the "Assumptions" section of `SYSTEM_DESIGN.md`. This section will be expanded
with any additional decisions made during implementation.

## What I'd improve with more time
_To be filled in at submission time._
