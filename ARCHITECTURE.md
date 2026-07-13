# TaskFlow — Architecture

## 1. Folder structure

```
TaskFlow/
├── backend/                     # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── auth/                # register, login, JWT strategy, guards, decorators
│   │   ├── users/                # user lookups (used by auth + assignment pickers)
│   │   ├── work-items/           # CRUD, image upload, DTOs
│   │   ├── assignments/          # assign/reassign/remove
│   │   ├── workflow/             # WorkflowService — the state machine, single source
│   │   │                         # of truth for status transitions
│   │   ├── extension-requests/   # request/approve/reject due-date extensions
│   │   ├── activity-log/         # append-only log + read endpoints
│   │   ├── common/               # global exception filter, response DTOs, guards,
│   │   │                         # decorators (@Roles, @CurrentUser), pipes
│   │   ├── config/                # env validation / ConfigModule setup
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/                     # e2e / integration tests (Supertest)
│   ├── uploads/                  # local disk storage for image attachments (gitignored)
│   ├── .env.example
│   └── package.json
├── frontend/                    # Next.js app
│   ├── src/
│   │   ├── app/                  # App Router pages (login, register, dashboard,
│   │   │                         # board, timeline, items/[id])
│   │   ├── components/           # PhaseBoard, TimelineView, WorkItemCard, StatusBadge,
│   │   │                         # WorkItemForm, AssignmentPicker, ActivityFeed, ...
│   │   ├── lib/                  # axios client, react-query setup, auth context
│   │   ├── hooks/                # useWorkItems, useWorkflowActions, useAuth, ...
│   │   ├── types/                # shared TS types mirroring backend DTOs
│   │   └── test/                 # Vitest + Testing Library setup + component tests
│   ├── .env.example
│   └── package.json
├── docker-compose.yml            # local Postgres for a clean-clone run
├── SYSTEM_DESIGN.md
├── ARCHITECTURE.md
├── TODO.md
├── TEST_PLAN.md                  # added in Phase 9
└── README.md
```

## 2. REST API endpoints

Base path: `/api`. All responses use a consistent envelope on error:
`{ "statusCode": number, "message": string | string[], "error": string }`.

### Auth (`/api/auth`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | public | creates a `MEMBER` (or `MANAGER` for seed only) |
| POST | `/auth/login` | public | returns `{ accessToken, user }` |
| GET | `/auth/me` | JWT | current user info |

### Users (`/api/users`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/users?role=MEMBER` | JWT, Manager | for assignment picker |

### Work items (`/api/work-items`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/work-items` | JWT | Manager: all (filters added in Phase 8). Member: scoped to own assignments only, enforced in the query — unassigned/unauthorized items 404, not 403 |
| GET | `/work-items/assigned-to-me` | JWT, Member | explicit "assigned to me" view (Phase 5) |
| GET | `/work-items/:id` | JWT | 404 if not visible to caller |
| POST | `/work-items` | JWT, Manager | multipart/form-data (fields + optional `image`) |
| PATCH | `/work-items/:id` | JWT, Manager | multipart/form-data; field edits + optional new `image`; never accepts `status` (`forbidNonWhitelisted` rejects it with 400 — status only changes through the Phase 6 workflow actions) |
| DELETE | `/work-items/:id` | JWT, Manager | cascades assignments/activity/extensions; also deletes the attached image file from disk |

Note: no separate `/work-items/:id/image` endpoint — image upload is folded into the
`POST`/`PATCH` multipart bodies above, since NestJS's `FileInterceptor` handles an
optional field cleanly and a dedicated endpoint would just duplicate the same logic.

### Assignments (`/api/work-items/:id/assignments`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| PUT | `/work-items/:id/assignments` | JWT, Manager | body `{ userIds: string[] }`, replaces the list |

### Workflow actions (`/api/work-items/:id/...`)
No separate "assign" action endpoint — `PUT /work-items/:id/assignments` (above) IS
the assign action: it's the same operation as setting the assignee list, and drives
the BACKLOG → ASSIGNED transition itself (see AssignmentsService, Phase 5).

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/work-items/:id/start` | Member (assignee) | ASSIGNED → IN_PROGRESS |
| POST | `/work-items/:id/submit-review` | Member (assignee) | IN_PROGRESS → IN_REVIEW |
| POST | `/work-items/:id/accept` | Manager | IN_REVIEW → DONE |
| POST | `/work-items/:id/send-back` | Manager | IN_REVIEW → IN_PROGRESS |
| POST | `/work-items/:id/cancel` | Manager | any non-terminal status → CANCELLED |
| POST | `/work-items/:id/reopen` | Manager | DONE/CANCELLED → ASSIGNED if the item still has assignees, else BACKLOG |

All six routes above are implemented by `WorkflowService` (`src/workflow/`), which
centralizes every legal transition in one table (`workflow-transitions.ts`) — no
controller or service mutates `status` directly outside this table (`reopen`'s
dynamic target is the one exception, handled as a special case since it isn't a
fixed `from -> to` mapping).

### Extension requests (`/api/work-items/:id/extension-requests`, `/api/extension-requests/:id/...`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/work-items/:id/extension-requests` | Member (assignee) | body `{ proposedDueDate }`; 409 if the item is DONE/CANCELLED or already has a PENDING request |
| POST | `/extension-requests/:id/approve` | Manager | updates the work item's `dueDate` to the proposed date; 409 if already decided |
| POST | `/extension-requests/:id/reject` | Manager | due date untouched; 409 if already decided |

Every work item response includes `pendingExtensionRequest` (the current PENDING
request, or `null`) so the frontend never needs a separate fetch to know whether one
is outstanding.

### Activity log (`/api/work-items/:id/activity`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/work-items/:id/activity` | JWT | scoped same as the parent item |

## 3. Authentication flow
1. `POST /auth/register` → bcrypt-hash password (cost 10+), create `User`, return JWT.
2. `POST /auth/login` → verify email + bcrypt compare → sign JWT
   (`sub`, `email`, `role`, short expiry e.g. 8h) → return `{ accessToken, user }`.
3. Frontend stores the token (in-memory + httpOnly-friendly fallback to localStorage
   for this assessment — documented tradeoff) and attaches `Authorization: Bearer <token>`
   via an Axios interceptor.
4. `JwtAuthGuard` (global, with `@Public()` escape hatch on register/login) validates
   the token on every request; `RolesGuard` + `@Roles('MANAGER')` enforces role checks
   at the handler level. Ownership/scoping (member-sees-own-items) is enforced inside
   the service query layer, not the guard, since it's per-row not per-route.
5. Passwords are never included in a response — `AuthService` builds the returned
   user object field-by-field (`sanitizeUser`) rather than forwarding the Prisma row,
   so there's no risk of `passwordHash` leaking through a future field addition.

## 4. Image upload flow
1. `POST /work-items` and `PATCH /work-items/:id` (multipart) hit a Multer
   `FileInterceptor` configured with `diskStorage` + a `fileFilter`.
2. `fileFilter` rejects a bad mime type (anything other than PNG/JPEG/WEBP) with a
   `400 Bad Request` *before* Multer writes any bytes to disk — an invalid upload
   never leaves an orphaned file behind.
3. A `ParseFilePipe` with `MaxFileSizeValidator` then rejects an oversized file
   (`413`-shaped as our standard `400` error format) — Multer's own diskStorage
   cleans up a partial file automatically when a write is rejected mid-stream.
4. A valid file is written to `backend/uploads/<uuid>.<ext>`; the WorkItem row stores
   the generated filename (`imagePath`). On update with a new image, the old file is
   deleted from disk; on work item delete, the attached file is deleted too.
5. `main.ts` serves `/uploads` as a static directory (outside the `/api` prefix) so the
   frontend can render `<img src="${API_ORIGIN}/uploads/<imagePath>">` directly.

## 5. Testing strategy
- **Backend unit tests** (Jest): `WorkflowService` transition table (legal + illegal
  transitions), role/permission guards, DTO validation edge cases.
- **Backend integration tests** (Jest + Supertest, against a real test DB or the same
  dev DB in a transaction/cleanup pattern): login → create work item → assign → verify
  status + activity log.
- **Auth/security tests**: no token → 401; wrong role → 403; malformed body → 400 with
  consistent error shape.
- **Frontend tests** (Vitest + Testing Library): at least one component test on the
  Timeline/Board rendering logic or a workflow-action interaction.
- Full detail + run commands go in `TEST_PLAN.md` (Phase 9).

## 6. Development order
Mirrors `TODO.md` phases 0 → 10: docs → project setup → DB schema/seed → auth →
work items/upload → assignments → workflow engine → timeline/dashboard UI → filtering
& access control → tests → final docs/QA pass. Each phase ends in a working, committed,
pushed slice — no phase depends on unfinished work from a later phase.
