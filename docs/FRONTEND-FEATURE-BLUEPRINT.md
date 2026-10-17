# FlowPilot — Frontend Feature Architecture Blueprint

> **Document Version**: 1.0.0  
> **Status**: Approved Architectural Master Blueprint  
> **Target System**: Next.js App Router (React 19, TypeScript Strict, Tailwind CSS v4, TanStack Query v5)  
> **Reference Baseline**: `MASTER-FEATURE-INVENTORY.md`, `PRODUCT-SCOPE-AND-PHASES.md`

---

## 1. System Topology & Architectural Tenets

FlowPilot frontend is architected as an enterprise-grade multi-tenant Single-Page Application (SPA) shell rendered via Next.js App Router. It communicates with `flowpilot-backend` strictly over TLS REST endpoints with credentialed HTTP-only cookies and dynamic tenant context headers.

### Core Architectural Principles

1. **Server Authorization is Authoritative**:
   Client-side role checks (`OWNER`, `ADMIN`, `MEMBER`, `BILLING`) are for UI affordance only (e.g., hiding action buttons, rendering permission-denied views). All security enforcement occurs on the server via `tenantContextMiddleware`.
2. **Explicit State Categorization**:
   Every piece of state belongs to one of four discrete tiers: Server Cache (TanStack Query), URL State (`nuqs` / `useSearchParams`), Form State (`react-hook-form` + `zod`), or Ephemeral UI State (`useState` / Radix UI).
3. **9-State Resilient UI**:
   Every domain view explicitly implements Initial Loading (Skeleton), Action Pending (`aria-busy`), Empty Dataset (`EmptyState`), Validation Error (inline `role="alert"`), API Error (`ErrorState`), Unauthenticated (401), Forbidden (403), Not Found (404), and Network Disconnected states.
4. **Contract-Driven Decoupling**:
   Zero direct database or Prisma imports exist in the frontend. All data access is routed through the centralized `ApiClient` (`src/lib/api/client.ts`).
5. **Accessibility by Default**:
   WCAG 2.2 AA compliance, semantic landmarks, Radix focus trapping in dialogs, visible 3:1 focus rings, and full keyboard traversability.

---

## 2. Comprehensive Route & Navigation Map

The route hierarchy leverages Next.js App Router route groups to isolate layouts, auth boundaries, and tenant context without polluting the URL structure.

```
src/app/
├── (public)/                               # Public Zone (Unauthenticated)
│   ├── layout.tsx                          # Marketing nav, brand logo, footer
│   ├── page.tsx                            # Landing & value proposition
│   └── book/[orgSlug]/page.tsx             # [V1: SCHED-07] Public online booking widget
├── (auth)/                                 # Authentication Zone (Centered Card Layout)
│   ├── layout.tsx                          # Auth header, brand watermark, no sidebar
│   ├── login/page.tsx                      # [AUTH-01] Sign-in with email & password
│   ├── register/page.tsx                   # [AUTH-02] Account & organization signup
│   ├── forgot-password/page.tsx            # [AUTH-05] Password reset request
│   ├── reset-password/page.tsx             # [AUTH-06] Password reset token completion
│   ├── verify-email/page.tsx               # [AUTH-07] Email verification confirmation
│   └── invite/accept/page.tsx              # [TEAM-03] Team invitation acceptance
├── (dashboard)/                            # Authenticated Workspace Shell
│   ├── layout.tsx                          # Sidebar, Org Switcher, Topbar, Auth Provider
│   ├── dashboard/page.tsx                  # [DASH-01..03] KPI overview & activity feed
│   ├── customers/                          # Customer CRM Domain
│   │   ├── page.tsx                        # [CRM-01] Customer directory table
│   │   └── [id]/page.tsx                   # [CRM-03] Customer detail, notes & history
│   ├── services/                           # Service Catalog & Availability
│   │   ├── page.tsx                        # [SERV-01] Services list & pricing
│   │   └── staff/page.tsx                  # [SERV-06] Staff working shifts & hours
│   ├── calendar/                           # Scheduling & Appointments
│   │   └── page.tsx                        # [SCHED-01] Day/Week/Month operational calendar
│   ├── invoices/                           # Invoices & Manual Payments
│   │   ├── page.tsx                        # [INV-01] Invoice directory & status filters
│   │   ├── new/page.tsx                    # [INV-02] Line-item invoice builder
│   │   └── [id]/page.tsx                   # [INV-03] Invoice detail, preview & payment log
│   ├── settings/                           # Settings & Administration
│   │   ├── layout.tsx                      # Settings sub-navigation sidebar
│   │   ├── organization/page.tsx           # [ORG-01..02] Org profile, currency, timezone
│   │   ├── team/page.tsx                   # [TEAM-01..06] Team members & invitations
│   │   ├── billing/page.tsx                # [BILL-01..03] SaaS plan & Stripe billing portal
│   │   └── profile/page.tsx                # [USER-01..03] Personal profile & password
│   └── reports/                            # [V1: ANLYT-01..04] Cash flow & utilization
│       └── page.tsx
├── error.tsx                               # Global root error boundary
├── global-error.tsx                        # Root HTML error fallback
├── not-found.tsx                           # Global 404 handler
└── layout.tsx                              # Root HTML, providers (Query, Auth, Theme)
```

### Route Guard & Navigation Rules

| Route Group             | Access Rule                | Unauthenticated Action                     | Unauthorized Action                                |
| :---------------------- | :------------------------- | :----------------------------------------- | :------------------------------------------------- |
| **`(public)`**          | Public / All               | Render page                                | N/A                                                |
| **`(auth)`**            | Anonymous only             | If authenticated, redirect to `/dashboard` | N/A                                                |
| **`(dashboard)`**       | Authenticated + Active Org | Redirect to `/login?returnUrl=...`         | Show Forbidden (403) view if role lacks permission |
| **`/settings/team`**    | `['OWNER', 'ADMIN']`       | Redirect to `/login`                       | Render `ForbiddenCard` (403)                       |
| **`/settings/billing`** | `['OWNER']`                | Redirect to `/login`                       | Render `ForbiddenCard` (403)                       |

---

## 3. Feature/Component Responsibility Map

Components are strictly structured by lifecycle and domain reusability to avoid monolithic components and unnecessary fragmentation:

```
src/
├── components/
│   ├── ui/                                 # Low-level accessible primitives (Radix UI)
│   │   ├── button.tsx, input.tsx, card.tsx, dialog.tsx, dropdown-menu.tsx,
│   │   ├── table.tsx, tabs.tsx, badge.tsx, skeleton.tsx, spinner.tsx, textarea.tsx
│   │   └── calendar-picker.tsx             # [New] Date & time range picker primitive
│   ├── feedback/                           # Standardized feedback surfaces
│   │   ├── empty-state.tsx                 # Empty collection prompt with action CTA
│   │   ├── error-state.tsx                 # Inline or card error with retry trigger
│   │   ├── loading-state.tsx               # Centered loading spinner
│   │   └── forbidden-state.tsx             # [New] 403 Insufficient role permissions
│   ├── layout/                             # Structural workspace shells
│   │   ├── container.tsx, page-header.tsx
│   │   ├── sidebar.tsx                     # Collapsible navigation drawer
│   │   ├── topbar.tsx                      # Header with breadcrumbs & user menu
│   │   └── org-switcher.tsx                # Workspace context switcher dropdown
│   └── providers/                          # Application-level providers
│       ├── query-provider.tsx              # TanStack Query Client provider
│       └── auth-provider.tsx               # [New] Session hydration & tenant provider
├── features/                               # Domain-Driven Feature Modules
│   ├── auth/                               # Auth domain
│   │   ├── components/                     # LoginForm, RegisterForm, ForgotPasswordForm
│   │   ├── hooks/                          # useAuth, useLogin, useRegister, useLogout
│   │   ├── types.ts, schemas.ts
│   ├── organizations/                      # Organization & settings domain
│   │   ├── components/                     # OrgProfileForm, OrgSwitcher, WorkspaceCreateModal
│   │   ├── hooks/                          # useOrganization, useUpdateOrganization
│   │   ├── types.ts, schemas.ts
│   ├── team/                               # Team & invitations domain
│   │   ├── components/                     # MemberTable, InviteMemberModal, RoleSelect
│   │   ├── hooks/                          # useTeamMembers, useInviteMember, useUpdateRole
│   │   ├── types.ts, schemas.ts
│   ├── customers/                          # Customer CRM domain
│   │   ├── components/                     # CustomerTable, CustomerForm, CustomerNotesList
│   │   ├── hooks/                          # useCustomers, useCustomer, useCreateCustomer
│   │   ├── types.ts, schemas.ts
│   ├── services/                           # Services & staff availability domain
│   │   ├── components/                     # ServiceList, ServiceModal, ShiftScheduleGrid
│   │   ├── hooks/                          # useServices, useStaffAvailability
│   │   ├── types.ts, schemas.ts
│   ├── appointments/                       # Scheduling & calendar domain
│   │   ├── components/                     # CalendarView, BookingModal, RescheduleModal
│   │   ├── hooks/                          # useAppointments, useBookAppointment, useReschedule
│   │   ├── types.ts, schemas.ts
│   ├── invoices/                           # Invoices & payments domain
│   │   ├── components/                     # InvoiceTable, InvoiceBuilder, PaymentModal, InvoicePreview
│   │   ├── hooks/                          # useInvoices, useCreateInvoice, useRecordPayment
│   │   ├── types.ts, schemas.ts
│   └── dashboard/                          # Dashboard & analytics domain
│       ├── components/                     # MetricCardsGrid, TodaySchedule, ActivityQueue
│       ├── hooks/                          # useDashboardMetrics, useActivityFeed
│       ├── types.ts
```

---

## 4. Unified State Management Strategy

To prevent state synchronization bugs and eliminate bloated global stores, state is strictly partitioned into 4 distinct layers:

```mermaid
graph TD
    subgraph "1. Server Cache State (TanStack Query v5)"
        SC1[User Session & Memberships]
        SC2[Customers, Services, Appointments, Invoices]
        SC3[Automatic Invalidation on Mutations]
        SC4[Optimistic UI Updates on Status Changes]
    end

    subgraph "2. URL Query State (Browser History / SearchParams)"
        UC1[Pagination: ?page=2&limit=25]
        UC2[Search Query: ?search=acme]
        UC3[Status Filters: ?status=PAID]
        UC4[Calendar Range: ?view=week&date=2026-10-14]
    end

    subgraph "3. Local Form State (React Hook Form + Zod)"
        FC1[Draft Form Inputs & Dirty Tracking]
        FC2[Client-Side Schema Validation]
        FC3[Inline Field-Level Error Messages]
        FC4[Submission In-Flight (isSubmitting)]
    end

    subgraph "4. Ephemeral UI State (React useState / Radix)"
        EC1[Modal Open / Closed Triggers]
        EC2[Sidebar Collapse Toggles]
        EC3[Active Tabs in Detail Views]
    end
```

### State Layer Specifications

| State Layer      | Tool / Pattern                             | Lifecycle                        | Persistence                     | Sharing Scope                  |
| :--------------- | :----------------------------------------- | :------------------------------- | :------------------------------ | :----------------------------- |
| **Server State** | TanStack Query (`useQuery`, `useMutation`) | Managed cache (5 min stale time) | In-memory query cache           | Cross-component via query keys |
| **URL State**    | Next.js `useSearchParams` / `useRouter`    | Browser URL lifecycle            | Bookmarked / Shared via URL     | Global across active page      |
| **Form State**   | `react-hook-form` + `zodResolver`          | Unmounts on navigation           | Optional Draft in local storage | Scoped to form component       |
| **Ephemeral UI** | React `useState` / `useReducer`            | Component lifecycle              | Discarded on unmount            | Local to component subtree     |

---

## 5. API Integration & Cache Invalidation Matrix

All endpoints communicate via `ApiClient` with automatic `X-Organization-Id` injection and typed responses. Mutations trigger deterministic cache invalidations:

| Feature ID     | Operation       | Endpoint                                    | Method  | Query Key                             | Invalidation Triggered                                   |
| :------------- | :-------------- | :------------------------------------------ | :-----: | :------------------------------------ | :------------------------------------------------------- |
| **`AUTH-01`**  | Login           | `/api/v1/auth/login`                        | `POST`  | `queryKeys.auth.session()`            | Resets query cache, invalidates `auth.all`               |
| **`AUTH-02`**  | Register        | `/api/v1/auth/register`                     | `POST`  | `queryKeys.auth.session()`            | Invalidate `auth.all`, `organizations.list()`            |
| **`AUTH-03`**  | Hydrate Session | `/api/v1/auth/me`                           |  `GET`  | `queryKeys.auth.session()`            | Read on boot; cached for 10 minutes                      |
| **`AUTH-04`**  | Logout          | `/api/v1/auth/logout`                       | `POST`  | N/A                                   | `queryClient.clear()`                                    |
| **`ORG-01`**   | Read Org        | `/api/v1/organizations/:id`                 |  `GET`  | `queryKeys.organizations.detail(id)`  | —                                                        |
| **`ORG-02`**   | Update Org      | `/api/v1/organizations/:id`                 | `PATCH` | `queryKeys.organizations.detail(id)`  | Invalidates `organizations.detail(id)`, `auth.session()` |
| **`TEAM-01`**  | List Members    | `/api/v1/organizations/:id/members`         |  `GET`  | `queryKeys.organizations.members(id)` | —                                                        |
| **`TEAM-02`**  | Invite Member   | `/api/v1/organizations/:id/invitations`     | `POST`  | N/A                                   | Invalidates `organizations.members(id)`                  |
| **`TEAM-05`**  | Update Role     | `/api/v1/organizations/:id/members/:userId` | `PATCH` | N/A                                   | Invalidates `organizations.members(id)`                  |
| **`CRM-01`**   | List Customers  | `/api/v1/customers`                         |  `GET`  | `queryKeys.customers.list(params)`    | —                                                        |
| **`CRM-02`**   | Create Customer | `/api/v1/customers`                         | `POST`  | N/A                                   | Invalidates `customers.list()`, `dashboard.metrics()`    |
| **`SERV-01`**  | List Services   | `/api/v1/services`                          |  `GET`  | `queryKeys.services.list()`           | —                                                        |
| **`SERV-02`**  | Create Service  | `/api/v1/services`                          | `POST`  | N/A                                   | Invalidates `services.list()`                            |
| **`SCHED-01`** | List Bookings   | `/api/v1/appointments`                      |  `GET`  | `queryKeys.appointments.list(range)`  | —                                                        |
| **`SCHED-02`** | Book Booking    | `/api/v1/appointments`                      | `POST`  | N/A                                   | Invalidates `appointments.all`, `dashboard.all`          |
| **`SCHED-04`** | Reschedule      | `/api/v1/appointments/:id/reschedule`       | `PATCH` | N/A                                   | Optimistic update + invalidates `appointments.all`       |
| **`INV-01`**   | List Invoices   | `/api/v1/invoices`                          |  `GET`  | `queryKeys.invoices.list(params)`     | —                                                        |
| **`INV-02`**   | Create Invoice  | `/api/v1/invoices`                          | `POST`  | N/A                                   | Invalidates `invoices.list()`, `dashboard.metrics()`     |
| **`INV-05`**   | Record Payment  | `/api/v1/invoices/:id/payments`             | `POST`  | N/A                                   | Invalidates `invoices.all`, `dashboard.metrics()`        |

---

## 6. Form Validation & Error Handling Strategy

### Validation Philosophy

1. **Client-Side Pre-Flight (Zod + React Hook Form)**:
   All forms validate client-side before dispatching network requests. Instant feedback is provided on blur (`mode: 'onBlur'`) or submit.
2. **Normalized Backend Error Mapping**:
   When the server returns HTTP 422 `VALIDATION_ERROR`, the `error.details` object (e.g. `{ email: ["Email already in use"] }`) is automatically transformed into React Hook Form field errors via `setError(field, { message })`.
3. **HTTP Status Handling Matrix**:
   - `400 Bad Request`: Inline banner detailing invalid payload or header.
   - `401 Unauthorized`: Triggers `ApiClient.onUnauthorized()`, clearing session state and redirecting to `/login?returnUrl=...`.
   - `403 Forbidden`: Renders `ForbiddenState` component informing user of required role (`OWNER` or `ADMIN`).
   - `404 Not Found`: Renders domain-specific empty/not found message with a back navigation button.
   - `409 Conflict`: Field-level error (e.g. "Email address already registered") or modal collision alert for double-bookings.
   - `429 Rate Limited`: Toast notification: _"Too many requests. Please wait a moment before trying again."_
   - `500 Server Error`: Global `ErrorState` card with a _"Try Again"_ retry button.

---

## 7. Accessibility (a11y) & Responsive Strategy

1. **Semantic Landmarks**:
   - Primary content is wrapped in `<main id="main-content">` with a root `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>`.
   - Navigation elements use `<nav aria-label="...">` with semantic `<header>` and `<footer>`.
2. **Focus Management & Trapping**:
   - All modals utilize Radix UI `Dialog` primitive ensuring focus trapping, background `aria-hidden="true"`, and `Escape` key restoration.
   - Focus rings maintain at least a **3:1 contrast ratio** using `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
3. **Live Regions & Screen Readers**:
   - Dynamic validation errors expose `role="alert"` and link to inputs via `aria-describedby`.
   - Async loading buttons expose `aria-busy="true"` and `disabled` attributes.
4. **Responsive Layouts**:
   - `< 1024px`: Fixed sidebar collapses into an accessible slide-out mobile drawer triggered by an accessible hamburger button (`aria-expanded`).
   - Tables horizontally scroll with sticky header columns or collapse into responsive card items on mobile viewports.

---

## 8. Traceability Matrix: Approved Features to Architecture

The matrix below links every approved FlowPilot feature to its UI route, component, API dependency, test suite, and acceptance criteria:

| Feature ID      | Feature Name                 | Phase  | Primary Route            | Key Components                  | API Endpoint                          | Test Coverage                 |
| :-------------- | :--------------------------- | :----: | :----------------------- | :------------------------------ | :------------------------------------ | :---------------------------- |
| **`AUTH-01`**   | Email & Password Login       |  MVP   | `/login`                 | `LoginForm`, `Input`, `Button`  | `POST /auth/login`                    | Unit (schema), Component, E2E |
| **`AUTH-02`**   | Account & Org Registration   |  MVP   | `/register`              | `RegisterForm`, `OrgInput`      | `POST /auth/register`                 | Unit, Component, E2E          |
| **`AUTH-03`**   | Session Restoration (`/me`)  |  MVP   | `(dashboard)`            | `AuthProvider`, `QueryClient`   | `GET /auth/me`                        | Unit, Integration             |
| **`AUTH-04`**   | Server-Side Logout           |  MVP   | Header                   | `UserMenu`, `LogoutButton`      | `POST /auth/logout`                   | Component, E2E                |
| **`AUTH-05`**   | Password Reset Request       |  MVP   | `/forgot-password`       | `ForgotPasswordForm`            | `POST /auth/forgot-password`          | Unit, Component               |
| **`AUTH-06`**   | Password Reset Completion    |  MVP   | `/reset-password`        | `ResetPasswordForm`             | `POST /auth/reset-password`           | Unit, Component               |
| **`AUTH-07`**   | Email Verification           |   V1   | `/verify-email`          | `VerifyEmailCard`               | `POST /auth/verify-email`             | Component                     |
| **`AUTH-08`**   | Session Expiry Redirect      |  MVP   | Global                   | `ApiClient.onUnauthorized`      | N/A (Client Interceptor)              | Unit, E2E                     |
| **`USER-01`**   | View Personal Profile        |  MVP   | `/settings/profile`      | `ProfileView`, `Card`           | `GET /auth/me`                        | Component                     |
| **`USER-02`**   | Update Personal Profile      |  MVP   | `/settings/profile`      | `ProfileForm`                   | `PATCH /users/me`                     | Component, Integration        |
| **`USER-03`**   | Change Password              |  MVP   | `/settings/profile`      | `ChangePasswordForm`            | `POST /users/change-password`         | Component                     |
| **`USER-04`**   | Notification Preferences     |   V1   | `/settings/profile`      | `NotificationToggles`           | `PATCH /users/preferences`            | Component                     |
| **`ORG-01`**    | View Org Profile             |  MVP   | `/settings/organization` | `OrgProfileCard`                | `GET /organizations/:id`              | Component                     |
| **`ORG-02`**    | Update Org Settings          |  MVP   | `/settings/organization` | `OrgSettingsForm`               | `PATCH /organizations/:id`            | Component, Integration        |
| **`ORG-03`**    | Create Additional Workspace  |   V1   | Header Switcher          | `WorkspaceCreateModal`          | `POST /organizations`                 | Component                     |
| **`ORG-04`**    | Custom Workspace Branding    |   V1   | `/settings/organization` | `LogoUploader`                  | `POST /organizations/:id/logo`        | Component                     |
| **`ORG-05`**    | Workspace Archival           |   V1   | `/settings/organization` | `ArchiveWorkspaceDialog`        | `DELETE /organizations/:id`           | Component                     |
| **`SWITCH-01`** | Organization Switcher UI     |  MVP   | Header / Sidebar         | `OrgSwitcherDropdown`           | `GET /auth/me`                        | Component, E2E                |
| **`SWITCH-02`** | Tenant Header Injection      |  MVP   | Global                   | `ApiClient.request()`           | N/A (Header injection)                | Unit (Verified)               |
| **`SWITCH-03`** | Workspace Re-auth            |  MVP   | Global                   | `queryClient.clear()`           | `GET /organizations/:id`              | Integration                   |
| **`TEAM-01`**   | Team Member Directory        |  MVP   | `/settings/team`         | `MemberTable`, `Badge`          | `GET /organizations/:id/members`      | Component                     |
| **`TEAM-02`**   | Invite Member by Email       |  MVP   | `/settings/team`         | `InviteMemberModal`             | `POST /organizations/:id/invitations` | Component, Integration        |
| **`TEAM-03`**   | Accept Team Invitation       |  MVP   | `/invite/accept`         | `AcceptInviteForm`              | `POST /invitations/accept`            | Component, E2E                |
| **`TEAM-04`**   | Resend / Revoke Invite       |  MVP   | `/settings/team`         | `InviteActionsDropdown`         | `DELETE /invitations/:id`             | Component                     |
| **`TEAM-05`**   | Update Member Role           |  MVP   | `/settings/team`         | `RoleSelectDropdown`            | `PATCH /members/:userId`              | Component                     |
| **`TEAM-06`**   | Remove Member / Leave        |  MVP   | `/settings/team`         | `RemoveMemberDialog`            | `DELETE /members/:userId`             | Component                     |
| **`TEAM-07`**   | Role-Based UI Guards         |  MVP   | Global                   | `PermissionGate`, `useRole`     | N/A (Client check)                    | Unit, Component               |
| **`DASH-01`**   | KPI Metrics Cards            |  MVP   | `/dashboard`             | `MetricCard`, `Skeleton`        | `GET /dashboard/metrics`              | Component                     |
| **`DASH-02`**   | Today's Schedule Glance      |  MVP   | `/dashboard`             | `TodayScheduleList`             | `GET /appointments?date=today`        | Component                     |
| **`DASH-03`**   | Activity Feed Queue          |  MVP   | `/dashboard`             | `ActivityQueueList`             | `GET /activity-feed`                  | Component                     |
| **`DASH-04`**   | Multi-State UI States        |  MVP   | All Views                | `Skeleton`, `EmptyState`        | N/A (Design System)                   | Component (Verified)          |
| **`CRM-01`**    | Customer Directory Listing   |  MVP   | `/customers`             | `CustomerTable`, `Pagination`   | `GET /customers`                      | Component, E2E                |
| **`CRM-02`**    | Create Customer Form         |  MVP   | `/customers`             | `CustomerCreateModal`           | `POST /customers`                     | Component, Integration        |
| **`CRM-03`**    | Customer Detail View         |  MVP   | `/customers/[id]`        | `CustomerProfile`, `Tabs`       | `GET /customers/:id`                  | Component                     |
| **`CRM-04`**    | Edit Customer Details        |  MVP   | `/customers/[id]`        | `CustomerEditForm`              | `PATCH /customers/:id`                | Component                     |
| **`CRM-05`**    | Customer Internal Notes      |  MVP   | `/customers/[id]`        | `NotesTimeline`, `NoteInput`    | `POST /customers/:id/notes`           | Component                     |
| **`CRM-06`**    | Customer Tagging             |   V1   | `/customers`             | `TagBadge`, `TagSelect`         | `PATCH /customers/:id/tags`           | Component                     |
| **`CRM-07`**    | Archive Customer             |   V1   | `/customers/[id]`        | `ArchiveCustomerDialog`         | `DELETE /customers/:id`               | Component                     |
| **`SERV-01`**   | Service Catalog Listing      |  MVP   | `/services`              | `ServiceTable`, `Badge`         | `GET /services`                       | Component                     |
| **`SERV-02`**   | Create Service Modal         |  MVP   | `/services`              | `ServiceCreateModal`            | `POST /services`                      | Component, Integration        |
| **`SERV-03`**   | Edit Service Item            |  MVP   | `/services`              | `ServiceEditModal`              | `PATCH /services/:id`                 | Component                     |
| **`SERV-04`**   | Archive Service              |  MVP   | `/services`              | `ArchiveServiceDialog`          | `DELETE /services/:id`                | Component                     |
| **`SERV-05`**   | Assign Staff to Service      |  MVP   | `/services`              | `StaffAssignmentSelect`         | `PUT /services/:id/staff`             | Component                     |
| **`SERV-06`**   | Staff Shift Availability     |  MVP   | `/services/staff`        | `ShiftScheduleGrid`             | `PUT /staff/:id/availability`         | Component                     |
| **`SERV-07`**   | Blocked Time & Holidays      |  MVP   | `/services/staff`        | `BlockedTimeModal`              | `POST /staff/:id/blocked-time`        | Component                     |
| **`SCHED-01`**  | Interactive Calendar         |  MVP   | `/calendar`              | `CalendarView` (Day/Wk/Mo)      | `GET /appointments`                   | Component, E2E                |
| **`SCHED-02`**  | Book New Appointment         |  MVP   | `/calendar`              | `BookingWizardModal`            | `POST /appointments`                  | Component, Integration        |
| **`SCHED-03`**  | Appointment Detail Modal     |  MVP   | `/calendar`              | `AppointmentDetailModal`        | `GET /appointments/:id`               | Component                     |
| **`SCHED-04`**  | Reschedule Appointment       |  MVP   | `/calendar`              | `RescheduleModal`               | `PATCH /appointments/:id/reschedule`  | Component, E2E                |
| **`SCHED-05`**  | Cancel Appointment           |  MVP   | `/calendar`              | `CancelAppointmentDialog`       | `PATCH /appointments/:id/cancel`      | Component                     |
| **`SCHED-06`**  | Status Lifecycle             |  MVP   | `/calendar`              | `StatusBadge`, `ActionMenu`     | `PATCH /appointments/:id/status`      | Component                     |
| **`SCHED-07`**  | Public Booking Widget        |   V1   | `/book/[orgSlug]`        | `PublicBookingWizard`           | `POST /public/bookings`               | Component, E2E                |
| **`SCHED-08`**  | Recurring Bookings           |   V1   | `/calendar`              | `RecurrenceRuleSelect`          | `POST /appointments/recurring`        | Component                     |
| **`INV-01`**    | Invoice Directory Listing    |  MVP   | `/invoices`              | `InvoiceTable`, `StatusBadge`   | `GET /invoices`                       | Component                     |
| **`INV-02`**    | Line-Item Invoice Builder    |  MVP   | `/invoices/new`          | `InvoiceBuilder`, `LineItems`   | `POST /invoices`                      | Component, Integration        |
| **`INV-03`**    | Invoice PDF / Print Preview  |  MVP   | `/invoices/[id]`         | `InvoicePreview`, `CSSPrint`    | `GET /invoices/:id`                   | Component                     |
| **`INV-04`**    | Issue & Finalize Invoice     |  MVP   | `/invoices/[id]`         | `IssueInvoiceDialog`            | `POST /invoices/:id/issue`            | Component                     |
| **`INV-05`**    | Record Manual Payment        |  MVP   | `/invoices/[id]`         | `RecordPaymentModal`            | `POST /invoices/:id/payments`         | Component, E2E                |
| **`INV-06`**    | 1-Click Convert from Booking |  MVP   | `/calendar`              | `ConvertInvoiceButton`          | `POST /invoices/from-appointment`     | Component                     |
| **`INV-07`**    | Void / Cancel Invoice        |  MVP   | `/invoices/[id]`         | `VoidInvoiceDialog`             | `POST /invoices/:id/void`             | Component                     |
| **`INV-08`**    | Send Invoice via Email       |   V1   | `/invoices/[id]`         | `SendInvoiceEmailModal`         | `POST /invoices/:id/send`             | Component                     |
| **`NOTIF-01`**  | In-App Notification Center   |  MVP   | Header                   | `NotificationBell`, `Drawer`    | `GET /notifications`                  | Component                     |
| **`NOTIF-02`**  | Transactional System Mails   |  MVP   | N/A                      | N/A (Backend service)           | Backend Mailer                        | Integration                   |
| **`NOTIF-03`**  | 24h Advance Booking Reminder |   V1   | N/A                      | N/A (Backend cron)              | Backend Queue                         | Integration                   |
| **`NOTIF-04`**  | SMS Appointment Alerts       | Future | N/A                      | SMS Service                     | Backend Twilio                        | Integration                   |
| **`ANLYT-01`**  | Revenue & Cash Flow Summary  |  MVP   | `/reports`               | `CashFlowChart`, `SummaryCards` | `GET /reports/revenue`                | Component                     |
| **`ANLYT-02`**  | Staff Utilization Reports    |   V1   | `/reports`               | `UtilizationBarChart`           | `GET /reports/utilization`            | Component                     |
| **`ANLYT-03`**  | Customer Retention Summary   |   V1   | `/reports`               | `RetentionMetricsCard`          | `GET /reports/customers`              | Component                     |
| **`ANLYT-04`**  | CSV Data Export              |   V1   | `/reports`               | `ExportButton`                  | `GET /reports/export?format=csv`      | Component                     |
| **`BILL-01`**   | SaaS Plan Matrix Display     |  MVP   | `/settings/billing`      | `PricingPlanCards`              | `GET /billing/plan`                   | Component                     |
| **`BILL-02`**   | Usage Limit Guard Rails      |  MVP   | Global                   | `UsageLimitBanner`              | `GET /billing/usage`                  | Component                     |
| **`BILL-03`**   | Stripe Customer Portal       |   V1   | `/settings/billing`      | `StripePortalButton`            | `POST /billing/portal-session`        | Component, E2E                |
| **`BILL-04`**   | Subscription Downgrade       |   V1   | Global                   | `GracePeriodWarningBanner`      | `GET /billing/status`                 | Component                     |
| **`ADMIN-01`**  | Cross-Tenant System Health   |  MVP   | `/api/v1/health`         | `HealthIndicator`               | `GET /health/ready`                   | Unit, Integration             |
| **`ADMIN-02`**  | Security Audit Event Logging |  MVP   | N/A                      | Audit Model                     | Backend Logger                        | Integration                   |
| **`ADMIN-03`**  | Platform Tenant Management   |   V1   | `/admin/tenants`         | `TenantManagementTable`         | `GET /admin/organizations`            | Component                     |
| **`EXP-01`**    | Client Self-Service Portal   | Future | `/portal`                | `ClientPortalShell`             | Customer Portal API                   | E2E                           |
| **`EXP-02`**    | Project Task Kanban Boards   | Future | `/projects`              | `KanbanBoard`, `TaskCard`       | Projects API                          | Component                     |
| **`EXP-03`**    | Cloud Document Storage       | Future | `/documents`             | `FileDropzone`, `FileList`      | Storage API                           | Component                     |
| **`EXP-04`**    | Online Invoice Payments      |   V1   | `/invoices/[id]/pay`     | `StripeElementsCheckout`        | Stripe Connect API                    | Component, E2E                |
| **`EXP-05`**    | 2-Way External Calendar Sync |   V1   | `/settings/calendar`     | `GoogleCalendarConnect`         | CalDAV / OAuth                        | Component                     |
| **`EXP-06`**    | Webhook & Zapier Engine      | Future | `/settings/webhooks`     | `WebhookForm`, `LogViewer`      | Webhooks API                          | Component                     |
