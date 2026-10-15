# FlowPilot — Complete Feature Architecture Specifications (All 82 Features)

> **Document Version**: 2.0.0  
> **Status**: Complete Architecture Baseline (MVP, V1, and Future Phases)  
> **Authority**: Principal SaaS Architect, Staff Frontend Architect, API Contract Reviewer  
> **Companion Documents**: `MASTER-FEATURE-INVENTORY.md`, `FEATURE-TRACEABILITY-MATRIX.md`, `FRONTEND-FEATURE-BLUEPRINT.md`

---

## Architecture Specification Standard

Every approved feature in FlowPilot across MVP (56 features), V1 (21 features), and Future (5 features) conforms to the standard 15-point architecture specification:

1. **Feature ID & Approved Scope**
2. **Target User & Role Permissions**
3. **User Journey & Business Rules**
4. **Route, Page & Navigation Behavior**
5. **Component Hierarchy & Responsibilities**
6. **Forms & Validation Schemas (Zod)**
7. **State Management (Server, URL, Form, Ephemeral)**
8. **API Operations & Contract (Request/Response Envelope)**
9. **Organization Context & Tenant-Switching Behavior**
10. **Resilient UI States (Loading, Empty, Success, Error, 403, 404, Retry)**
11. **Responsive Behavior & Layout Rules**
12. **Accessibility (WCAG 2.2 AA, ARIA, Keyboard Trapping)**
13. **Testing Requirements (Unit, Component, Integration, E2E)**
14. **Dependencies & Acceptance Criteria**
15. **Backend / Database / Provider Prerequisites & Open Blockers**

---

## Module 1: Authentication & Account Recovery (`AUTH`)

### `AUTH-01`: Email & Password Login

- **Scope**: Authenticate returning users via email and password, setting an HttpOnly secure session cookie.
- **Target User & Permissions**: All registered users (`OWNER`, `ADMIN`, `MEMBER`, `BILLING`).
- **User Journey & Business Rules**: User visits `/login`, enters credentials, submits form. Server validates Argon2id hash. If valid, issues session cookie; if invalid, displays generic inline error. IP rate limited to 15 attempts per 15 min.
- **Route & Navigation**: `src/app/(auth)/login/page.tsx`. Unauthenticated only. Authenticated users redirect to `/dashboard`.
- **Component Hierarchy**: `LoginPage` -> `Card` -> `LoginForm` -> (`Input[email]`, `Input[password]`, `Button[submit]`, `Alert`).
- **Validation Schema**:
  ```ts
  export const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });
  ```
- **State Management**:
  - Form State: `useForm<LoginInput>({ resolver: zodResolver(loginSchema) })`.
  - Server State: `useMutation({ mutationFn: (data) => api.post('/auth/login', data) })`.
  - URL State: `searchParams.get('returnUrl') || '/dashboard'`.
- **API Operations & Contract**:
  - `POST /api/v1/auth/login`
  - Request: `{ email: string, password: string }`
  - Response: `ApiResponse<{ user: { id: string, email: string, name: string }, activeOrganizationId: string, memberships: Membership[] }>` + `Set-Cookie: flowpilot_session`.
  - Error Mapping: 401 -> `"Invalid email or password"`, 429 -> `"Too many attempts. Try again in 15 minutes."`.
- **Org Context**: Hydrates active organization ID from memberships.
- **UI States**: Loading (button spinner, inputs disabled), Error (inline alert), Success (toast + redirect).
- **Responsive & A11y**: Centered 400px card, autofocus on email, `aria-describedby` on errors, visible 3:1 focus rings.
- **Testing**: Unit (validation schema), Component (401 error render), E2E (login -> dashboard).
- **Prerequisites & Status**: Backend route operational in `flowpilot-backend`. Status: Frontend `Partial / Mocked`, Backend `Available`.

### `AUTH-02`: Account & Workspace Registration

- **Scope**: Atomic sign-up creating User, Organization, OWNER Membership, and Session in a single transaction.
- **Target User**: Prospective workspace owners.
- **User Journey & Business Rules**: User visits `/register`, enters name, business email, password, and organization name. Backend executes atomic Prisma transaction. Collision-resistant slug generated.
- **Route & Navigation**: `src/app/(auth)/register/page.tsx`.
- **Component Hierarchy**: `RegisterPage` -> `Card` -> `RegisterForm` -> (`Input[name]`, `Input[email]`, `Input[password]`, `Input[orgName]`, `Button`).
- **Validation Schema**:
  ```ts
  export const registerSchema = z.object({
    name: z.string().min(2).max(70),
    email: z.string().email("Invalid business email"),
    password: z
      .string()
      .min(8, "Min 8 characters")
      .regex(/[A-Z]/, "Must include uppercase")
      .regex(/[0-9]/, "Must include number"),
    organizationName: z.string().min(2).max(100),
  });
  ```
- **API Operations & Contract**: `POST /api/v1/auth/register` -> `201 Created` + session cookie. Error 409 Conflict mapped to `email` field.
- **Org Context**: Initializes registering user as `OWNER` of newly created organization.
- **Testing**: Unit (schema validation), Component (409 conflict handling), E2E (registration flow).
- **Prerequisites & Status**: Backend operational and tested in PostgreSQL. Status: Frontend `Not Started`, Backend `Available`.

### `AUTH-03`: Session Restoration & Identity Hydration (`/me`)

- **Scope**: Restore authenticated identity, active organization ID, and role permissions on application boot.
- **Target User**: All users.
- **Architecture**: `src/components/providers/auth-provider.tsx` wrapping `(dashboard)/layout.tsx`.
- **State**: Query Key `queryKeys.auth.session()`, `staleTime: 10 * 60 * 1000`, `retry: false`.
- **API Contract**: `GET /api/v1/auth/me` -> `200 { user, activeOrganizationId, memberships }`.
- **Behavior**: 401 clears context and triggers `router.replace('/login?returnUrl=...')`. 200 exposes `useAuth()` hook.
- **Testing**: Unit (AuthProvider hook), Integration (Mock 200/401 hydration).
- **Prerequisites & Status**: Backend operational. Path reconciled from `/auth/session` to `/auth/me`. Status: Frontend `Not Started`, Backend `Available`.

### `AUTH-04`: Server-Side Logout

- **Scope**: Terminate database session in PostgreSQL and purge browser cookies.
- **Target User**: All users.
- **Route & Components**: Header `UserMenu` -> `LogoutButton` -> `Dialog` confirmation.
- **API Contract**: `POST /api/v1/auth/logout` -> `200 OK` + expired cookie header.
- **Behavior**: Calls `queryClient.clear()` to purge all cached tenant data, then redirects to `/login`.
- **Testing**: Component (dialog trigger), E2E (cookie purged, redirect verified).
- **Prerequisites & Status**: Backend operational. Status: Frontend `Not Started`, Backend `Available`.

### `AUTH-05`: Password Reset Request

- **Scope**: Generate single-use, 1-hour cryptographic password reset token and dispatch email.
- **Target User**: All users who forgot credentials.
- **Route & Components**: `/forgot-password` -> `ForgotPasswordForm` (`Input[email]`, `Button`).
- **Validation**: `z.object({ email: z.string().email() })`.
- **API Contract**: `POST /api/v1/auth/forgot-password` -> Always returns `200 { success: true, message: "If an account exists, a reset link has been dispatched." }` to prevent email enumeration.
- **Prerequisites**: Email service (`DEC-01`), Token model in database. Status: Frontend `Not Started`, Backend `Missing`.

### `AUTH-06`: Password Reset Completion

- **Scope**: Validate single-use token and update Argon2id password hash, terminating other sessions.
- **Route & Components**: `/reset-password?token=...` -> `ResetPasswordForm` (`Input[password]`, `Input[confirmPassword]`).
- **API Contract**: `POST /api/v1/auth/reset-password` -> Request `{ token: string, password: string }`.
- **Behavior**: Rejects expired tokens with HTTP 400. On success, revokes all active sessions for user.
- **Prerequisites**: `AUTH-05`. Status: Frontend `Not Started`, Backend `Missing`.

### `AUTH-07`: Email Verification Workflow (V1)

- **Scope**: Confirm ownership of business email address via single-use verification link.
- **Route & Components**: `/verify-email?token=...` -> `VerifyEmailCard`.
- **API Contract**: `POST /api/v1/auth/verify-email` -> Updates `user.status` to `ACTIVE`.
- **Prerequisites**: Email service (`DEC-01`). Status: Frontend `Not Started`, Backend `Missing`.

### `AUTH-08`: Session Inactivity & Expiry Interceptor

- **Scope**: Intercept 401 Unauthorized responses across all background API calls and redirect cleanly.
- **Architecture**: Hooked into `src/lib/api/client.ts` via `onUnauthorized` callback.
- **Behavior**: Displays toast alert _"Session expired. Please log in again."_, purges cache, redirects to `/login?returnUrl=${path}`.
- **Testing**: Unit test in `client.test.ts`, E2E test with simulated 401. Status: Frontend `Partial` (client ready), Backend `Available`.

---

## Module 2: User Profile & Account Settings (`USER`)

### `USER-01`: View Personal Profile

- **Scope**: Display user name, email, avatar, active memberships, and joined date.
- **Route & Components**: `/settings/profile` -> `ProfileView` (`Card`, `Avatar`, `Badge`).
- **API Contract**: `GET /api/v1/auth/me` -> Populated via `useAuth()` hook. Status: Frontend `Not Started`, Backend `Available`.

### `USER-02`: Update Personal Profile

- **Scope**: Edit staff member display name and contact phone number.
- **Route & Components**: `/settings/profile` -> `ProfileForm` (`Input[name]`, `Input[phone]`, `Button`).
- **Validation**: `z.object({ name: z.string().min(2).max(70), phone: z.string().max(20).optional() })`.
- **API Contract**: `PATCH /api/v1/users/me` -> Returns updated user; invalidates `auth.session()`. Status: Frontend `Not Started`, Backend `Missing`.

### `USER-03`: Change Password

- **Scope**: Authenticated password rotation requiring verification of existing password.
- **Route & Components**: `/settings/profile` -> `ChangePasswordForm` (`currentPassword`, `newPassword`, `confirmPassword`).
- **API Contract**: `POST /api/v1/users/change-password` -> Verifies existing Argon2id hash before updating. Status: Frontend `Not Started`, Backend `Missing`.

### `USER-04`: Notification Preferences (V1)

- **Scope**: Toggle personal email and in-app alerts for appointment bookings, cancellations, and invoices.
- **Route & Components**: `/settings/profile` -> `NotificationPreferencesForm` (Radix `Switch` components).
- **API Contract**: `PATCH /api/v1/users/preferences` -> Persists user preference flags. Status: Frontend `Not Started`, Backend `Missing`.

---

## Module 3: Organization & Workspace Management (`ORG`)

### `ORG-01`: View Organization Profile

- **Scope**: View organization legal name, slug, default ISO currency, and IANA timezone.
- **Route & Components**: `/settings/organization` -> `OrgProfileCard`.
- **Permissions**: Viewable by all members; edit controls hidden for non-admins (`TEAM-07`).
- **API Contract**: `GET /api/v1/organizations/:id` -> `200 { id, name, slug, currency, timezone, status }`. Status: Frontend `Not Started`, Backend `Missing`.

### `ORG-02`: Update Workspace Settings

- **Scope**: Edit workspace name, ISO currency, and IANA timezone.
- **Route & Components**: `/settings/organization` -> `OrgSettingsForm` (`Input[name]`, `Select[currency]`, `Select[timezone]`).
- **Permissions**: Restricted to `OWNER` and `ADMIN`.
- **Validation**:
  ```ts
  export const orgSettingsSchema = z.object({
    name: z.string().min(2).max(100),
    currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD", "JPY"]),
    timezone: z
      .string()
      .refine((tz) => Intl.supportedValuesOf("timeZone").includes(tz), "Invalid IANA timezone"),
  });
  ```
- **API Contract**: `PATCH /api/v1/organizations/:id` -> Invalidates `organizations.detail(id)` and `auth.session()`. Status: Frontend `Not Started`, Backend `Missing`.

### `ORG-03`: Create Additional Workspace (V1)

- **Scope**: Enable business owners to launch a secondary isolated workspace under their existing account.
- **Route & Components**: Org Switcher -> `+ New Workspace` button -> `WorkspaceCreateModal`.
- **Permissions**: `OWNER` only. Governed by subscription seat/workspace limits (`BILL-02`). Status: Frontend `Not Started`, Backend `Missing`.

### `ORG-04`: Custom Workspace Branding (V1)

- **Scope**: Upload organization logo for headers, invoice previews, and booking views.
- **Route & Components**: `/settings/organization` -> `LogoUploader` (Dropzone with image preview).
- **Prerequisites**: S3 / Cloudflare R2 object storage provider. Status: Frontend `Not Started`, Backend `Missing`.

### `ORG-05`: Workspace Archival / Deletion (V1)

- **Scope**: Permanently delete or archive organization data with multi-step name verification.
- **Route & Components**: `/settings/organization` -> `ArchiveWorkspaceDialog`.
- **Permissions**: `OWNER` only. Status: Frontend `Not Started`, Backend `Missing`.

---

## Module 4: Organization Context & Tenant Switching (`SWITCH`)

### `SWITCH-01`: Organization Switcher UI

- **Scope**: Dropdown in dashboard header/sidebar listing all organizations the user belongs to.
- **Route & Components**: `src/components/layout/org-switcher.tsx` (Radix `DropdownMenu`).
- **Behavior**: Displays active workspace name and role badge. Lists alternative workspaces with active checkmark. Status: Frontend `Partial / Mocked`, Backend `Available`.

### `SWITCH-02`: Tenant Header Injection (`X-Organization-Id`)

- **Scope**: Centralized injection of active organization ID on all tenant-scoped API requests.
- **Architecture**: `src/lib/api/client.ts` -> Automatically includes `X-Organization-Id` header.
- **Status**: Frontend `Implemented` (verified in unit tests), Backend `Available` (enforced in `tenantContextMiddleware`).

### `SWITCH-03`: Workspace Context Switching & Cache Purge

- **Scope**: Safely transition active workspace without cross-tenant data bleed.
- **Behavior**: On selection of new organization, sets new active ID in `ApiClient`, calls `queryClient.clear()`, and pushes to `/dashboard`. Status: Frontend `Not Started`, Backend `Available`.

---

## Module 5: Team Members, Roles & Invitations (`TEAM`)

### `TEAM-01`: Team Member Directory

- **Scope**: Tabular listing of active workspace staff and pending invitations with roles and join dates.
- **Route & Components**: `/settings/team` -> `MemberTable` (`Avatar`, `Badge`, `ActionMenu`).
- **API Contract**: `GET /api/v1/organizations/:id/members` -> `200 { members: Member[], invitations: Invitation[] }`. Status: Frontend `Not Started`, Backend `Missing`.

### `TEAM-02`: Invite Member by Email

- **Scope**: Issue single-use 7-day cryptographic invite token with assigned role (`ADMIN`, `MEMBER`, `BILLING`).
- **Route & Components**: `/settings/team` -> `InviteMemberModal` (`Dialog`).
- **Validation**: `z.object({ email: z.string().email(), role: z.enum(["ADMIN", "MEMBER", "BILLING"]) })`.
- **API Contract**: `POST /api/v1/organizations/:id/invitations` -> Returns `201 Created`. Status: Frontend `Not Started`, Backend `Missing`.

### `TEAM-03`: Accept Team Invitation

- **Scope**: Landing route validating token and onboarding new user or linking existing account.
- **Route & Components**: `/invite/accept?token=...` -> `AcceptInviteForm`.
- **API Contract**: `POST /api/v1/invitations/accept` -> Provisions membership and establishes session. Status: Frontend `Not Started`, Backend `Missing`.

### `TEAM-04`: Resend / Revoke Invitation

- **Scope**: Cancel pending invitation or generate a refreshed token with a renewed 7-day expiration.
- **Route & Components**: `/settings/team` -> `InviteActionsDropdown`.
- **API Contract**: `DELETE /api/v1/invitations/:id` & `POST /api/v1/invitations/:id/resend`. Status: Frontend `Not Started`, Backend `Missing`.

### `TEAM-05`: Update Member Role

- **Scope**: Change team member role with invariant preventing removal of the last remaining OWNER.
- **Route & Components**: `/settings/team` -> `RoleSelectDropdown`.
- **API Contract**: `PATCH /api/v1/organizations/:id/members/:userId` -> Rejects demoting last OWNER with HTTP 400. Status: Frontend `Not Started`, Backend `Missing`.

### `TEAM-06`: Remove Member / Leave Org

- **Scope**: Remove staff member from workspace or allow user to voluntarily depart.
- **Route & Components**: `/settings/team` -> `RemoveMemberDialog`.
- **API Contract**: `DELETE /api/v1/organizations/:id/members/:userId` -> Purges active sessions in this org. Status: Frontend `Not Started`, Backend `Missing`.

### `TEAM-07`: Role-Based Access Enforcement

- **Scope**: Client-side UI affordance guards (`PermissionGate`, `useRole()`) backed by server RBAC.
- **Status**: Frontend `Partial` (types defined), Backend `Available` (`tenantContextMiddleware` tested).

---

## Module 6: Dashboard & Activity Summaries (`DASH`)

### `DASH-01`: Operational KPI Metrics

- **Scope**: Metric cards displaying Active Customers, Upcoming Bookings, Invoiced Volume, and System Health.
- **Route & Components**: `/dashboard` -> `MetricCardsGrid` -> 4x `MetricCard`.
- **API Contract**: `GET /api/v1/dashboard/metrics` -> `200 { customersCount, upcomingBookingsCount, invoicedVolumeMonth, apiStatus }`. Status: Frontend `Partial / Mocked`, Backend `Missing`.

### `DASH-02`: Today's Schedule Overview

- **Scope**: Quick-glance list of today's scheduled appointments with status and assigned staff.
- **Route & Components**: `/dashboard` -> `TodayScheduleList`.
- **API Contract**: `GET /api/v1/appointments?date=today` -> EmptyState if zero bookings. Status: Frontend `Not Started`, Backend `Missing`.

### `DASH-03`: Operations Activity Feed

- **Scope**: Chronological audit queue showing recent customer signups, bookings, and payments.
- **Route & Components**: `/dashboard` -> `ActivityQueueList` -> `ActivityItem` (Icon, Title, Time, Deep Link).
- **API Contract**: `GET /api/v1/activity-feed`. Status: Frontend `Partial / Mocked`, Backend `Missing`.

### `DASH-04`: Multi-State UI Feedback

- **Scope**: Standardized rendering of Skeletons during data load, EmptyState prompts, and ErrorState alerts with retry.
- **Status**: Frontend `Implemented` (verified components in `src/components/feedback/*`), Backend `Available`.

---

## Module 7: Customer CRM Domain (`CRM`)

### `CRM-01`: Customer Directory Listing

- **Scope**: Paginated table with search debounce, status filter tabs (Active, Archived), and column sorting.
- **Route & Components**: `/customers` -> `CustomerTable`, `Pagination`, `Input[search]`.
- **API Contract**: `GET /api/v1/customers?page=1&limit=25&search=...` -> `200 { data: Customer[], meta: PaginationMeta }`. Status: Frontend `Not Started`, Backend `Missing`.

### `CRM-02`: Create Customer Record

- **Scope**: Modal form validating customer name, email, phone number, company, and physical address.
- **Route & Components**: `/customers` -> `CustomerCreateModal` (`Dialog`).
- **Validation**:
  ```ts
  export const customerSchema = z.object({
    name: z.string().min(2, "Name required").max(100),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().min(7, "Invalid phone").max(20),
    company: z.string().max(100).optional(),
    address: z.string().max(255).optional(),
  });
  ```
- **API Contract**: `POST /api/v1/customers` -> Closes modal, invalidates list, shows toast. Status: Frontend `Not Started`, Backend `Missing`.

### `CRM-03`: Customer Profile Detail View

- **Scope**: Profile layout with tabs for Overview, Appointments history, Invoices history, and Staff Notes.
- **Route & Components**: `/customers/[id]` -> `CustomerProfileLayout` with Radix `Tabs`.
- **API Contract**: `GET /api/v1/customers/:id` -> 404 state if ID not found. Status: Frontend `Not Started`, Backend `Missing`.

### `CRM-04`: Edit Customer Record

- **Scope**: In-place editing of customer contact details, notes, and status with dirty tracking.
- **Route & Components**: `/customers/[id]` -> `CustomerEditForm`.
- **API Contract**: `PATCH /api/v1/customers/:id`. Status: Frontend `Not Started`, Backend `Missing`.

### `CRM-05`: Customer Internal Operational Notes

- **Scope**: Private operational staff notes timeline regarding client preferences or history.
- **Route & Components**: `/customers/[id]` (Notes Tab) -> `NotesTimeline`, `NoteInput`.
- **API Contract**: `POST /api/v1/customers/:id/notes` -> Appends note with author avatar and timestamp. Status: Frontend `Not Started`, Backend `Missing`.

### `CRM-06`: Customer Tags & Segments (V1)

- **Scope**: Custom color-coded tags (VIP, Residential, Commercial) for filtering and sorting.
- **Route & Components**: `/customers` -> `TagBadge`, `TagSelect` (Multi-select dropdown).
- **API Contract**: `PATCH /api/v1/customers/:id/tags`. Status: Frontend `Not Started`, Backend `Missing`.

### `CRM-07`: Archive / Deactivate Customer (V1)

- **Scope**: Soft-delete customer preventing new bookings while preserving historical invoices and logs (`DEC-07`).
- **Route & Components**: `/customers/[id]` -> `ArchiveCustomerDialog`.
- **API Contract**: `DELETE /api/v1/customers/:id` -> Sets `status = 'ARCHIVED'`. Status: Frontend `Not Started`, Backend `Missing`.

---

## Module 8: Services, Pricing & Availability (`SERV`)

### `SERV-01`: Service Catalog Listing

- **Scope**: Directory of services offered with duration, pricing, description, assigned staff count, and status.
- **Route & Components**: `/services` -> `ServiceTable`, `Badge`.
- **API Contract**: `GET /api/v1/services` -> `200 { services: Service[] }`. Status: Frontend `Not Started`, Backend `Missing`.

### `SERV-02`: Create Service Item

- **Scope**: Modal specifying name, description, duration (15-480m), base price, and qualified staff members.
- **Route & Components**: `/services` -> `ServiceCreateModal` (`Dialog`).
- **Validation**:
  ```ts
  export const serviceSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    durationMinutes: z.number().int().min(15).max(480),
    price: z.number().min(0, "Price must be non-negative"),
    staffIds: z.array(z.string()).min(1, "Assign at least one staff member"),
  });
  ```
- **API Contract**: `POST /api/v1/services` -> Invalidates services list. Status: Frontend `Not Started`, Backend `Missing`.

### `SERV-03`: Edit / Update Service Item

- **Scope**: Modify service duration, description, and pricing without mutating past invoices.
- **Route & Components**: `/services` -> `ServiceEditModal`.
- **API Contract**: `PATCH /api/v1/services/:id`. Status: Frontend `Not Started`, Backend `Missing`.

### `SERV-04`: Archive Service

- **Scope**: Mark service inactive to prevent new appointments while preserving past records (`DEC-07`).
- **Route & Components**: `/services` -> `ArchiveServiceDialog`.
- **API Contract**: `DELETE /api/v1/services/:id` -> Sets `status = 'ARCHIVED'`. Status: Frontend `Not Started`, Backend `Missing`.

### `SERV-05`: Staff Assignment to Services

- **Scope**: Map which team members are qualified to deliver specific services.
- **Route & Components**: `/services` -> `StaffAssignmentSelect`.
- **API Contract**: `PUT /api/v1/services/:id/staff` -> `{ staffIds: string[] }`. Status: Frontend `Not Started`, Backend `Missing`.

### `SERV-06`: Staff Weekly Operating Shifts

- **Scope**: Configure weekly available working windows per staff member (Mon-Sun time ranges with enable toggles).
- **Route & Components**: `/services/staff` -> `ShiftScheduleGrid`.
- **API Contract**: `PUT /api/v1/staff/:id/availability` -> Validates start time precedes end time. Status: Frontend `Not Started`, Backend `Missing`.

### `SERV-07`: Blocked Time & Holidays

- **Scope**: Block calendar slots for vacation, team meetings, or public holidays.
- **Route & Components**: `/services/staff` -> `BlockedTimeModal`.
- **API Contract**: `POST /api/v1/staff/:id/blocked-time` -> Conflicts reject overlapping appointments. Status: Frontend `Not Started`, Backend `Missing`.

---

## Module 9: Appointments & Calendar Scheduling (`SCHED`)

### `SCHED-01`: Interactive Calendar Views

- **Scope**: Day, week, and month visual calendar views showing scheduled appointment blocks with status colors.
- **Route & Components**: `/calendar` -> `CalendarView`, `CalendarToolbar`, `CalendarGrid`.
- **URL State**: `?view=week&date=2026-10-15&staffId=all`.
- **API Contract**: `GET /api/v1/appointments?startDate=...&endDate=...`. Status: Frontend `Not Started`, Backend `Missing`.

### `SCHED-02`: Book Appointment Wizard with Conflict Detection

- **Scope**: 4-step wizard (Customer -> Service -> Staff -> Time slot) with overlap collision check.
- **Route & Components**: `/calendar` -> `BookingWizardModal` (`Dialog`).
- **Conflict Policy (`DEC-06`)**:
  - Regular `MEMBER`: Double-booking is strictly blocked with error.
  - `OWNER` / `ADMIN`: Prompts with warning dialog and allows "Override & Book".
- **API Contract**: `POST /api/v1/appointments/check-conflict` & `POST /api/v1/appointments`. Status: Frontend `Not Started`, Backend `Missing`.

### `SCHED-03`: Appointment Detail Modal

- **Scope**: Inspect appointment details (customer, phone, service, price, duration, status, notes).
- **Route & Components**: `/calendar` -> `AppointmentDetailModal`.
- **Actions**: Status transition, Reschedule, Cancel, Convert to Invoice (`INV-06`). Status: Frontend `Not Started`, Backend `Missing`.

### `SCHED-04`: Reschedule Appointment

- **Scope**: Shift appointment time or reassign staff member with atomic double-booking check.
- **Route & Components**: `/calendar` -> `RescheduleModal`.
- **API Contract**: `PATCH /api/v1/appointments/:id/reschedule` -> Updates calendar and records audit log. Status: Frontend `Not Started`, Backend `Missing`.

### `SCHED-05`: Cancel Appointment

- **Scope**: Mark appointment cancelled with mandatory cancellation reason audit logging.
- **Route & Components**: `/calendar` -> `CancelAppointmentDialog`.
- **API Contract**: `PATCH /api/v1/appointments/:id/cancel` -> Requires `{ reason: string }` (min 5 chars). Frees calendar slot. Status: Frontend `Not Started`, Backend `Missing`.

### `SCHED-06`: Appointment Status Lifecycle State Machine

- **Scope**: Enforce valid status transitions: `SCHEDULED` -> `CONFIRMED` -> `IN_PROGRESS` -> `COMPLETED` -> `NO_SHOW`.
- **Route & Components**: `/calendar` -> `StatusBadge`, `ActionMenu`.
- **API Contract**: `PATCH /api/v1/appointments/:id/status`. Completing enables 1-click invoice generation. Status: Frontend `Not Started`, Backend `Missing`.

### `SCHED-07`: Public Online Booking Widget (V1)

- **Scope**: Shareable client-facing booking page where end-customers select a service and slot without login (`DEC-02`).
- **Route & Components**: `/book/[orgSlug]` -> `PublicBookingWizard`.
- **Security**: Rate limited to 5 bookings/min per IP to prevent bot spam.
- **API Contract**: `POST /api/v1/public/bookings`. Status: Frontend `Not Started`, Backend `Missing`.

### `SCHED-08`: Recurring Appointments Engine (V1)

- **Scope**: Weekly, bi-weekly, or monthly repeat bookings for ongoing service retainers.
- **Route & Components**: `/calendar` -> `RecurrenceRuleSelect`.
- **API Contract**: `POST /api/v1/appointments/recurring` -> Batch collision check generates linked series. Status: Frontend `Not Started`, Backend `Missing`.

---

## Module 10: Invoices & Payment Tracking (`INV`)

### `INV-01`: Invoice Directory Listing

- **Scope**: Filterable table with status badges (`DRAFT`, `ISSUED`, `PAID`, `OVERDUE`, `VOID`) and search.
- **Route & Components**: `/invoices` -> `InvoiceTable`, `StatusBadge`, `Tabs`.
- **API Contract**: `GET /api/v1/invoices?page=1&limit=25&status=...`. Status: Frontend `Not Started`, Backend `Missing`.

### `INV-02`: Line-Item Invoice Builder

- **Scope**: Dynamic line items (description, qty, rate), automatic subtotal, tax %, discount, and terms.
- **Route & Components**: `/invoices/new` -> `InvoiceBuilder`, `LineItemsEditor`.
- **Validation**: Financial math precision (2 decimals). Due date on or after issue date.
- **API Contract**: `POST /api/v1/invoices`. Status: Frontend `Not Started`, Backend `Missing`.

### `INV-03`: Invoice PDF / Print Preview

- **Scope**: Professional invoice document preview with CSS `@media print` layout (`DEC-03`).
- **Route & Components**: `/invoices/[id]` -> `InvoicePreview`.
- **Behavior**: Native browser "Print / Save PDF" renders 8.5x11 / A4 document, hiding dashboard chrome. Status: Frontend `Not Started`, Backend `Missing`.

### `INV-04`: Issue & Finalize Invoice

- **Scope**: Transition from DRAFT to ISSUED, generating immutable sequential number (`INV-2026-0001`) and locking items.
- **Route & Components**: `/invoices/[id]` -> `IssueInvoiceDialog`.
- **API Contract**: `POST /api/v1/invoices/:id/issue`. Status: Frontend `Not Started`, Backend `Missing`.

### `INV-05`: Record Manual Payment

- **Scope**: Log payment receipt (Amount, Method: Cash/Bank/Card, Reference, Paid Date).
- **Route & Components**: `/invoices/[id]` -> `RecordPaymentModal` (`Dialog`).
- **API Contract**: `POST /api/v1/invoices/:id/payments` -> Reduces balance due; status becomes `PAID` when balance is zero. Status: Frontend `Not Started`, Backend `Missing`.

### `INV-06`: 1-Click Convert from Booking

- **Scope**: Pre-populate invoice builder from completed appointment details (`SCHED-06`).
- **Route & Components**: `/calendar` (Detail Modal) -> `ConvertInvoiceButton`.
- **API Contract**: `POST /api/v1/invoices/from-appointment/:id`. Status: Frontend `Not Started`, Backend `Missing`.

### `INV-07`: Void / Cancel Invoice

- **Scope**: Void issued invoice with audit explanation, reversing account receivables (`DEC-07`).
- **Route & Components**: `/invoices/[id]` -> `VoidInvoiceDialog`.
- **API Contract**: `POST /api/v1/invoices/:id/void` -> Status transitions to `VOID`. Locked from payments. Status: Frontend `Not Started`, Backend `Missing`.

### `INV-08`: Send Invoice via Email (V1)

- **Scope**: Dispatch invoice PDF and payment link directly to customer email.
- **Route & Components**: `/invoices/[id]` -> `SendInvoiceEmailModal`.
- **Prerequisites**: Email service (`DEC-01`). Status: Frontend `Not Started`, Backend `Missing`.

---

## Module 11: Notifications & Communication (`NOTIF`)

### `NOTIF-01`: In-App Notification Center

- **Scope**: Header bell icon with unread count badge and drawer showing recent alerts.
- **Route & Components**: Topbar `NotificationBell` -> `NotificationDrawer` (`Dialog`).
- **API Contract**: `GET /api/v1/notifications`. Status: Frontend `Partial / Mocked` (icon only), Backend `Missing`.

### `NOTIF-02`: Transactional System Emails

- **Scope**: Automated email dispatch for team invites, password resets, and appointment confirmations.
- **Prerequisites**: Resend / SES email service (`DEC-01`). Status: N/A (Backend) / `Missing`.

### `NOTIF-03`: 24-Hour Booking Reminder (V1)

- **Scope**: Automated email reminder dispatched to customers 24 hours prior to scheduled appointment.
- **Prerequisites**: Scheduled background cron / queue worker. Status: N/A (Backend) / `Missing`.

### `NOTIF-04`: SMS Appointment Alerts (Future)

- **Scope**: SMS confirmations and reminder alerts sent via Twilio (`DEC-08`).
- **Status**: Deferred to Future phase. Frontend `Not Started`, Backend `Missing`.

---

## Module 12: Reporting & Analytics (`ANLYT`)

### `ANLYT-01`: Revenue & Cash Flow Summary

- **Scope**: Total revenue collected, pending receivables, and overdue aging breakdown over time.
- **Route & Components**: `/reports` -> `CashFlowChart`, `SummaryCards`.
- **Role Gate**: Restricted to `OWNER`, `ADMIN`, `BILLING`.
- **API Contract**: `GET /api/v1/reports/revenue?from=...&to=...`. Status: Frontend `Not Started`, Backend `Missing`.

### `ANLYT-02`: Staff Utilization & Booking Volume (V1)

- **Scope**: Booking counts per staff member, completion rates, and average appointment duration.
- **Route & Components**: `/reports` -> `UtilizationBarChart`, `Table`.
- **API Contract**: `GET /api/v1/reports/utilization`. Status: Frontend `Not Started`, Backend `Missing`.

### `ANLYT-03`: Customer Retention & Top Clients (V1)

- **Scope**: Customer acquisition rates, repeat booking frequency, and highest revenue accounts.
- **Route & Components**: `/reports` -> `RetentionMetricsCard`, `Table`.
- **API Contract**: `GET /api/v1/reports/customers`. Status: Frontend `Not Started`, Backend `Missing`.

### `ANLYT-04`: CSV Data Export (V1)

- **Scope**: Export invoices, customers, and appointments to CSV for external accounting tools.
- **Route & Components**: `/reports` -> `ExportButton` (Dropdown: Invoices, Clients, Bookings).
- **API Contract**: `GET /api/v1/reports/export?type=invoices&format=csv`. Status: Frontend `Not Started`, Backend `Missing`.

---

## Module 13: FlowPilot SaaS Platform Billing (`BILL`)

### `BILL-01`: Plan Overview & Feature Matrix

- **Scope**: Display workspace tier (Starter, Pro, Agency) and included quotas with trial countdown.
- **Route & Components**: `/settings/billing` -> `PricingPlanCards`.
- **Permissions**: `OWNER` only. Non-owners receive 403 Forbidden card.
- **API Contract**: `GET /api/v1/billing/plan`. Status: Frontend `Not Started`, Backend `Missing`.

### `BILL-02`: Usage Limit Enforcement

- **Scope**: Guard rails preventing exceeding seat count, monthly appointments, or client limits.
- **Route & Components**: Global banner `UsageLimitBanner`.
- **API Contract**: `GET /api/v1/billing/usage`. Status: Frontend `Not Started`, Backend `Missing`.

### `BILL-03`: Stripe Customer Portal Link (V1)

- **Scope**: Redirect to Stripe-hosted portal for updating payment method, changing plan, or downloading receipts.
- **Route & Components**: `/settings/billing` -> `StripePortalButton`.
- **API Contract**: `POST /api/v1/billing/portal-session` -> Returns Stripe URL. Status: Frontend `Not Started`, Backend `Missing`.

### `BILL-04`: Grace Period & Read-Only Downgrade (V1)

- **Scope**: Enforce read-only state when subscription payment fails after grace period.
- **Route & Components**: Global banner `GracePeriodWarningBanner`. Mutations return HTTP 402. Status: Frontend `Not Started`, Backend `Missing`.

---

## Module 14: Platform Administration & Tenant Ops (`ADMIN`)

### `ADMIN-01`: Cross-Tenant Operational Health

- **Scope**: Real-time health indicator reporting database pool status, cache status, and uptime.
- **Route & Components**: Footer `HealthIndicator` (`Badge`, `Tooltip`).
- **API Contract**: `GET /api/v1/health/ready` -> Returns 200 (healthy) or 503 (database disconnected). Status: N/A (Backend) / `Available`.

### `ADMIN-02`: Security Audit Event Logging

- **Scope**: Append-only log recording authentication events, role modifications, and tenant access breaches.
- **Prerequisites**: Structured Pino logger active in backend. Database audit table in Milestone 3. Status: N/A (Backend) / `Partial`.

### `ADMIN-03`: Platform Tenant Management (V1)

- **Scope**: Admin console to inspect organization status, manual suspension, or quota overrides.
- **Route & Components**: `/admin/tenants` -> `TenantManagementTable`.
- **Permissions**: Restricted strictly to platform superadmins. Status: Frontend `Not Started`, Backend `Missing`.

---

## Module 15: Future Expansion Modules (`EXP`)

### `EXP-01`: Client Self-Service Portal (Future)

- **Scope**: Dedicated portal allowing end-customers to view past invoices, bookings, and receipts via magic link.
- **Route & Components**: `/portal` -> `ClientPortalShell`. Status: Frontend `Not Started`, Backend `Missing`.

### `EXP-02`: Projects & Task Tracking Boards (Future)

- **Scope**: Lightweight Kanban board for managing service project delivery milestones and checklists.
- **Route & Components**: `/projects` -> `KanbanBoard`, `TaskCard`. Status: Frontend `Not Started`, Backend `Missing`.

### `EXP-03`: Cloud Document & File Attachments (Future)

- **Scope**: Upload photos, PDF briefs, and contracts attached to customers and appointments.
- **Route & Components**: `/documents` -> `FileDropzone`, `FileList`. Status: Frontend `Not Started`, Backend `Missing`.

### `EXP-04`: Online Invoice Payment via Stripe Connect (V1)

- **Scope**: Allow end-clients to pay business invoices online via credit card or Apple Pay.
- **Route & Components**: `/invoices/[id]/pay` -> `StripeElementsCheckout`. Status: Frontend `Not Started`, Backend `Missing`.

### `EXP-05`: External 2-Way Calendar Sync (V1)

- **Scope**: Synchronize staff appointments with Google Calendar and Microsoft Outlook via iCal/OAuth.
- **Route & Components**: `/settings/calendar` -> `GoogleCalendarConnect`. Status: Frontend `Not Started`, Backend `Missing`.

### `EXP-06`: Webhook & Zapier Automation (Future)

- **Scope**: Webhook emission on events (`booking.created`, `invoice.paid`) for Zapier / Make integration.
- **Route & Components**: `/settings/webhooks` -> `WebhookForm`, `LogViewer`. Status: Frontend `Not Started`, Backend `Missing`.
