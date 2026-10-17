# FlowPilot — Master Feature Inventory & Specification Catalog

> **Document Version**: 1.0.0  
> **Status**: Baseline Product Scope Audit  
> **Target Audience**: Product Managers, Staff Engineers, Stakeholders  
> **System Boundary**: Multi-Tenant Business Operations SaaS (`flowpilot` Frontend + `flowpilot-backend` REST API)

---

## 1. Inventory Methodology & Status Definitions

This document contains the complete, evidence-based feature inventory for FlowPilot. Every feature is cataloged with a permanent, stable ID, business rationale, technical dependencies, security scope, acceptance criteria, and exact implementation status across frontend and backend layers.

### Priority Classifications

- **P0 (Critical MVP)**: Essential for the core multi-tenant product loop to function safely and legally. Without this, the application cannot be shipped to users.
- **P1 (Core Operational MVP)**: Essential for a complete, viable day-to-day business workflow for service professionals (e.g., appointment rescheduling, invoice PDF, member role updates).
- **P2 (Post-MVP / V1)**: High-value capabilities that enhance automation, scale, or flexibility (e.g., public booking widget, recurring appointments, custom tags, Stripe subscription billing).
- **P3 (Future Expansion)**: Advanced capabilities deferred to subsequent product phases (e.g., client portal, project task boards, SMS alerts, Zapier integration).

### Status Definitions

- **Frontend Status**:
  - `Not Started`: No component, route, or state logic exists.
  - `Partial / Mocked`: UI shell, form, or layout exists but uses mock handlers, hardcoded data, or static states.
  - `Implemented`: Component, validation, API integration, and error handling are fully built.
  - `Needs Verification`: Code exists but requires live integration testing or contract verification.
- **Backend / API Status**:
  - `Available`: Endpoint is fully implemented, tested against PostgreSQL, and operational.
  - `Partial`: Endpoint or service exists but requires additional fields, routes, or validation.
  - `Missing`: No database model, service, or route exists in the backend repository.
  - `Needs Verification`: Endpoint exists but contract drift or untested edge cases remain.

---

## 2. Executive Feature Summary & Distribution

The following summary represents the exact count of uniquely specified features in this catalog:

| Module                            | Module Code | P0 (Critical) | P1 (Core MVP) | P2 (V1) | P3 (Future) | Total Features |
| :-------------------------------- | :---------- | :-----------: | :-----------: | :-----: | :---------: | :------------: |
| **Authentication & Recovery**     | `AUTH`      |       4       |       3       |    1    |      0      |     **8**      |
| **User Profile & Account**        | `USER`      |       0       |       3       |    1    |      0      |     **4**      |
| **Organization & Workspace**      | `ORG`       |       1       |       1       |    3    |      0      |     **5**      |
| **Organization Switching**        | `SWITCH`    |       3       |       0       |    0    |      0      |     **3**      |
| **Team Members & Invitations**    | `TEAM`      |       4       |       2       |    1    |      0      |     **7**      |
| **Dashboard & Activity**          | `DASH`      |       1       |       3       |    0    |      0      |     **4**      |
| **Customer CRM**                  | `CRM`       |       4       |       1       |    2    |      0      |     **7**      |
| **Services & Staff Availability** | `SERV`      |       3       |       3       |    1    |      0      |     **7**      |
| **Appointments & Scheduling**     | `SCHED`     |       5       |       1       |    2    |      0      |     **8**      |
| **Invoices & Manual Payments**    | `INV`       |       5       |       2       |    1    |      0      |     **8**      |
| **Notifications & Alerts**        | `NOTIF`     |       0       |       2       |    1    |      1      |     **4**      |
| **Reporting & Analytics**         | `ANLYT`     |       0       |       1       |    3    |      0      |     **4**      |
| **FlowPilot SaaS Subscriptions**  | `BILL`      |       0       |       2       |    2    |      0      |     **4**      |
| **Platform Administration**       | `ADMIN`     |       0       |       2       |    1    |      0      |     **3**      |
| **Future Expansion Modules**      | `EXP`       |       0       |       0       |    2    |      4      |     **6**      |
| **Total**                         | —           |    **30**     |    **26**     | **21**  |    **5**    |     **82**     |

### Release Phase Breakdown

- **MVP Phase (P0 + P1)**: **56 Features** (30 P0 Critical + 26 P1 Core Operations)
- **V1 Phase (P2)**: **21 Features** (Growth, self-service booking, SaaS monetization, reporting)
- **Future Phase (P3)**: **5 Features** (Client portal, project boards, SMS, webhooks)

---

## 3. Comprehensive Feature Catalog

### 3.1 Authentication & Account Recovery (`AUTH`)

| ID            | Feature Name                         | Description                                                                                            | Role      | Priority | Phase |    Frontend Status     | Backend Status | Dependencies                 |
| :------------ | :----------------------------------- | :----------------------------------------------------------------------------------------------------- | :-------- | :------: | :---: | :--------------------: | :------------: | :--------------------------- |
| **`AUTH-01`** | Email & Password Login               | Authenticate users using email and password, setting an HTTP-only session cookie.                      | All Users |  **P0**  |  MVP  |   `Partial / Mocked`   |  `Available`   | `POST /api/v1/auth/login`    |
| **`AUTH-02`** | Account & Workspace Registration     | Multi-step sign-up creating User, Organization, OWNER Membership, and Session in a single transaction. | New Owner |  **P0**  |  MVP  |     `Not Started`      |  `Available`   | `POST /api/v1/auth/register` |
| **`AUTH-03`** | Session Restoration (`/me`)          | Hydrate authenticated user identity, active organization, and memberships on application boot.         | All Users |  **P0**  |  MVP  |     `Not Started`      |  `Available`   | `GET /api/v1/auth/me`        |
| **`AUTH-04`** | Server-Side Logout                   | Invalidate server session in PostgreSQL and clear HTTP-only cookie.                                    | All Users |  **P0**  |  MVP  |     `Not Started`      |  `Available`   | `POST /api/v1/auth/logout`   |
| **`AUTH-05`** | Password Reset Request               | Request email containing single-use, time-limited cryptographic password reset token.                  | All Users |  **P1**  |  MVP  |     `Not Started`      |   `Missing`    | Email Service, Token Storage |
| **`AUTH-06`** | Password Reset Completion            | Validate token and set new Argon2id password hash, terminating other active sessions.                  | All Users |  **P1**  |  MVP  |     `Not Started`      |   `Missing`    | `AUTH-05`, Hash Verification |
| **`AUTH-07`** | Email Verification Workflow          | Verify user ownership of registered email address via single-use verification token.                   | All Users |  **P2**  |  V1   |     `Not Started`      |   `Missing`    | Email Service                |
| **`AUTH-08`** | Session Inactivity & Expiry Handling | Detect expired session cookies (401 response) and redirect user to `/login` with return URL.           | All Users |  **P1**  |  MVP  | `Partial` (API Client) |  `Available`   | `ApiClient onUnauthorized`   |

#### Detailed Specifications: Authentication

```yaml
AUTH-01:
  user_flow: User navigates to /login -> fills email + password -> submits form -> receives session cookie -> redirected to /dashboard.
  security: Argon2id hash verification on server, HttpOnly Secure SameSite=Lax cookie, 15 attempts/15min IP rate limiting.
  acceptance_criteria:
    - Form validates email format and min 8 char password before submission.
    - Invalid credentials show generic error: "Invalid email or password".
    - Successful login navigates to /dashboard and sets authenticated state.
  testing: Vitest unit test for validation schema; Playwright E2E for full login loop.

AUTH-02:
  user_flow: User visits /register -> enters full name, business email, password, organization name -> submits -> workspace created -> redirected to /dashboard.
  security: Atomic database transaction provisions User + Organization + OWNER Membership + Session. Duplicate email returns 409 Conflict.
  acceptance_criteria:
    - Generates unique organization slug with collision avoidance.
    - Assigns registering user the OWNER role.
    - Sets session cookie immediately upon creation.
  testing: Backend live PostgreSQL test already verified; Frontend form validation test required.
```

---

### 3.2 User Profile & Account Settings (`USER`)

| ID            | Feature Name             | Description                                                                                        | Role      | Priority | Phase | Frontend Status |     Backend Status      | Dependencies             |
| :------------ | :----------------------- | :------------------------------------------------------------------------------------------------- | :-------- | :------: | :---: | :-------------: | :---------------------: | :----------------------- |
| **`USER-01`** | View Personal Profile    | Display current user's name, email, status, and joined date.                                       | All Users |  **P1**  |  MVP  |  `Not Started`  | `Available` (via `/me`) | `AUTH-03`                |
| **`USER-02`** | Update Personal Profile  | Allow user to update their display name and contact phone number.                                  | All Users |  **P1**  |  MVP  |  `Not Started`  |        `Missing`        | `PATCH /api/v1/users/me` |
| **`USER-03`** | Change Password          | Authenticated password change requiring current password verification before updating to new hash. | All Users |  **P1**  |  MVP  |  `Not Started`  |        `Missing`        | Argon2id verification    |
| **`USER-04`** | Notification Preferences | Configure personal email and in-app alert preferences for appointment bookings and cancellations.  | All Users |  **P2**  |  V1   |  `Not Started`  |        `Missing`        | User Settings schema     |

---

### 3.3 Organization & Workspace Management (`ORG`)

| ID           | Feature Name                  | Description                                                                              | Role         | Priority | Phase | Frontend Status |     Backend Status      | Dependencies                      |
| :----------- | :---------------------------- | :--------------------------------------------------------------------------------------- | :----------- | :------: | :---: | :-------------: | :---------------------: | :-------------------------------- |
| **`ORG-01`** | View Organization Profile     | View workspace legal name, slug, default currency, time zone, and status.                | All Members  |  **P0**  |  MVP  |  `Not Started`  | `Partial` (Milestone 3) | `GET /api/v1/organizations/:id`   |
| **`ORG-02`** | Update Workspace Settings     | Edit business name, ISO currency (e.g. USD, EUR), and IANA time zone.                    | OWNER, ADMIN |  **P1**  |  MVP  |  `Not Started`  | `Partial` (Milestone 3) | `PATCH /api/v1/organizations/:id` |
| **`ORG-03`** | Create Additional Workspace   | Enable business owners to launch a secondary isolated workspace (e.g., second location). | OWNER        |  **P2**  |  V1   |  `Not Started`  |        `Partial`        | Subscription limits               |
| **`ORG-04`** | Workspace Custom Branding     | Upload custom organization logo for headers, invoice previews, and booking views.        | OWNER, ADMIN |  **P2**  |  V1   |  `Not Started`  |        `Missing`        | Cloud File Storage (S3/R2)        |
| **`ORG-05`** | Workspace Archival / Deletion | Archive or permanently delete organization data with multi-step confirmation.            | OWNER only   |  **P2**  |  V1   |  `Not Started`  |        `Missing`        | Cascade safety checks             |

---

### 3.4 Organization Context & Tenant Switching (`SWITCH`)

| ID              | Feature Name                | Description                                                                                  | Role        | Priority | Phase |       Frontend Status       |          Backend Status           | Dependencies               |
| :-------------- | :-------------------------- | :------------------------------------------------------------------------------------------- | :---------- | :------: | :---: | :-------------------------: | :-------------------------------: | :------------------------- |
| **`SWITCH-01`** | Organization Switcher UI    | Dropdown in dashboard header/sidebar listing all organizations the user belongs to.          | All Members |  **P0**  |  MVP  |     `Partial / Mocked`      |  `Available` (memberships list)   | `AUTH-03`                  |
| **`SWITCH-02`** | Tenant Header Injection     | Injects `X-Organization-Id` into every tenant-scoped API request via centralized client.     | All Members |  **P0**  |  MVP  | `Implemented` (`client.ts`) | `Available` (`tenant-context.ts`) | `SWITCH-01`                |
| **`SWITCH-03`** | Workspace Re-Authentication | Server re-verifies active membership in target organization; reloads tenant queries cleanly. | All Members |  **P0**  |  MVP  |        `Not Started`        |            `Available`            | TanStack Query Cache clear |

---

### 3.5 Team Members, Roles & Invitations (`TEAM`)

| ID            | Feature Name                  | Description                                                                                            | Role         | Priority | Phase |      Frontend Status      |          Backend Status           | Dependencies                     |
| :------------ | :---------------------------- | :----------------------------------------------------------------------------------------------------- | :----------- | :------: | :---: | :-----------------------: | :-------------------------------: | :------------------------------- |
| **`TEAM-01`** | Team Member Directory         | Tabular list of all workspace members displaying name, email, assigned role, and join date.            | All Members  |  **P0**  |  MVP  |       `Not Started`       |      `Partial` (Milestone 3)      | `GET /organizations/:id/members` |
| **`TEAM-02`** | Invite Member by Email        | Issue single-use 7-day cryptographic invite token with role assignment (`ADMIN`, `MEMBER`, `BILLING`). | OWNER, ADMIN |  **P0**  |  MVP  |       `Not Started`       |      `Partial` (Milestone 3)      | Email service / Invite token     |
| **`TEAM-03`** | Accept Team Invitation        | Accept invitation URL, setting up user credentials if new, or linking existing user account.           | Invitee      |  **P0**  |  MVP  |       `Not Started`       |      `Partial` (Milestone 3)      | `POST /invitations/accept`       |
| **`TEAM-04`** | Resend / Revoke Invitation    | Cancel pending invitation or generate refreshed token with reset expiration.                           | OWNER, ADMIN |  **P1**  |  MVP  |       `Not Started`       |      `Partial` (Milestone 3)      | `TEAM-02`                        |
| **`TEAM-05`** | Update Member Role            | Change member role with invariant preventing removal of the last remaining OWNER.                      | OWNER, ADMIN |  **P1**  |  MVP  |       `Not Started`       |      `Partial` (Milestone 3)      | RBAC Invariant enforcement       |
| **`TEAM-06`** | Remove Member / Leave Org     | Remove staff member from workspace or allow member to voluntarily exit.                                | OWNER, ADMIN |  **P1**  |  MVP  |       `Not Started`       |      `Partial` (Milestone 3)      | Session purge for target user    |
| **`TEAM-07`** | Role-Based Access Enforcement | Hide/disable actions and display 403 Forbidden views when role is unauthorized.                        | All Members  |  **P0**  |  MVP  | `Partial` (types defined) | `Available` (`tenant-context.ts`) | UI Permission Gates              |

---

### 3.6 Dashboard & Activity Summaries (`DASH`)

| ID            | Feature Name              | Description                                                                                   | Role        | Priority | Phase |      Frontend Status      | Backend Status | Dependencies        |
| :------------ | :------------------------ | :-------------------------------------------------------------------------------------------- | :---------- | :------: | :---: | :-----------------------: | :------------: | :------------------ |
| **`DASH-01`** | Operational KPI Metrics   | Metric cards displaying Active Customers, Upcoming Bookings, Invoiced Volume, and API Health. | All Members |  **P1**  |  MVP  |    `Partial / Mocked`     |   `Missing`    | Aggregate query API |
| **`DASH-02`** | Today's Schedule Overview | Quick-glance list of today's scheduled appointments with status and assigned staff.           | All Members |  **P1**  |  MVP  |       `Not Started`       |   `Missing`    | `SCHED-01`          |
| **`DASH-03`** | Operations Activity Feed  | Chronological audit queue showing recent customer signups, bookings, and payments.            | All Members |  **P1**  |  MVP  |    `Partial / Mocked`     |   `Missing`    | Activity Log schema |
| **`DASH-04`** | Multi-State UI Feedback   | Robust rendering of Skeletons during data load, EmptyState prompts, and ErrorState alerts.    | All Members |  **P0**  |  MVP  | `Implemented` (UI shells) | N/A (Frontend) | Design System       |

---

### 3.7 CRM & Customer Management (`CRM`)

| ID           | Feature Name                  | Description                                                                                  | Role                 | Priority | Phase | Frontend Status |     Backend Status      | Dependencies             |
| :----------- | :---------------------------- | :------------------------------------------------------------------------------------------- | :------------------- | :------: | :---: | :-------------: | :---------------------: | :----------------------- |
| **`CRM-01`** | Customer Directory Listing    | Paginated table with search, status filters (Active, Inactive), and column sorting.          | All Members          |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Customer Model           |
| **`CRM-02`** | Create Customer Record        | Form validating customer name, email, phone number, and physical/billing address.            | OWNER, ADMIN, MEMBER |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | `CRM-01`                 |
| **`CRM-03`** | Customer Profile Detail View  | Drawer or dedicated page showing contact details, appointment history, and invoice history.  | All Members          |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Relations to Sched & Inv |
| **`CRM-04`** | Edit Customer Record          | In-place editing of customer contact details, notes, and status.                             | OWNER, ADMIN, MEMBER |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | `CRM-02`                 |
| **`CRM-05`** | Customer Internal Notes       | Private operational notes recorded by staff members regarding client preferences or history. | All Members          |  **P1**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Customer Note Model      |
| **`CRM-06`** | Customer Tags & Segments      | Custom color-coded tags (e.g. VIP, Residential, Commercial) for filtering and sorting.       | OWNER, ADMIN         |  **P2**  |  V1   |  `Not Started`  |        `Missing`        | Tag schema               |
| **`CRM-07`** | Archive / Deactivate Customer | Soft-delete customer preventing new bookings while preserving historical invoices and logs.  | OWNER, ADMIN         |  **P2**  |  V1   |  `Not Started`  |        `Missing`        | Soft-delete flag         |

---

### 3.8 Services, Pricing & Availability (`SERV`)

| ID            | Feature Name                 | Description                                                                             | Role                 | Priority | Phase | Frontend Status |     Backend Status      | Dependencies           |
| :------------ | :--------------------------- | :-------------------------------------------------------------------------------------- | :------------------- | :------: | :---: | :-------------: | :---------------------: | :--------------------- |
| **`SERV-01`** | Service Catalog Listing      | Directory of services offered with duration, pricing, description, and active status.   | All Members          |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Service Model          |
| **`SERV-02`** | Create Service Item          | Modal form specifying name, description, duration in minutes, base price, and currency. | OWNER, ADMIN         |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | `SERV-01`              |
| **`SERV-03`** | Edit / Update Service Item   | Modify service duration, description, and pricing without mutating past invoices.       | OWNER, ADMIN         |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Immutability rules     |
| **`SERV-04`** | Archive Service              | Mark service inactive to prevent new appointments while preserving past records.        | OWNER, ADMIN         |  **P1**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Service status enum    |
| **`SERV-05`** | Staff Assignment to Services | Map which team members are qualified or scheduled to perform specific services.         | OWNER, ADMIN         |  **P1**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Staff-Service junction |
| **`SERV-06`** | Staff Weekly Operating Hours | Configure weekly available working windows per staff member (e.g. Mon-Fri 09:00–17:00). | OWNER, ADMIN, MEMBER |  **P1**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Availability Model     |
| **`SERV-07`** | Blocked Time & Holidays      | Block calendar slots for vacation, team meetings, or public holidays.                   | OWNER, ADMIN, MEMBER |  **P1**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | BlockedTime Model      |

---

### 3.9 Appointments & Calendar Scheduling (`SCHED`)

| ID             | Feature Name                 | Description                                                                                   | Role           | Priority | Phase | Frontend Status |     Backend Status      | Dependencies         |
| :------------- | :--------------------------- | :-------------------------------------------------------------------------------------------- | :------------- | :------: | :---: | :-------------: | :---------------------: | :------------------- |
| **`SCHED-01`** | Interactive Calendar Views   | Day, week, and month visual calendar views showing scheduled appointment blocks.              | All Members    |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Appointment Model    |
| **`SCHED-02`** | Book New Appointment         | Wizard selecting Customer, Service, Staff, Date, and Time with overlap conflict check.        | All Members    |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | `CRM-01`, `SERV-01`  |
| **`SCHED-03`** | Appointment Detail Modal     | View appointment summary, customer phone/email, price, duration, and status.                  | All Members    |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | `SCHED-02`           |
| **`SCHED-04`** | Reschedule Appointment       | Shift appointment time or reassign staff member with atomic double-booking collision check.   | All Members    |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Conflict Algorithm   |
| **`SCHED-05`** | Cancel Appointment           | Mark appointment cancelled with mandatory cancellation reason audit logging.                  | All Members    |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Status enum          |
| **`SCHED-06`** | Appointment Status Lifecycle | Transition status: `SCHEDULED` -> `CONFIRMED` -> `IN_PROGRESS` -> `COMPLETED` -> `NO_SHOW`.   | All Members    |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Status Machine       |
| **`SCHED-07`** | Public Online Booking Widget | Embeddable/hosted client-facing page where end-customers select a service and available slot. | Public Clients |  **P2**  |  V1   |  `Not Started`  |        `Missing`        | Public booking token |
| **`SCHED-08`** | Recurring Appointments       | Support weekly or monthly repeat bookings for ongoing service retainers.                      | OWNER, ADMIN   |  **P2**  |  V1   |  `Not Started`  |        `Missing`        | Recurrence engine    |

---

### 3.10 Invoices & Payment Tracking (`INV`)

_Note: Represents the customer business billing domain (client invoices), NOT SaaS subscription billing._

| ID           | Feature Name                 | Description                                                                                        | Role                  | Priority | Phase | Frontend Status |     Backend Status      | Dependencies            |
| :----------- | :--------------------------- | :------------------------------------------------------------------------------------------------- | :-------------------- | :------: | :---: | :-------------: | :---------------------: | :---------------------- |
| **`INV-01`** | Invoice Directory Listing    | Filterable list of invoices with status badges (`DRAFT`, `ISSUED`, `PAID`, `OVERDUE`, `VOID`).     | OWNER, ADMIN, BILLING |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Invoice Model           |
| **`INV-02`** | Create Invoice Builder       | Dynamic line-item builder with quantity, unit rate, tax percentage, discounts, and terms.          | OWNER, ADMIN, BILLING |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | `CRM-01`, LineItems     |
| **`INV-03`** | Invoice PDF / Print Preview  | Formatted invoice document preview displaying organization branding, items, totals, and bank info. | OWNER, ADMIN, BILLING |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | HTML-to-PDF / CSS Print |
| **`INV-04`** | Issue & Finalize Invoice     | Transition from DRAFT to ISSUED, generating a immutable invoice number (e.g. `INV-2026-001`).      | OWNER, ADMIN, BILLING |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Sequence generator      |
| **`INV-05`** | Record Manual Payment        | Log payment receipt (Amount, Method: Cash/Bank/Card, Reference Number, Payment Date).              | OWNER, ADMIN, BILLING |  **P0**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Payment Model           |
| **`INV-06`** | 1-Click Convert from Booking | Generate pre-populated invoice directly from completed appointment details.                        | All Members           |  **P1**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | `SCHED-06` integration  |
| **`INV-07`** | Void / Cancel Invoice        | Void an issued invoice with audit explanation, reversing account balances.                         | OWNER, ADMIN, BILLING |  **P1**  |  MVP  |  `Not Started`  | `Missing` (Milestone 4) | Immutability rules      |
| **`INV-08`** | Send Invoice via Email       | Dispatch invoice PDF attachment and payment summary directly to customer email.                    | OWNER, ADMIN, BILLING |  **P2**  |  V1   |  `Not Started`  |        `Missing`        | Email Service           |

---

### 3.11 Notifications & Communication (`NOTIF`)

| ID             | Feature Name                | Description                                                                                 | Role        | Priority | Phase  |      Frontend Status      | Backend Status | Dependencies           |
| :------------- | :-------------------------- | :------------------------------------------------------------------------------------------ | :---------- | :------: | :----: | :-----------------------: | :------------: | :--------------------- |
| **`NOTIF-01`** | In-App Notification Center  | Header bell icon and drawer showing recent alerts (invites, appointment changes, payments). | All Members |  **P1**  |  MVP   | `Partial / Mocked` (icon) |   `Missing`    | Notification Model     |
| **`NOTIF-02`** | Transactional System Emails | Automated dispatch for team invites, password resets, and appointment confirmation.         | All Members |  **P1**  |  MVP   |       N/A (Backend)       |   `Missing`    | Resend / SES / SMTP    |
| **`NOTIF-03`** | 24-Hour Booking Reminder    | Automated email reminder sent to customer 24 hours prior to scheduled appointment.          | Customers   |  **P2**  |   V1   |       N/A (Backend)       |   `Missing`    | Scheduled Cron / Queue |
| **`NOTIF-04`** | SMS Appointment Alerts      | SMS confirmations and reminders sent via Twilio or MessageBird integration.                 | Customers   |  **P3**  | Future |       `Not Started`       |   `Missing`    | SMS Gateway            |

---

### 3.12 Reporting & Analytics (`ANLYT`)

| ID             | Feature Name                       | Description                                                                                  | Role                  | Priority | Phase | Frontend Status | Backend Status | Dependencies         |
| :------------- | :--------------------------------- | :------------------------------------------------------------------------------------------- | :-------------------- | :------: | :---: | :-------------: | :------------: | :------------------- |
| **`ANLYT-01`** | Revenue & Cash Flow Summary        | Total revenue collected, pending receivables, and overdue aging breakdown over time.         | OWNER, ADMIN, BILLING |  **P1**  |  MVP  |  `Not Started`  |   `Missing`    | `INV-01`, `INV-05`   |
| **`ANLYT-02`** | Staff Utilization & Booking Volume | Booking counts per staff member, completion rates, and average appointment duration.         | OWNER, ADMIN          |  **P2**  |  V1   |  `Not Started`  |   `Missing`    | `SCHED-01` metrics   |
| **`ANLYT-03`** | Customer Retention & Top Clients   | Customer acquisition rates, repeat booking frequency, and highest revenue accounts.          | OWNER, ADMIN          |  **P2**  |  V1   |  `Not Started`  |   `Missing`    | `CRM-01` aggregates  |
| **`ANLYT-04`** | CSV Data Export                    | Export invoices, customers, and appointments to CSV for accounting tools (QuickBooks, Xero). | OWNER, ADMIN, BILLING |  **P2**  |  V1   |  `Not Started`  |   `Missing`    | Streaming CSV parser |

---

### 3.13 FlowPilot SaaS Subscription Billing (`BILL`)

_Note: Represents monetization of the FlowPilot platform itself (tenant subscription), NOT tenant client invoices._

| ID            | Feature Name                       | Description                                                                                           | Role         | Priority | Phase | Frontend Status | Backend Status | Dependencies       |
| :------------ | :--------------------------------- | :---------------------------------------------------------------------------------------------------- | :----------- | :------: | :---: | :-------------: | :------------: | :----------------- |
| **`BILL-01`** | Plan Overview & Feature Matrix     | Display current workspace tier (Starter, Pro, Agency) and included quotas.                            | OWNER        |  **P1**  |  MVP  |  `Not Started`  |   `Missing`    | Plan Configuration |
| **`BILL-02`** | Usage Limit Enforcement            | Guard rails preventing exceeding seat count, monthly appointments, or client limits.                  | OWNER, ADMIN |  **P1**  |  MVP  |  `Not Started`  |   `Missing`    | Quota Middleware   |
| **`BILL-03`** | Stripe Customer Portal Link        | Redirect to Stripe-hosted portal for updating payment method, changing plan, or downloading receipts. | OWNER        |  **P2**  |  V1   |  `Not Started`  |   `Missing`    | Stripe Billing API |
| **`BILL-04`** | Grace Period & Read-Only Downgrade | Enforce read-only state when SaaS subscription payment fails after grace period.                      | All Members  |  **P2**  |  V1   |  `Not Started`  |   `Missing`    | Webhook handler    |

---

### 3.14 Platform Administration & Tenant Ops (`ADMIN`)

| ID             | Feature Name                    | Description                                                                               | Role           | Priority | Phase | Frontend Status |        Backend Status         | Dependencies    |
| :------------- | :------------------------------ | :---------------------------------------------------------------------------------------- | :------------- | :------: | :---: | :-------------: | :---------------------------: | :-------------- |
| **`ADMIN-01`** | Cross-Tenant Operational Health | System health endpoint reporting database pool status, cache status, and error frequency. | Platform Admin |  **P1**  |  MVP  |  N/A (Backend)  | `Available` (`/health/ready`) | Ops Tooling     |
| **`ADMIN-02`** | Security Audit Event Logging    | Append-only log recording authentication, role modifications, and tenant access breaches. | Platform Admin |  **P1**  |  MVP  |  N/A (Backend)  |    `Partial` (App Logger)     | AuditLog Model  |
| **`ADMIN-03`** | Platform Tenant Management      | Admin console to inspect organization status, manual suspension, or quota overrides.      | Platform Admin |  **P2**  |  V1   |  `Not Started`  |           `Missing`           | Superadmin RBAC |

---

### 3.15 Potential Later-Phase Expansion Modules (`EXP`)

| ID           | Feature Name                            | Description                                                                                   | Role          | Priority | Phase  | Frontend Status | Backend Status | Dependencies                |
| :----------- | :-------------------------------------- | :-------------------------------------------------------------------------------------------- | :------------ | :------: | :----: | :-------------: | :------------: | :-------------------------- |
| **`EXP-01`** | Client Self-Service Portal              | Dedicated client portal allowing end-customers to view past invoices, bookings, and receipts. | End Clients   |  **P3**  | Future |  `Not Started`  |   `Missing`    | Magic Link / Customer Auth  |
| **`EXP-02`** | Projects & Task Tracking Boards         | Lightweight Kanban board for managing service project delivery milestones and checklists.     | All Members   |  **P3**  | Future |  `Not Started`  |   `Missing`    | Project & Task Model        |
| **`EXP-03`** | Cloud Document & File Attachments       | Upload photos, PDF briefs, and contracts attached to customers and appointments.              | All Members   |  **P3**  | Future |  `Not Started`  |   `Missing`    | Object Storage (S3/R2)      |
| **`EXP-04`** | Online Invoice Payment (Stripe Connect) | Allow end-clients to pay business invoices online via credit card or Apple Pay.               | End Clients   |  **P2**  |   V1   |  `Not Started`  |   `Missing`    | Stripe Connect              |
| **`EXP-05`** | External 2-Way Calendar Sync            | Synchronize staff appointments with Google Calendar and Microsoft Outlook via iCal/API.       | Staff Members |  **P2**  |   V1   |  `Not Started`  |   `Missing`    | CalDAV / OAuth integrations |
| **`EXP-06`** | Webhook & Zapier Automation             | Webhook emission on events (`booking.created`, `invoice.paid`) for Zapier / Make integration. | OWNER, ADMIN  |  **P3**  | Future |  `Not Started`  |   `Missing`    | Webhook Engine              |

---

## 4. Gap Analysis & Current Implementation Status

### What is Real vs. What is Shell / Placeholder

1. **Authentication**:
   - `flowpilot-backend` has complete, production-grade password hashing, session tokens, transaction provisioning, and live PostgreSQL integration tests.
   - `flowpilot` frontend has only a static login form with client-side Zod validation and a mock `onSubmit` handler that shows a banner. There is no registration page, no `/me` session bootstrapper, and no logout handler.
2. **Organization Switching**:
   - `flowpilot-backend` has `tenantContextMiddleware` which enforces server-side membership checks and rejects foreign organization IDs with HTTP 403 Forbidden.
   - `flowpilot` frontend has a hardcoded string `"Acme Services Ltd."` in `src/app/(dashboard)/layout.tsx` with no dynamic dropdown, no membership hydration, and no tenant switching action.
3. **Dashboard Overview**:
   - `flowpilot` frontend has a UI shell demonstrating view state switching (`Normal`, `Skeleton`, `Empty`) with metric cards displaying `"--"`. No backend aggregations or data pipelines exist.
4. **Business Modules (CRM, Services, Scheduling, Invoicing)**:
   - Neither the frontend nor the backend currently has domain tables, services, or pages for Customers, Services, Appointments, or Invoices. These represent the primary development work of Milestones 4, 5, and 6.

---

## 5. Summary Table by Phase and Implementation State

| Phase             | Total Features | Not Started | Partial / Mocked |                  Implemented                  |
| :---------------- | :------------: | :---------: | :--------------: | :-------------------------------------------: |
| **MVP (P0 + P1)** |     **56**     |     45      |        8         | 3 (`SWITCH-02`, `DASH-04`, Design Primitives) |
| **V1 (P2)**       |     **21**     |     21      |        0         |                       0                       |
| **Future (P3)**   |     **5**      |      5      |        0         |                       0                       |
| **Total**         |     **82**     |   **71**    |      **8**       |                     **3**                     |
