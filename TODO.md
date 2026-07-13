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
- [ ] Register.
- [ ] Login.
- [ ] Hash passwords.
- [ ] JWT authentication.

### Module: Authorization
- [ ] Role enum.
- [ ] Role guards.
- [ ] JWT guard.
- [ ] Protect all endpoints.

### Module: Error Handling
- [ ] Global exception filter.
- [ ] Validation errors.
- [ ] Consistent API response format.
- [ ] 401 responses.
- [ ] 403 responses.
- [ ] 404 responses.
- [ ] Conflict handling.

**✅ Done When**
- [ ] Authentication works.
- [ ] Unauthorized users cannot access protected endpoints.
- [ ] Members cannot perform Manager actions.
- [ ] API errors are consistent.

---

## 📌 Phase 4 – Work Items

### Module: CRUD
- [ ] Create Work Item.
- [ ] Read Work Item.
- [ ] Update Work Item.
- [ ] Delete Work Item.

### Module: Validation
- [ ] Title validation.
- [ ] Description validation.
- [ ] Due date validation.
- [ ] Priority validation.
- [ ] Category validation.

### Module: Image Upload
- [ ] Configure Multer.
- [ ] Validate image type.
- [ ] Validate image size.
- [ ] Save uploaded file.
- [ ] Display uploaded image.

**✅ Done When**
- [ ] CRUD is complete.
- [ ] Images upload successfully.
- [ ] Validation works.

---

## 📌 Phase 5 – Assignment System

### Module: Assignments
- [ ] Assign members.
- [ ] Reassign members (replace assignment list).
- [ ] Remove assignees.
- [ ] "Assigned to Me" view.

### Module: Business Rules
- [ ] Manager only.
- [ ] Multiple assignees.
- [ ] Removing all assignees resets status to Backlog.

**✅ Done When**
- [ ] Assignment works.
- [ ] Permissions are enforced.
- [ ] Business rules pass.

---

## 📌 Phase 6 – Workflow Engine

### Module: WorkflowService
- [ ] Centralize all status changes.
- [ ] Prevent illegal transitions.
- [ ] Validate role permissions.
- [ ] Validate assignee permissions.

### Module: Workflow Actions
- [ ] Assign
- [ ] Start Work
- [ ] Submit Review
- [ ] Accept
- [ ] Send Back
- [ ] Cancel
- [ ] Reopen

### Module: Due Date Extension
- [ ] Request extension.
- [ ] Approve extension.
- [ ] Reject extension.

### Module: Overdue
- [ ] Detect overdue items.
- [ ] Mark overdue items.

### Module: Activity Log
- [ ] Log every mutation.
- [ ] Store actor.
- [ ] Store timestamp.
- [ ] Store action.
- [ ] Store metadata (old/new values where applicable).

**✅ Done When**
- [ ] Illegal transitions are impossible.
- [ ] Every mutation creates an activity log.
- [ ] Workflow is fully protected.

---

## 📌 Phase 7 – Timeline & Dashboard

### Module: Timeline
- [ ] Timeline view.
- [ ] Today marker.
- [ ] Sort by due date.
- [ ] Status badges.
- [ ] Overdue indicator.

### Module: Phase Board
- [ ] Backlog
- [ ] Assigned
- [ ] In Progress
- [ ] In Review
- [ ] Done
- [ ] Cancelled

### Module: Dashboard
- [ ] Total items.
- [ ] Overdue items.
- [ ] In Review count.
- [ ] Done today count.

### Module: UX
- [ ] Loading states.
- [ ] Empty states.
- [ ] Error states.
- [ ] Automatic refresh using React Query.

**✅ Done When**
- [ ] Timeline is complete.
- [ ] Board updates automatically.
- [ ] Dashboard is responsive and intuitive.

---

## 📌 Phase 8 – Filtering & Access Control

### Module: Filters
- [ ] Filter by status.
- [ ] Filter by assignee.
- [ ] Filter by priority.

### Module: Access
- [ ] Manager sees all items.
- [ ] Member sees only assigned items.
- [ ] API enforces permissions.

**✅ Done When**
- [ ] Filters work.
- [ ] Data access is secure.

---

## 📌 Phase 9 – Testing & Quality Assurance

### Module: Backend Tests
- [ ] Workflow transition tests.
- [ ] Role permission tests.
- [ ] Authentication tests.
- [ ] Integration test (login → create → assign).

### Module: Frontend Tests
- [ ] One meaningful component test.
- [ ] Timeline rendering or workflow interaction test.

### Module: Validation
- [ ] Invalid input tests.
- [ ] Unauthorized request tests.
- [ ] Forbidden request tests.

**✅ Done When**
- [ ] All tests pass.
- [ ] API behaves correctly.
- [ ] Core workflow is verified.

---

## 📌 Phase 10 – Final Review & Submission

### Module: Documentation
- [ ] Update README.
- [ ] Add setup instructions.
- [ ] Add seed instructions.
- [ ] Add test commands.
- [ ] Add assumptions.
- [ ] Add trade-offs.
- [ ] Create TEST_PLAN.md.

### Module: Final QA — Review Checklist
- [ ] Fresh clone works.
- [ ] npm install works.
- [ ] Database migration works.
- [ ] Seed command works.
- [ ] Login works.
- [ ] JWT works.
- [ ] Manager permissions work.
- [ ] Member permissions work.
- [ ] CRUD works.
- [ ] Assignment works.
- [ ] Workflow works.
- [ ] Activity timeline works.
- [ ] Overdue logic works.
- [ ] Image upload works.
- [ ] Filters work.
- [ ] Loading states work.
- [ ] Empty states work.
- [ ] Error states work.
- [ ] Tests pass.
- [ ] No console errors.
- [ ] .env.example is complete.
- [ ] Repository is public.
- [ ] Commit history is clean.

**✅ Done When**
- [ ] The project can be cloned and run by following only the README.
- [ ] Every assessment requirement has been implemented or documented with a justified trade-off.
- [ ] The submission is ready to send.
