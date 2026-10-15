# FlowPilot — Master Dependency-Aware Implementation Roadmap

> **Document Version**: 2.0.0  
> **Status**: Approved Master Architectural Roadmap  
> **System Boundary**: Multi-Tenant Business Operations SaaS (`flowpilot` Frontend + `flowpilot-backend` REST API)  
> **Traceability Anchor**: `MASTER-FEATURE-INVENTORY.md`, `FEATURE-TRACEABILITY-MATRIX.md`, `PRODUCT-SCOPE-AND-PHASES.md`

---

## 1. Roadmap Architecture & Sequencing Principles

This roadmap defines the strict, dependency-aware execution order for all **82 approved features** across FlowPilot. It ensures zero disconnected UI development, prevents premature frontend integration against missing endpoints, eliminates circular dependencies, and protects the core multi-tenant business loop:

$$\text{Register} \longrightarrow \text{Configure Services} \longrightarrow \text{Add Customer} \longrightarrow \text{Schedule Booking} \longrightarrow \text{Issue Invoice} \longrightarrow \text{Record Payment}$$

### Guiding Principles

1. **Architecture Before Code**: No feature may be coded until its UI wireframe, state model, API contract, and tests are approved.
2. **Backend Contract Alignment**: Endpoints must be verified against PostgreSQL and match normalized envelopes before frontend consumption.
3. **Discrete Readiness Separation**: Frontend status, backend readiness, database migrations, and third-party integrations are tracked independently.
4. **Zero Shell Credibility**: A feature is only marked complete when real data flows through forms, validation, and persistent storage with automated test validation.

---

## 2. Reconciled Phasing & Milestone Master Schedule

```mermaid
gantt
    title FlowPilot Dependency-Aware Milestone Progression
    dateFormat  X
    axisFormat %s

    section Milestone 0 (Foundations)
    M0: Frontend Foundation & Design System (COMPLETED) :done, m0, 0, 10
    M0B: Backend Security Hardening & Session Engine (COMPLETED) :done, m0b, 0, 10

    section MVP Core Loop (56 Features)
    M1: Auth Integration, Workspace Provisioning & Tenant Context (P0/P1) :active, m1, 10, 25
    M2: Organization Settings, Team Roles & Invite Lifecycle (P0/P1) :m2, 25, 40
    M3: Customer CRM Directory & Profile Views (P0/P1) :m3, 40, 55
    M4: Services Catalog, Pricing & Staff Shift Availability (P0/P1) :m4, 55, 70
    M5: Calendar Scheduling, Booking & Conflict Detection (P0/P1) :m5, 70, 85
    M6: Line-Item Invoicing & Manual Payment Reconciliation (P0/P1) :m6, 85, 100
    M7: Dashboard KPIs, Schedule Feed, Cash Reports & MVP Polish :m7, 100, 115

    section Post-MVP & Expansion (26 Features)
    M8: V1 Expansion (Public Booking, SaaS Billing, Reminders, Analytics) :m8, 115, 140
    M9: Future Phase (Client Portal, Project Boards, Sync, Webhooks) :m9, 140, 160
```

---

## 3. Detailed Milestone Breakdowns

---

### Milestone 0: Architecture & Foundation (COMPLETED)

- **Scope**: Reusable UI primitives, design tokens, error models, HTTP client, testing harness, database security.
- **Frontend Deliverables**:
  - [x] Node.js 24 + Next.js 16 App Router foundation.
  - [x] Tailwind CSS v4 design token configuration (`globals.css`).
  - [x] Accessible UI primitives (`Button`, `Input`, `Dialog`, `Card`, `Table`, `Tabs`, `Skeleton`, `DropdownMenu`).
  - [x] Resilient feedback states (`EmptyState`, `ErrorState`, `LoadingState`).
  - [x] Typed `ApiClient` with error normalization and automatic `X-Organization-Id` injection.
  - [x] TanStack Query client & cache configuration.
  - [x] Vitest, Testing Library, and Playwright test setup.
- **Backend Deliverables**:
  - [x] Express + Node.js LTS modular monolith architecture.
  - [x] Fail-fast Zod environment configuration.
  - [x] PostgreSQL database schema with Prisma 6 (`User`, `Organization`, `Membership`, `Session`).
  - [x] Argon2id password hashing + 256-bit cryptographically secure session tokens.
  - [x] Session cookie issuance, invalidation, and `/api/v1/auth/me` endpoint.
  - [x] `tenantContextMiddleware` with database membership verification and RBAC checks.
  - [x] Passing security audits (SEC-02, SEC-03, SEC-05, SEC-07, SEC-08, SEC-11).
  - [x] Operational health & readiness endpoints (`/api/v1/health/ready`).

---

### Milestone 1: Authentication, Workspace Provisioning & Tenant Context (MVP P0/P1)

> **Goal**: Unify frontend auth surfaces with backend authentication engine and establish clean multi-tenant workspace context.

- **Feature Scope**:
  - `AUTH-01`: Email & Password Login (`POST /api/v1/auth/login`)
  - `AUTH-02`: Account & Organization Registration (`POST /api/v1/auth/register`)
  - `AUTH-03`: Persistent Session Restoration (`GET /api/v1/auth/me`)
  - `AUTH-04`: Server-Side Logout (`POST /api/v1/auth/logout`)
  - `AUTH-08`: Session Expiration Interceptor (401 Redirect)
  - `USER-01`: View Personal Profile (`GET /api/v1/auth/me`)
  - `SWITCH-01`: Organization Switcher UI
  - `SWITCH-02`: Tenant Header Injection (`X-Organization-Id`)
  - `SWITCH-03`: Workspace Context Switching & Query Cache Invalidation
- **Prerequisites**:
  - Backend operational routes: `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me`.
  - Resolution of contract mismatches:
    - Update frontend session path from `/auth/session` to `/auth/me`.
    - Align `User` interface to `{ id: string; email: string; name: string }`.
    - Align `PaginationMeta` to `{ total: number }`.
- **Expected Deliverables**:
  1. `src/components/providers/auth-provider.tsx`: Context provider hydrating session from `GET /api/v1/auth/me`.
  2. `src/app/(auth)/login/page.tsx`: Connect real `useLogin` mutation; handle 401 invalid credentials and 429 rate limits.
  3. `src/app/(auth)/register/page.tsx`: Multi-step form creating User + Organization with auto-login.
  4. `src/components/layout/org-switcher.tsx`: Dynamic Radix dropdown rendering user's organizations from `/me`.
  5. `src/components/layout/user-menu.tsx`: User profile trigger with logout action clearing cookie and cache.
- **Acceptance Criteria**:
  - Submitting valid credentials on `/login` sets HttpOnly cookie and redirects to `/dashboard`.
  - Registering provisions User + Organization + OWNER role and lands in new workspace immediately.
  - Switching organizations updates `ApiClient.organizationId`, clears query cache, and reloads dashboard.
  - Expired session interceptor catches 401 and cleanly redirects to `/login?returnUrl=...`.
- **Testing Requirements**:
  - Unit: Form Zod schemas for login and registration.
  - Component: Mock 401 display, mock 409 duplicate email alert.
  - E2E: Full sign-up -> dashboard -> switch org -> logout workflow.
- **Risk Mitigations**:
  - Ensure CORS origin in backend `.env` precisely matches frontend local port.
  - Set production cookie policy to `sameSite: 'lax'` to prevent cross-subdomain cookie drops.

---

### Milestone 2: Organization Settings, Team Management & Access Control (MVP P0/P1)

> **Goal**: Enable business owners to configure workspace defaults and invite team members with role-based access.

- **Feature Scope**:
  - `ORG-01`: View Organization Profile (`GET /api/v1/organizations/:id`)
  - `ORG-02`: Update Workspace Settings (`PATCH /api/v1/organizations/:id`)
  - `TEAM-01`: Team Member Directory (`GET /api/v1/organizations/:id/members`)
  - `TEAM-02`: Invite Member by Email (`POST /api/v1/organizations/:id/invitations`)
  - `TEAM-03`: Accept Team Invitation (`POST /api/v1/invitations/accept`)
  - `TEAM-04`: Resend / Revoke Invitation (`DELETE /api/v1/invitations/:id`)
  - `TEAM-05`: Update Member Role (`PATCH /api/v1/organizations/:id/members/:userId`)
  - `TEAM-06`: Remove Member / Leave Org (`DELETE /api/v1/organizations/:id/members/:userId`)
  - `TEAM-07`: Role-Based Access UI Guards (`PermissionGate`, `useRole()`)
- **Prerequisites**:
  - Milestone 1 completed.
  - Backend Milestone 3 database migration:
    - Add `currency` (String, default "USD") and `timezone` (String, default "UTC") to `Organization`.
    - Create `invitations` table (`id`, `organization_id`, `email`, `role`, `token_hash`, `expires_at`, `status`).
  - Backend endpoints: `/organizations/:id`, `/organizations/:id/members`, `/organizations/:id/invitations`.
- **Expected Deliverables**:
  1. `src/app/(dashboard)/settings/organization/page.tsx`: Workspace name, ISO currency, IANA timezone form.
  2. `src/app/(dashboard)/settings/team/page.tsx`: Tabular member list + pending invitations table.
  3. `src/features/team/components/invite-modal.tsx`: Email input + role select (`ADMIN`, `MEMBER`, `BILLING`).
  4. `src/app/(auth)/invite/accept/page.tsx`: Landing page accepting token and completing password.
  5. Last-owner invariant modal preventing accidental owner demotion or removal.
- **Acceptance Criteria**:
  - Currency input validates against ISO 4217 standard list.
  - Timezone input validates against `Intl.supportedValuesOf('timeZone')`.
  - Only `OWNER` and `ADMIN` can invite members or change roles.
  - Attempting to remove or demote the last remaining `OWNER` is blocked by server invariant with HTTP 400.
  - Non-owners receive disabled inputs or `ForbiddenCard` on restricted settings pages.
- **Testing Requirements**:
  - Unit: Timezone/currency validation schemas, RBAC permission matrix.
  - Component: MemberTable action menus per role, invite modal submit.
  - Integration: Backend invitation token generation and verification.
  - E2E: Invite flow (Owner invites -> Invitee accepts on `/invite/accept` -> Appears in team list).

---

### Milestone 3: Customer CRM Domain (MVP P0/P1)

> **Goal**: Centralized customer database for managing client contact details, notes, and activity history.

- **Feature Scope**:
  - `CRM-01`: Customer Directory Listing with search and pagination (`GET /api/v1/customers`)
  - `CRM-02`: Create Customer Record (`POST /api/v1/customers`)
  - `CRM-03`: Customer Profile Detail View (`GET /api/v1/customers/:id`)
  - `CRM-04`: Edit Customer Record (`PATCH /api/v1/customers/:id`)
  - `CRM-05`: Customer Internal Operational Notes (`POST /api/v1/customers/:id/notes`)
- **Prerequisites**:
  - Milestone 1 & 2 completed.
  - Backend database migration:
    - Create `customers` table (`id`, `organization_id`, `name`, `email`, `phone`, `company`, `address`, `status`, `created_at`).
    - Create `customer_notes` table (`id`, `customer_id`, `author_id`, `content`, `created_at`).
    - Add foreign keys with strict `organization_id` indexing.
  - Backend CRM service and router mounted at `/api/v1/customers`.
- **Expected Deliverables**:
  1. `src/app/(dashboard)/customers/page.tsx`: Paginated table with search input, active/archived filters, and pagination controls.
  2. `src/features/customers/components/customer-create-modal.tsx`: Form with Zod schema validating phone and optional email.
  3. `src/app/(dashboard)/customers/[id]/page.tsx`: Profile layout with tabs for Overview, Appointments, Invoices, and Notes.
  4. `src/features/customers/components/notes-timeline.tsx`: Note input and chronological timeline of operational staff notes.
- **Acceptance Criteria**:
  - Search input debounces at 300ms and updates URL parameter `?search=...`.
  - Customers table supports page navigation with `page`, `limit`, and server-side count.
  - Creating a customer validates phone format and rejects malformed email.
  - Notes append immediately to the timeline with author identity and timestamp.
  - Soft-deleted customers (`status = 'ARCHIVED'`) do not appear in active search.
- **Testing Requirements**:
  - Unit: Customer validation schema.
  - Component: CustomerTable pagination and empty state rendering.
  - Integration: Backend customer CRUD with cross-tenant isolation verification.
  - E2E: Create customer -> view profile -> add operational note.

---

### Milestone 4: Services Catalog, Pricing & Staff Availability (MVP P0/P1)

> **Goal**: Define billable services, durations, pricing rules, and staff weekly working schedules.

- **Feature Scope**:
  - `SERV-01`: Service Catalog Directory (`GET /api/v1/services`)
  - `SERV-02`: Create Service Item (`POST /api/v1/services`)
  - `SERV-03`: Edit / Update Service Item (`PATCH /api/v1/services/:id`)
  - `SERV-04`: Archive Service (`DELETE /api/v1/services/:id`)
  - `SERV-05`: Staff Assignment to Services (`PUT /api/v1/services/:id/staff`)
  - `SERV-06`: Staff Weekly Operating Shifts (`PUT /api/v1/staff/:id/availability`)
  - `SERV-07`: Blocked Time & Holidays (`POST /api/v1/staff/:id/blocked-time`)
- **Prerequisites**:
  - Milestone 2 & 3 completed.
  - Backend database migration:
    - Create `services` table (`id`, `organization_id`, `name`, `description`, `duration_minutes`, `price`, `status`).
    - Create `service_staff` junction table (`service_id`, `user_id`).
    - Create `staff_availability` table (`id`, `user_id`, `day_of_week`, `start_time`, `end_time`, `enabled`).
    - Create `blocked_time` table (`id`, `user_id`, `start_time`, `end_time`, `reason`).
- **Expected Deliverables**:
  1. `src/app/(dashboard)/services/page.tsx`: Directory of services with duration, pricing, and active staff chips.
  2. `src/features/services/components/service-modal.tsx`: Modal specifying name, duration (15-480m), price, and assigned staff.
  3. `src/app/(dashboard)/services/staff/page.tsx`: Staff weekly shift scheduler (Mon-Sun time range inputs with enable toggles).
  4. `src/features/services/components/blocked-time-modal.tsx`: Vacation and meeting calendar blocker.
- **Acceptance Criteria**:
  - Service price cannot be negative; duration must be between 15 and 480 minutes.
  - Every service must have at least one qualified staff member assigned.
  - Updating a service does NOT mutate historical appointment or invoice records.
  - Staff shifts validate that start time precedes end time.
- **Testing Requirements**:
  - Unit: Service and shift validation schemas.
  - Component: ShiftScheduleGrid row toggles, duration picker.
  - Integration: Staff-to-service relation persistence in PostgreSQL.
  - E2E: Create service -> assign staff -> configure working hours.

---

### Milestone 5: Calendar Scheduling & Appointment Lifecycle (MVP P0/P1)

> **Clarification of Investigated Inconsistency**:
>
> - `SCHED-06` is the **Appointment Status Lifecycle** (P0, MVP).
> - `SCHED-07` is the **Public Online Booking Widget** (P2, deferred to V1 Milestone 8).
> - `SCHED-08` is **Recurring Appointments** (P2, deferred to V1 Milestone 8).
>   Milestone 5 focuses strictly on internal staff calendar operations (`SCHED-01` through `SCHED-06`).

- **Feature Scope**:
  - `SCHED-01`: Interactive Calendar Views (Day, Week, Month) (`GET /api/v1/appointments`)
  - `SCHED-02`: Book Appointment Wizard with Conflict Detection (`POST /api/v1/appointments`)
  - `SCHED-03`: Appointment Detail Modal (`GET /api/v1/appointments/:id`)
  - `SCHED-04`: Reschedule Appointment (`PATCH /api/v1/appointments/:id/reschedule`)
  - `SCHED-05`: Cancel Appointment with Audit Reason (`PATCH /api/v1/appointments/:id/cancel`)
  - `SCHED-06`: Appointment Status Lifecycle State Machine (`PATCH /api/v1/appointments/:id/status`)
- **Prerequisites**:
  - Milestone 3 (Customers) & Milestone 4 (Services & Staff Shifts) completed.
  - Backend database migration:
    - Create `appointments` table (`id`, `organization_id`, `customer_id`, `service_id`, `staff_id`, `start_time`, `end_time`, `status`, `notes`, `cancellation_reason`).
    - Add collision check exclusion constraint or database index on `(staff_id, start_time, end_time)`.
  - Collision pre-flight endpoint: `POST /api/v1/appointments/check-conflict`.
- **Expected Deliverables**:
  1. `src/app/(dashboard)/calendar/page.tsx`: Interactive calendar grid with Day/Week/Month toggles and date navigator.
  2. `src/features/appointments/components/booking-modal.tsx`: 4-step wizard (Select Client -> Select Service -> Select Staff -> Select Slot).
  3. `src/features/appointments/components/appointment-detail-modal.tsx`: Inspector showing client info, service details, and status actions.
  4. `src/features/appointments/components/reschedule-modal.tsx`: Time shifter with double-booking prevention.
  5. `src/features/appointments/components/cancel-dialog.tsx`: Reason capture form.
- **Acceptance Criteria**:
  - Double-booking conflict check:
    - Regular `MEMBER` role is strictly blocked with error message if staff slot overlaps.
    - `OWNER` / `ADMIN` receives warning dialog with explicit "Override & Book" button (`DEC-06`).
  - Rescheduling atomically re-validates availability before updating time.
  - Status lifecycle enforces valid transitions: `SCHEDULED` -> `CONFIRMED` -> `IN_PROGRESS` -> `COMPLETED` -> `NO_SHOW`.
  - Completed appointments display the "Generate Invoice" CTA button (`INV-06`).
- **Testing Requirements**:
  - Unit: Conflict detection algorithm, status transition state machine.
  - Component: Calendar view navigation, booking wizard validation.
  - Integration: Concurrent booking race condition tests in backend.
  - E2E: Full booking -> reschedule -> complete appointment lifecycle.

---

### Milestone 6: Line-Item Invoicing & Manual Payment Reconciliation (MVP P0/P1)

> **Goal**: Enable cash flow management, professional client invoice generation, print preview, and payment tracking.

- **Feature Scope**:
  - `INV-01`: Invoice Directory Listing & Status Filters (`GET /api/v1/invoices`)
  - `INV-02`: Line-Item Invoice Builder (`POST /api/v1/invoices`)
  - `INV-03`: Printable Invoice Preview with CSS `@media print` (`GET /api/v1/invoices/:id`)
  - `INV-04`: Issue & Finalize Invoice with Sequential Numbering (`POST /api/v1/invoices/:id/issue`)
  - `INV-05`: Record Manual Payment Receipt (`POST /api/v1/invoices/:id/payments`)
  - `INV-06`: 1-Click Convert Completed Booking to Invoice (`POST /api/v1/invoices/from-appointment/:id`)
  - `INV-07`: Void / Cancel Invoice with Audit Explanation (`POST /api/v1/invoices/:id/void`)
- **Prerequisites**:
  - Milestone 3 (Customers), Milestone 4 (Services), Milestone 5 (Appointments).
  - Backend database migration:
    - Create `invoices` table (`id`, `organization_id`, `customer_id`, `appointment_id`, `invoice_number`, `status`, `issue_date`, `due_date`, `subtotal`, `tax_rate`, `tax_amount`, `discount_amount`, `total_amount`, `balance_due`, `notes`).
    - Create `invoice_line_items` table (`id`, `invoice_id`, `description`, `quantity`, `unit_price`, `total`).
    - Create `payments` table (`id`, `invoice_id`, `amount`, `payment_method`, `reference`, `paid_at`).
    - Add unique invoice number constraint scoped to `organization_id`.
- **Expected Deliverables**:
  1. `src/app/(dashboard)/invoices/page.tsx`: Filterable directory (All, Draft, Issued, Paid, Overdue, Void).
  2. `src/app/(dashboard)/invoices/new/page.tsx`: Line-item builder with dynamic row additions, tax, and discount math.
  3. `src/app/(dashboard)/invoices/[id]/page.tsx`: Professional preview layout with native browser print styling (`@media print`).
  4. `src/features/invoices/components/record-payment-modal.tsx`: Modal logging cash, bank transfer, or card receipts.
  5. 1-Click "Convert to Invoice" button in `AppointmentDetailModal`.
- **Acceptance Criteria**:
  - Invoice calculations maintain 2-decimal financial precision.
  - Issuing an invoice assigns an immutable sequential number (`INV-2026-0001`) and locks items.
  - Recording a payment reduces `balance_due`; when balance reaches $0.00, status becomes `PAID`.
  - Voiding an invoice requires an explanation and reverses receivables from reports.
  - CSS Print stylesheet hides navigation sidebar and topbar, rendering a pristine 8.5x11 / A4 PDF document (`DEC-03`).
- **Testing Requirements**:
  - Unit: Financial math calculations (rounding, tax, discounts), invoice schema.
  - Component: Dynamic line item addition, payment modal validation.
  - Integration: Transactional invoice generation and payment balance updates in PostgreSQL.
  - E2E: Create appointment -> complete -> convert to invoice -> issue -> record payment to PAID.

---

### Milestone 7: Operational Dashboard, KPIs & MVP Completion (MVP P0/P1)

> **Goal**: Tie the operational loop together with real-time KPI metrics, schedule glance, activity queue, and system health.

- **Feature Scope**:
  - `DASH-01`: Operational KPI Metric Cards (`GET /api/v1/dashboard/metrics`)
  - `DASH-02`: Today's Schedule Overview (`GET /api/v1/appointments?date=today`)
  - `DASH-03`: Operations Activity Feed (`GET /api/v1/activity-feed`)
  - `DASH-04`: Multi-State Feedback (Skeleton, Empty, Error)
  - `ANLYT-01`: Revenue & Cash Flow Summary (`GET /api/v1/reports/revenue`)
  - `ADMIN-01`: Cross-Tenant System Health (`GET /api/v1/health/ready`)
  - `ADMIN-02`: Security Audit Event Logging
  - `NOTIF-01`: In-App Notification Bell & Drawer (`GET /api/v1/notifications`)
  - `NOTIF-02`: Transactional System Emails (Invites & Resets)
  - `USER-02`: Update Personal Profile (`PATCH /api/v1/users/me`)
  - `USER-03`: Change Password (`POST /api/v1/users/change-password`)
  - `AUTH-05`: Password Reset Request (`POST /api/v1/auth/forgot-password`)
  - `AUTH-06`: Password Reset Completion (`POST /api/v1/auth/reset-password`)
  - `BILL-01`: SaaS Plan Matrix Overview (`GET /api/v1/billing/plan`)
  - `BILL-02`: Usage Limit Guard Rails (`GET /api/v1/billing/usage`)
- **Deliverables & Criteria**:
  - Wire real PostgreSQL queries into `src/app/(dashboard)/dashboard/page.tsx` replacing hardcoded mocks.
  - Metric cards display real Active Customers, Weekly Bookings, Invoiced Volume, and API Health.
  - Password reset pages functional on `/forgot-password` and `/reset-password`.
  - Operational health indicator in footer pings `/health/ready` every 60s.
  - **Full MVP Release Quality Gate**: 56 MVP features verified, zero mock handlers in core paths, 100% passing tests.

---

### Milestone 8: V1 Expansion (Growth, Automation & Monetization — 21 Features)

> **Goal**: Expand from internal team operations into client self-service, SaaS monetization, email automation, and business intelligence.

- **Feature Scope**:
  - `SCHED-07`: Public Online Booking Widget (`/book/[orgSlug]`)
  - `SCHED-08`: Recurring Appointments Engine (Weekly/Monthly)
  - `BILL-03`: Stripe Customer Portal Integration (`POST /api/v1/billing/portal-session`)
  - `BILL-04`: Grace Period & Read-Only Downgrade Handling
  - `INV-08`: Send Invoice via Email with PDF Attachment
  - `NOTIF-03`: Automated 24-Hour Advance Booking Reminders
  - `ANLYT-02`: Staff Utilization & Booking Volume Reports
  - `ANLYT-03`: Customer Retention & Top Clients Analysis
  - `ANLYT-04`: CSV Data Export for Accounting Software
  - `CRM-06`: Customer Color-Coded Tagging & Segments
  - `CRM-07`: Soft-Delete Customer Record
  - `ORG-03`: Multi-Workspace Creation under Single Account
  - `ORG-04`: Custom Organization Logo Upload (S3/R2 Storage)
  - `ORG-05`: Workspace Archival / Deletion
  - `USER-04`: Notification & Alert Preferences
  - `AUTH-07`: Email Verification Workflow
  - `ADMIN-03`: Platform Superadmin Tenant Console
  - `EXP-04`: Online Invoice Payments via Stripe Connect
  - `EXP-05`: External 2-Way Google / Outlook Calendar Sync

---

### Milestone 9: Future Capabilities (Deferred — 5 Features)

> **Goal**: Advanced ecosystem extensions and enterprise integrations.

- **Feature Scope**:
  - `EXP-01`: Client Self-Service Portal (`/portal` with Magic Link Auth)
  - `EXP-02`: Project & Task Tracking Kanban Boards (`/projects`)
  - `EXP-03`: Cloud Document & Contract File Attachments (S3/R2)
  - `EXP-06`: Webhook & Zapier Automation Dispatcher (`/settings/webhooks`)
  - `NOTIF-04`: SMS Appointment Confirmations & Alerts (Twilio)

---

## 4. Cross-Milestone Dependency Matrix

| Prerequisite Milestone               | Unlocks Downstream Milestone               | Blocker Risk if Skipped                                                                                                                     |
| :----------------------------------- | :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **Milestone 0 (Foundation)**         | Milestone 1 (Auth)                         | Cannot build resilient UI or type-safe API requests without primitives and client.                                                          |
| **Milestone 1 (Auth & Tenant)**      | Milestone 2 (Org & Team)                   | Cannot authorize requests or isolate multi-tenant data without verified session and org ID.                                                 |
| **Milestone 2 (Org & Team)**         | Milestone 3 (CRM) & Milestone 4 (Services) | Cannot assign staff or establish tenant currency/timezone without team and organization records.                                            |
| **Milestone 3 (CRM) & 4 (Services)** | Milestone 5 (Scheduling)                   | Cannot book appointments without a customer record, service definition, and staff availability.                                             |
| **Milestone 5 (Scheduling)**         | Milestone 6 (Invoicing)                    | Cannot execute 1-click invoice conversion without completed appointment state.                                                              |
| **Milestones 3, 5, 6**               | Milestone 7 (Dashboard & KPIs)             | Dashboard metrics remain empty shells without real customer, booking, and invoice aggregates.                                               |
| **Milestones 0–7 (MVP Complete)**    | Milestone 8 (V1) & Milestone 9 (Future)    | Exposing public booking (`SCHED-07`) or Stripe billing (`BILL-03`) before internal scheduling is stable creates severe operational failure. |

---

## 5. Verification Gate & Approval Requirements

Before any implementation code is written for any milestone:

1. **Architecture & Contract Review**: All request/response types and schemas must be documented and approved.
2. **Database Migration Approval**: No ad-hoc schema modifications; migrations must be non-destructive and reviewed.
3. **Product Owner Explicit Sign-Off**: The Product Owner must provide written sign-off on the roadmap and open decision register before Milestone 1 begins.
