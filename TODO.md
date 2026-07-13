# 🚀 TaskFlow - Development TODO

## 📌 Phase 0 – Planning & Architecture

### Module: Project Planning
- [x] Read the assessment carefully and list all functional requirements.
- [x] Identify assumptions and edge cases.
- [x] Create SYSTEM_DESIGN.md.
- [x] Create ARCHITECTURE.md.
- [x] Create this TODO.md.

### SYSTEM_DESIGN.md
- [x] Define the Domain Model.
- [x] Design the Prisma database schema.
- [x] Define entity relationships.
- [x] Design the Workflow State Machine.
- [x] Define Business Rules.
- [x] Define Role Permissions.
- [x] List project assumptions.

### ARCHITECTURE.md
- [x] Define folder structure.
- [x] Define REST API endpoints.
- [x] Define authentication flow.
- [x] Define image upload flow.
- [x] Define testing strategy.
- [x] Define development order.

**✅ Done When**
- [x] Architecture is finalized.
- [x] No unanswered design questions remain.
- [x] Coding can begin without redesigning.

---

## 📌 Phase 1 – Project Setup

### Module: Backend
- [x] Create NestJS project.
- [x] Configure PostgreSQL.
- [x] Configure Prisma.
- [x] Configure environment variables.
- [x] Enable ValidationPipe.
- [x] Configure CORS.
- [ ] Configure Swagger (optional if time allows).

### Module: Frontend
- [x] Create Next.js project.
- [x] Configure Tailwind CSS.
- [x] Configure React Query.
- [x] Configure Axios.
- [x] Configure React Hook Form.
- [x] Configure Zod.
- [x] Create layout.
- [x] Configure protected routing.

### Module: Repository
- [x] Create GitHub repository.
- [x] Create .gitignore.
- [x] Create .env.example.
- [x] Initial commit.

**✅ Done When**
- [x] Backend and frontend both run successfully.
- [x] Database connection works.
- [x] Git repository is ready.

---

## 📌 Phase 2 – Database Design

### Module: Prisma Models
- [x] User
- [x] WorkItem
- [x] Assignment
- [x] ActivityLog
- [x] ExtensionRequest

### Module: Relationships
- [x] User ↔ Assignments
- [x] WorkItem ↔ Assignments
- [x] WorkItem ↔ ActivityLog
- [x] WorkItem ↔ ExtensionRequest

### Module: Database
- [x] Create migrations.
- [x] Seed database.
- [x] Seed Manager user.
- [x] Seed Member users.
- [x] Seed work items in every workflow state.

**✅ Done When**
- [x] Database migrations succeed.
- [x] Seed runs successfully.
- [x] Dashboard has meaningful data.

---

## 📌 Phase 3 – Authentication & Security

### Module: Authentication
- [x] Register.
- [x] Login.
- [x] Hash passwords.
- [x] JWT authentication.

### Module: Authorization
- [x] Role enum.
- [x] Role guards.
- [x] JWT guard.
- [x] Protect all endpoints.

### Module: Error Handling
- [x] Global exception filter.
- [x] Validation errors.
- [x] Consistent API response format.
- [x] 401 responses.
- [x] 403 responses. <!-- verified live in Phase 4: Member POST /work-items -> 403 -->
- [x] 404 responses. <!-- verified live in Phase 4: unknown id, and Member reading an unassigned item -->
- [x] Conflict handling.

**✅ Done When**
- [x] Authentication works.
- [x] Unauthorized users cannot access protected endpoints.
- [x] Members cannot perform Manager actions. <!-- verified live in Phase 4: Alice blocked from creating a work item -->
- [x] API errors are consistent.

---

## 📌 Phase 4 – Work Items

### Module: CRUD
- [x] Create Work Item.
- [x] Read Work Item. <!-- scoped: Manager sees all, Member sees only assigned (built ahead of Phase 8 since it was cheap to do correctly from the start) -->
- [x] Update Work Item. <!-- status field is excluded on purpose; enforced 400 if someone tries to sneak it in -->
- [x] Delete Work Item.

### Module: Validation
- [x] Title validation.
- [x] Description validation.
- [x] Due date validation.
- [x] Priority validation.
- [x] Category validation.

### Module: Image Upload
- [x] Configure Multer.
- [x] Validate image type. <!-- rejected in fileFilter before any disk write, so a bad upload never orphans a file -->
- [x] Validate image size.
- [x] Save uploaded file.
- [x] Display uploaded image. <!-- served statically at /uploads/<file>, verified via live GET -->

**✅ Done When**
- [x] CRUD is complete.
- [x] Images upload successfully.
- [x] Validation works.

---

## 📌 Phase 5 – Assignment System

### Module: Assignments
- [x] Assign members.
- [x] Reassign members (replace assignment list). <!-- one PUT endpoint covers assign/reassign/remove, per ARCHITECTURE.md -->
- [x] Remove assignees.
- [x] "Assigned to Me" view. <!-- GET /work-items/assigned-to-me + already-scoped main list for Members -->

### Module: Business Rules
- [x] Manager only.
- [x] Multiple assignees.
- [x] Removing all assignees resets status to Backlog.

**✅ Done When**
- [x] Assignment works.
- [x] Permissions are enforced.
- [x] Business rules pass.

---

## 📌 Phase 6 – Workflow Engine

### Module: WorkflowService
- [x] Centralize all status changes. <!-- single WORKFLOW_TRANSITIONS table in workflow-transitions.ts; every action funnels through applyTransition/finalizeTransition -->
- [x] Prevent illegal transitions. <!-- verified live: repeat/out-of-order actions and actions on terminal statuses all return 409 -->
- [x] Validate role permissions.
- [x] Validate assignee permissions.

### Module: Workflow Actions
- [x] Assign <!-- built in Phase 5 (AssignmentsService) — assigning IS the BACKLOG->ASSIGNED transition -->
- [x] Start Work
- [x] Submit Review
- [x] Accept
- [x] Send Back
- [x] Cancel
- [x] Reopen <!-- dynamic target verified live: ASSIGNED when assignees remain, BACKLOG when empty -->

### Module: Due Date Extension
- [x] Request extension. <!-- Member/assignee only; blocked on terminal items; one pending request at a time -->
- [x] Approve extension. <!-- updates work item dueDate -->
- [x] Reject extension. <!-- due date untouched; double-decide guarded with 409 -->

### Module: Overdue
- [x] Detect overdue items. <!-- built in Phase 4 (isOverdue util), reused everywhere -->
- [x] Mark overdue items. <!-- isOverdue flag on every API response -->

### Module: Activity Log
- [x] Log every mutation.
- [x] Store actor.
- [x] Store timestamp.
- [x] Store action.
- [x] Store metadata (old/new values where applicable). <!-- verified live: 16-entry log for one item's full lifecycle, in order -->

**✅ Done When**
- [x] Illegal transitions are impossible.
- [x] Every mutation creates an activity log.
- [x] Workflow is fully protected.

---

## 📌 Phase 7 – Timeline & Dashboard

### Module: Timeline
- [x] Timeline view. <!-- grouped by calendar date, chronological -->
- [x] Today marker. <!-- distinct divider, correctly positioned even when no items fall exactly today (verified live) -->
- [x] Sort by due date. <!-- server already returns dueDate asc -->
- [x] Status badges. <!-- validated dataviz palette, categorical hues in fixed order -->
- [x] Overdue indicator. <!-- shared OverdueBadge, status "critical" token -->

### Module: Phase Board
- [x] Backlog
- [x] Assigned
- [x] In Progress
- [x] In Review
- [x] Done
- [x] Cancelled

### Module: Dashboard
- [x] Total items.
- [x] Overdue items.
- [x] In Review count.
- [x] Done today count. <!-- proxied via updatedAt on DONE items — documented assumption, no dedicated completedAt field -->

### Module: UX
- [x] Loading states.
- [x] Empty states.
- [x] Error states.
- [x] Automatic refresh using React Query. <!-- mutation-triggered invalidation + 15s background poll so cross-user changes show up too -->

**✅ Done When**
- [x] Timeline is complete.
- [x] Board updates automatically.
- [x] Dashboard is responsive and intuitive.

---

## 📌 Phase 8 – Filtering & Access Control

### Module: Filters
- [x] Filter by status.
- [x] Filter by assignee. <!-- Manager-only in the UI; backend accepts it from anyone since it composes safely with the visibility scope -->
- [x] Filter by priority.

### Module: Access
- [x] Manager sees all items. <!-- built Phase 4 -->
- [x] Member sees only assigned items. <!-- built Phase 4 -->
- [x] API enforces permissions. <!-- built Phase 3-6; every route -->

**✅ Done When**
- [x] Filters work. <!-- verified live via Playwright: status/priority/assignee each narrow correctly, cleared correctly -->
- [x] Data access is secure. <!-- caught and fixed a real bug while building this: combining the filter with visibility via object spread would have let a Member's assigneeId filter silently overwrite their own scoping -->

---

## 📌 Phase 9 – Testing & Quality Assurance

### Module: Backend Tests
- [x] Workflow transition tests. <!-- workflow.service.spec.ts — 15 cases, legal/illegal transitions, dynamic reopen target -->
- [x] Role permission tests. <!-- roles.guard.spec.ts (Phase 3) -->
- [x] Authentication tests. <!-- auth.e2e-spec.ts (Phase 3) -->
- [x] Integration test (login → create → assign). <!-- work-items.e2e-spec.ts, real DB -->

### Module: Frontend Tests
- [x] One meaningful component test. <!-- workflow-actions.test.tsx -->
- [x] Timeline rendering or workflow interaction test. <!-- both: timeline.test.ts (grouping/today-marker) + workflow-actions.test.tsx -->

### Module: Validation
- [x] Invalid input tests. <!-- 400 cases across auth + work-items e2e specs -->
- [x] Unauthorized request tests. <!-- 401 cases -->
- [x] Forbidden request tests. <!-- 403 cases, unit + e2e -->

**✅ Done When**
- [x] All tests pass. <!-- backend: 3 unit suites (20 tests) + 3 e2e suites (10 tests). frontend: 2 suites (14 tests) -->
- [x] API behaves correctly.
- [x] Core workflow is verified.

---

## 📌 Phase 10 – Final Review & Submission

### Module: Documentation
- [x] Update README.
- [x] Add setup instructions.
- [x] Add seed instructions.
- [x] Add test commands.
- [x] Add assumptions.
- [x] Add trade-offs.
- [x] Create TEST_PLAN.md.

### Module: Final QA — Review Checklist
- [x] Fresh clone works. <!-- literally re-cloned from https://github.com/7ussain313/TaskFlow.git into a scratch dir and ran the README verbatim -->
- [x] npm install works. <!-- both apps, clean clone -->
- [x] Database migration works. <!-- clean clone -->
- [x] Seed command works. <!-- clean clone -->
- [x] Login works. <!-- clean clone browser smoke test -->
- [x] JWT works.
- [x] Manager permissions work.
- [x] Member permissions work.
- [x] CRUD works.
- [x] Assignment works.
- [x] Workflow works.
- [x] Activity timeline works.
- [x] Overdue logic works.
- [x] Image upload works.
- [x] Filters work.
- [x] Loading states work.
- [x] Empty states work. <!-- verified live: combined filters with no matches renders "No work items match these filters." -->
- [x] Error states work.
- [x] Tests pass. <!-- re-run fresh in the clean clone too, not just the working copy: backend 20+10, frontend 14, all green -->
- [x] No console errors. <!-- zero across every Playwright run this phase, including the clean-clone smoke test -->
- [x] .env.example is complete. <!-- root + backend + frontend all reviewed; caught and fixed frontend's was gitignored and never actually committed -->
- [x] Repository is public. <!-- confirmed via GitHub API: private: false -->
- [x] Commit history is clean. <!-- one commit per phase, conventional prefixes, real incremental history -->

**✅ Done When**
- [x] The project can be cloned and run by following only the README. <!-- verified for real, see above -->
- [x] Every assessment requirement has been implemented or documented with a justified trade-off. <!-- see README "Assumptions & tradeoffs" and "What I'd improve" -->
- [x] The submission is ready to send.

---

## 📌 Bonus Phase 11 – API Documentation (Swagger)

### Module: Swagger Setup
- [x] Install Swagger.
- [x] Configure SwaggerModule.
- [x] Add API title and description.
- [x] Configure JWT Bearer authentication.

### Module: Documentation
- [x] Document Authentication endpoints.
- [x] Document Work Item endpoints.
- [x] Document Assignment endpoints.
- [x] Document Workflow endpoints.
- [x] Document Extension Request endpoints.

**✅ Done When**
- [x] Swagger UI loads successfully.
- [x] Every API endpoint is documented.
- [x] Protected endpoints support JWT authentication.

---

## 📌 Bonus Phase 12 – Docker Support

### Module: Backend
- [x] Create Dockerfile.
- [x] Configure production build.

### Module: Frontend
- [x] Create Dockerfile.
- [x] Configure production build.

### Module: Docker Compose
- [x] Add PostgreSQL service.
- [x] Add Backend service.
- [x] Add Frontend service.
- [x] Configure environment variables.
- [x] Configure persistent database volume.

**✅ Done When**
- [x] Entire application starts using one command.
- [x] Fresh environment works correctly.

---

## 📌 Bonus Phase 13 – CI/CD (GitHub Actions)

### Module: Continuous Integration
- [x] Create GitHub Actions workflow.
- [x] Install dependencies.
- [x] Run backend tests.
- [x] Run frontend tests.
- [x] Verify project builds successfully.

### Module: Code Quality
- [x] Run ESLint.
- [x] Verify formatting.

**✅ Done When**
- [x] Every push automatically validates the project.
- [x] Workflow passes successfully.

---

## 📌 Bonus Phase 14 – Advanced Features

### Module: Search
- [x] Search by title.
- [x] Search by description.

### Module: Pagination
- [x] Backend pagination.
- [x] Frontend pagination.

### Module: Sorting
- [x] Sort by due date.
- [x] Sort by priority.
- [x] Sort by status.

**✅ Done When**
- [x] Search is responsive.
- [x] Large datasets are handled efficiently.

---

## 📌 Bonus Phase 15 – Production Polish

### Module: Performance
- [ ] Optimize database queries.
- [ ] Optimize React rendering.
- [ ] Optimize image loading.

### Module: UX
- [ ] Improve responsive design.
- [ ] Improve animations.
- [ ] Improve accessibility.
- [ ] Improve keyboard navigation.

### Module: Final Cleanup
- [ ] Remove unused code.
- [ ] Remove debug logs.
- [ ] Review commit history.
- [ ] Final code review.

**✅ Done When**
- [ ] Project is production-ready.
- [ ] No obvious performance or UX issues remain.
