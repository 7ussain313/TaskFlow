# TaskFlow — Test Plan

What's tested, why, and how to run it. See `SYSTEM_DESIGN.md` for the business
rules being verified and `ARCHITECTURE.md` for the API these tests exercise.

## Backend (Jest)

### Unit tests
- **`src/common/guards/roles.guard.spec.ts`** — the `@Roles()` permission guard in
  isolation: allows a matching role, blocks a mismatched one (`ForbiddenException`),
  allows any authenticated user through on routes with no `@Roles()` declared, and
  blocks a request with no user at all. This is the "role permission tests"
  requirement.
- **`src/workflow/workflow.service.spec.ts`** — the workflow state machine in
  isolation (`PrismaService` mocked), covering every action: legal transitions
  succeed and write the right status + activity log entry; illegal transitions
  (wrong `from` status, e.g. starting work twice) throw `ConflictException`;
  wrong-role and non-assignee attempts throw `ForbiddenException`; a missing work
  item throws `NotFoundException`; `reopen`'s dynamic target (`ASSIGNED` vs
  `BACKLOG` depending on whether assignees remain) is verified both ways. This is
  the "workflow transition tests" requirement — 15 cases.

### Integration / e2e tests (real NestJS app + real Neon database)
- **`test/auth.e2e-spec.ts`** — register (as MEMBER, never a role you supply),
  duplicate email → 409, a smuggled `role` field in the register body → 400,
  wrong password → 401, missing token on a protected route → 401, valid token →
  200 with the current user.
- **`test/work-items.e2e-spec.ts`** — the required **login → create → assign**
  integration flow against the real seeded accounts: log in as the seeded Manager
  and a seeded Member, create a work item, assign the Member (verifying the
  BACKLOG → ASSIGNED transition happens as a side effect), and confirm it shows up
  in that Member's own scoped list. Also covers the explicit **401/403/400** cases
  the brief calls out: no token, a Member attempting a Manager-only action, and
  invalid input — plus a 404 (not 403) check confirming an unrelated Member can't
  even detect that another member's item exists.

### Run it
```bash
cd backend
npm run test        # unit tests
npm run test:e2e     # integration tests (hits your real DATABASE_URL)
```
The e2e suite talks to whatever database is in `backend/.env` — expect the first
query in each run to take a few seconds on Neon's free tier if the connection has
gone idle (that's Neon waking up, not a bug; see README).

## Frontend (Vitest + Testing Library)

- **`src/lib/timeline.test.ts`** — the Timeline's pure date-grouping and
  "Today marker" placement logic: same-day items bucket together, "Today" /
  "Tomorrow" / "Yesterday" labels are relative to a given date, and the marker
  lands on the exact today-group when one exists, the first future group when
  nothing is due exactly today, index `0` when everything is upcoming, and `-1`
  (trailing) when everything is already past. This is the trickiest part of the
  headline Timeline feature, so it's covered as pure-function unit tests rather
  than only relying on visual inspection.
- **`src/components/workflow-actions.test.tsx`** — the workflow-interaction logic
  surfaced in the UI: which action buttons render for a given
  status/role/assignee combination (e.g. only the assignee sees "Start Work" on
  an Assigned item; only a Manager sees "Accept"/"Send Back"/"Cancel" on an
  In Review item; "Reopen" only appears on Done/Cancelled and "Cancel" never
  does). Mirrors the same rules `WorkflowService` enforces server-side.

### Run it
```bash
cd frontend
npm run test
```

## What's verified outside the automated suites

The Timeline/Board/Dashboard UI, the full workflow lifecycle (assign → start →
submit → accept/send-back → cancel/reopen), the extension-request flow, image
upload, and role-scoped data access were also driven end-to-end in a real browser
(Playwright) as both the seeded Manager and Member accounts during development —
not just asserted against, but watched happen, including screenshots of the
Board/Timeline/Dashboard. That isn't part of the checked-in automated suite (no
Playwright config is committed), but it's how the two real bugs mentioned in the
commit history were actually found: a React Query cache leak across user sessions,
and a Prisma transaction timeout too tight for Neon's connection latency.

## Consistent error format

Every error response (validation, auth, permissions, not-found, conflict) uses the
same shape: `{ "statusCode": number, "message": string | string[], "error": string
}`, enforced by the single global `AllExceptionsFilter` — see `ARCHITECTURE.md` §3.
