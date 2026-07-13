🚀 TaskFlow - Development TODO
📌 Phase 0 – Planning & Architecture
Module: Project Planning
Tasks
 Read the assessment carefully and list all functional requirements.
 Identify assumptions and edge cases.
 Create SYSTEM_DESIGN.md.
 Create ARCHITECTURE.md.
 Create this TODO.md.
SYSTEM_DESIGN.md
 Define the Domain Model.
 Design the Prisma database schema.
 Define entity relationships.
 Design the Workflow State Machine.
 Define Business Rules.
 Define Role Permissions.
 List project assumptions.
ARCHITECTURE.md
 Define folder structure.
 Define REST API endpoints.
 Define authentication flow.
 Define image upload flow.
 Define testing strategy.
 Define development order.
✅ Done When
Architecture is finalized.
No unanswered design questions remain.
Coding can begin without redesigning.
📌 Phase 1 – Project Setup
Module: Backend
Tasks
 Create NestJS project.
 Configure PostgreSQL.
 Configure Prisma.
 Configure environment variables.
 Enable ValidationPipe.
 Configure CORS.
 Configure Swagger (optional if time allows).
Module: Frontend
Tasks
 Create Next.js project.
 Configure Tailwind CSS.
 Configure React Query.
 Configure Axios.
 Configure React Hook Form.
 Configure Zod.
 Create layout.
 Configure protected routing.
Module: Repository
Tasks
 Create GitHub repository.
 Create .gitignore.
 Create .env.example.
 Initial commit.
✅ Done When
Backend and frontend both run successfully.
Database connection works.
Git repository is ready.
📌 Phase 2 – Database Design
Module: Prisma Models
Tasks
 User
 WorkItem
 Assignment
 ActivityLog
 ExtensionRequest
Module: Relationships
Tasks
 User ↔ Assignments
 WorkItem ↔ Assignments
 WorkItem ↔ ActivityLog
 WorkItem ↔ ExtensionRequest
Module: Database
Tasks
 Create migrations.
 Seed database.
 Seed Manager user.
 Seed Member users.
 Seed work items in every workflow state.
✅ Done When
Database migrations succeed.
Seed runs successfully.
Dashboard has meaningful data.
📌 Phase 3 – Authentication & Security
Module: Authentication
Tasks
 Register.
 Login.
 Hash passwords.
 JWT authentication.
Module: Authorization
Tasks
 Role enum.
 Role guards.
 JWT guard.
 Protect all endpoints.
Module: Error Handling
Tasks
 Global exception filter.
 Validation errors.
 Consistent API response format.
 401 responses.
 403 responses.
 404 responses.
 Conflict handling.
✅ Done When
Authentication works.
Unauthorized users cannot access protected endpoints.
Members cannot perform Manager actions.
API errors are consistent.
📌 Phase 4 – Work Items
Module: CRUD
Tasks
 Create Work Item.
 Read Work Item.
 Update Work Item.
 Delete Work Item.
Module: Validation
Tasks
 Title validation.
 Description validation.
 Due date validation.
 Priority validation.
 Category validation.
Module: Image Upload
Tasks
 Configure Multer.
 Validate image type.
 Validate image size.
 Save uploaded file.
 Display uploaded image.
✅ Done When
CRUD is complete.
Images upload successfully.
Validation works.
📌 Phase 5 – Assignment System
Module: Assignments
Tasks
 Assign members.
 Reassign members (replace assignment list).
 Remove assignees.
 "Assigned to Me" view.
Module: Business Rules
Tasks
 Manager only.
 Multiple assignees.
 Removing all assignees resets status to Backlog.
✅ Done When
Assignment works.
Permissions are enforced.
Business rules pass.
📌 Phase 6 – Workflow Engine
Module: WorkflowService
Tasks
 Centralize all status changes.
 Prevent illegal transitions.
 Validate role permissions.
 Validate assignee permissions.
Module: Workflow Actions
Tasks
 Assign
 Start Work
 Submit Review
 Accept
 Send Back
 Cancel
 Reopen
Module: Due Date Extension
Tasks
 Request extension.
 Approve extension.
 Reject extension.
Module: Overdue
Tasks
 Detect overdue items.
 Mark overdue items.
Module: Activity Log
Tasks
 Log every mutation.
 Store actor.
 Store timestamp.
 Store action.
 Store metadata (old/new values where applicable).
✅ Done When
Illegal transitions are impossible.
Every mutation creates an activity log.
Workflow is fully protected.
📌 Phase 7 – Timeline & Dashboard
Module: Timeline
Tasks
 Timeline view.
 Today marker.
 Sort by due date.
 Status badges.
 Overdue indicator.
Module: Phase Board
Tasks
 Backlog
 Assigned
 In Progress
 In Review
 Done
 Cancelled
Module: Dashboard
Tasks
 Total items.
 Overdue items.
 In Review count.
 Done today count.
Module: UX
Tasks
 Loading states.
 Empty states.
 Error states.
 Automatic refresh using React Query.
✅ Done When
Timeline is complete.
Board updates automatically.
Dashboard is responsive and intuitive.
📌 Phase 8 – Filtering & Access Control
Module: Filters
Tasks
 Filter by status.
 Filter by assignee.
 Filter by priority.
Module: Access
Tasks
 Manager sees all items.
 Member sees only assigned items.
 API enforces permissions.
✅ Done When
Filters work.
Data access is secure.
📌 Phase 9 – Testing & Quality Assurance
Module: Backend Tests
Tasks
 Workflow transition tests.
 Role permission tests.
 Authentication tests.
 Integration test (login → create → assign).
Module: Frontend Tests
Tasks
 One meaningful component test.
 Timeline rendering or workflow interaction test.
Module: Validation
Tasks
 Invalid input tests.
 Unauthorized request tests.
 Forbidden request tests.
✅ Done When
All tests pass.
API behaves correctly.
Core workflow is verified.
📌 Phase 10 – Final Review & Submission
Module: Documentation
Tasks
 Update README.
 Add setup instructions.
 Add seed instructions.
 Add test commands.
 Add assumptions.
 Add trade-offs.
 Create TEST_PLAN.md.
Module: Final QA
Review Checklist
 Fresh clone works.
 npm install works.
 Database migration works.
 Seed command works.
 Login works.
 JWT works.
 Manager permissions work.
 Member permissions work.
 CRUD works.
 Assignment works.
 Workflow works.
 Activity timeline works.
 Overdue logic works.
 Image upload works.
 Filters work.
 Loading states work.
 Empty states work.
 Error states work.
 Tests pass.
 No console errors.
 .env.example is complete.
 Repository is public.
 Commit history is clean.
✅ Done When
The project can be cloned and run by following only the README.
Every assessment requirement has been implemented or documented with a justified trade-off.
The submission is ready to send.
