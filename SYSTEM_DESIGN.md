# TaskFlow — System Design

## 1. Overview
TaskFlow is an internal tool for an IT Manager to create work items, assign them to
team Members, and track them through a controlled lifecycle. The centerpiece is a
Timeline / Phase board view showing where every item stands and whether it's overdue.

Two roles: **Manager** (full control) and **Member** (works their own assigned items).
All authorization is enforced server-side — the UI only reflects what the API allows.

## 2. Domain model

### User
| field | type | notes |
|---|---|---|
| id | uuid (PK) | |
| email | string, unique | login identifier |
| passwordHash | string | bcrypt hash, never returned by the API |
| name | string | |
| role | enum `MANAGER` \| `MEMBER` | |
| createdAt / updatedAt | datetime | |

### WorkItem
| field | type | notes |
|---|---|---|
| id | uuid (PK) | |
| title | string | required, 1–200 chars |
| description | text | optional, max 5000 chars |
| priority | enum `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT` | |
| category | string | free-text tag, e.g. "Bug", "Hardware" |
| dueDate | datetime | required, includes time |
| status | enum (workflow status, see below) | default `BACKLOG` |
| imagePath | string, nullable | server-relative path to uploaded attachment |
| createdById | uuid (FK → User) | |
| createdAt / updatedAt | datetime | |

`isOverdue` is **derived**, not stored: `dueDate < now() AND status NOT IN (DONE, CANCELLED)`.
Computed at query time so it's always accurate and never goes stale.

### Assignment (join table, WorkItem ↔ User, many-to-many)
| field | type | notes |
|---|---|---|
| id | uuid (PK) | |
| workItemId | uuid (FK → WorkItem) | |
| userId | uuid (FK → User) | must reference a `MEMBER` |
| assignedAt | datetime | |

Unique constraint on `(workItemId, userId)` — a member can't be double-assigned.

### ActivityLog
| field | type | notes |
|---|---|---|
| id | uuid (PK) | |
| workItemId | uuid (FK → WorkItem) | |
| actorId | uuid (FK → User) | who performed the action |
| action | string | e.g. `STATUS_CHANGED`, `ASSIGNED`, `EXTENSION_REQUESTED` |
| metadata | json | old/new values, free-form per action |
| createdAt | datetime | |

Append-only. Every mutating operation on a WorkItem writes exactly one row here.

### ExtensionRequest
| field | type | notes |
|---|---|---|
| id | uuid (PK) | |
| workItemId | uuid (FK → WorkItem) | |
| requestedById | uuid (FK → User) | must be an assignee |
| proposedDueDate | datetime | |
| status | enum `PENDING` \| `APPROVED` \| `REJECTED` | |
| decidedById | uuid, nullable (FK → User) | manager who decided |
| createdAt / decidedAt | datetime | |

## 3. Relationships
- `User (1) —— (N) WorkItem.createdBy`
- `User (N) —— (N) WorkItem` through `Assignment`
- `WorkItem (1) —— (N) ActivityLog`
- `WorkItem (1) —— (N) ExtensionRequest`
- `User (1) —— (N) ExtensionRequest.requestedBy`

## 4. Workflow state machine

```
BACKLOG → ASSIGNED → IN_PROGRESS → IN_REVIEW → DONE
    ↑           |            ↑          |
    |           |            └──────────┘ (send back)
    |           └──────────────────────────────→ CANCELLED
    └──────────────────────────────────────────← (reopen from DONE/CANCELLED)
```

| Transition | Actor | Precondition |
|---|---|---|
| `assign` (BACKLOG → ASSIGNED) | Manager | sets ≥1 assignee |
| `startWork` (ASSIGNED → IN_PROGRESS) | Member | actor is an assignee |
| `submitForReview` (IN_PROGRESS → IN_REVIEW) | Member | actor is an assignee |
| `accept` (IN_REVIEW → DONE) | Manager | — |
| `sendBack` (IN_REVIEW → IN_PROGRESS) | Manager | — |
| `cancel` (any non-terminal → CANCELLED) | Manager | — |
| `reopen` (DONE/CANCELLED → BACKLOG or ASSIGNED) | Manager | ASSIGNED if assignees still exist, else BACKLOG |
| auto-fallback (any active status → BACKLOG) | system | triggered when the last assignee is removed |

All transitions are validated against a single transition table in `WorkflowService`.
Any request for an transition not in the table is rejected with `409 Conflict`.
No controller or resolver mutates `status` directly — everything routes through this service.

### Extension request flow
1. Member (must be an assignee) calls `requestExtension(newDueDate)` → creates
   `ExtensionRequest` with status `PENDING`. Does not change the WorkItem yet.
2. Manager `approveExtension(id)` → WorkItem.dueDate updated, request → `APPROVED`.
3. Manager `rejectExtension(id)` → request → `REJECTED`, WorkItem untouched.
4. Both actions write an ActivityLog entry.

### Overdue
Computed, not stored. Any list/detail endpoint returns `isOverdue: boolean` per item.

## 5. Business rules
- A WorkItem must have ≥1 assignee to be in any status other than `BACKLOG` or `CANCELLED`.
- Removing the last assignee from an active item forces it back to `BACKLOG`
  (server-side, inside the same transaction as the assignment removal).
- Only a `MANAGER` can create, delete, assign/reassign, cancel, accept, send back, or reopen.
- Only an assignee `MEMBER` can start work, submit for review, or request an extension
  on that specific item.
- A `MEMBER` can only ever read/act on WorkItems they are assigned to; this is enforced
  in the query layer (`WHERE assignments.userId = :currentUser`), not filtered client-side.
- Image attachments: only `image/png`, `image/jpeg`, `image/webp`; max 5MB; rejected
  with `400 Bad Request` otherwise.

## 6. Role permissions matrix
| Action | Manager | Member |
|---|---|---|
| Create work item | ✅ | ❌ |
| View all work items | ✅ | ❌ (own assigned only) |
| View own assigned items | ✅ | ✅ |
| Update item fields (title/desc/priority/etc.) | ✅ | ❌ |
| Delete item | ✅ | ❌ |
| Assign / reassign | ✅ | ❌ |
| Start work / submit for review | ❌ | ✅ (if assignee) |
| Accept / send back / cancel / reopen | ✅ | ❌ |
| Request extension | ❌ | ✅ (if assignee) |
| Approve / reject extension | ✅ | ❌ |
| Filter by phase/assignee/priority | ✅ | limited to own items |

## 7. Assumptions
- "Team members" are provisioned via `/auth/register` (role defaults to `MEMBER`;
  seed data provides a ready-made Manager — see README). No admin UI for promoting
  roles is required by the brief, so role is fixed at registration for this assessment.
- A work item's `category` is free-text rather than a separate managed table — keeps
  the CRUD surface small; documented as a tradeoff.
- One image attachment per work item (bonus scope covers multiple attachments).
- Timezone: all dates handled as UTC on the server; the frontend formats to the
  browser's local timezone for display.
- "Today marker" on the timeline uses the client's local date at render time.
