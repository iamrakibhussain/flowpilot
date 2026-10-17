# FlowPilot — Open Decisions & Architectural Trade-Off Log

> **Document Version**: 1.0.0  
> **Status**: Awaiting Product Owner & Stakeholder Review  
> **Purpose**: Formalize key architectural, product, and operational decisions requiring stakeholder sign-off before implementation

---

## 1. Decision Log Summary

| Decision ID  | Area                   | Title                                                  | Status | Recommended Option                                                                   |
| :----------- | :--------------------- | :----------------------------------------------------- | :----- | :----------------------------------------------------------------------------------- |
| **`DEC-01`** | Operations             | Transactional Email Service Provider                   | Open   | **Option A: Resend** (Developer-friendly, modern React email support)                |
| **`DEC-02`** | Product Scope          | Public Online Booking Widget Release Phase             | Open   | **Option B: Defer to V1** (Focus MVP exclusively on internal team operations)        |
| **`DEC-03`** | Technical Architecture | Invoice PDF Generation Mechanism                       | Open   | **Option A: CSS `@media print` + Client PDF** (Lightweight, zero server load)        |
| **`DEC-04`** | Frontend UX / Routing  | Multi-Tenant Workspace Routing Model                   | Open   | **Option A: Header-Driven (`X-Organization-Id`) with Client Context**                |
| **`DEC-05`** | Business Model         | FlowPilot SaaS Subscription Monetization Gating        | Open   | **Option B: 14-Day Free Trial without Credit Card** (Maximizes onboarding)           |
| **`DEC-06`** | Business Logic         | Calendar Double-Booking & Conflict Policy              | Open   | **Option B: Strict Block for Staff, Warning Override for Owner/Admin**               |
| **`DEC-07`** | Data Governance        | Record Deletion Policy (Customers, Services, Invoices) | Open   | **Option A: Strict Soft-Delete for Customers/Services; Immutable Void for Invoices** |
| **`DEC-08`** | Communications         | SMS Alerts & Reminders Scope                           | Open   | **Option B: Exclude SMS from MVP and V1; Implement Email Reminders Only**            |

---

## 2. Itemized Decision Analyses

### `DEC-01`: Transactional Email Service Provider

- **Context**: Team invitations (`TEAM-02`), password resets (`AUTH-05`), and invoice dispatches (`INV-08`) require reliable transactional email delivery.
- **Options Evaluated**:
  - **Option A (Recommended): Resend**: Modern API, first-class React Email component integration, fast setup, free tier covering 3,000 emails/month.
  - **Option B: AWS Simple Email Service (SES)**: Lowest cost per email ($0.10/10,000 emails), but requires AWS account setup, production sandbox escape, and complex IAM configurations.
  - **Option C: Postmark**: Exceptional deliverability and customer support, but higher starting cost ($15/month).
- **Recommendation**: Adopt **Resend** for development velocity and React template reusability. Encapsulate behind an `EmailService` interface to permit swapping to SES if volume scales dramatically.
- **Impact if Deferred**: Team invitation URLs must be manually copied by workspace admins during MVP testing.

---

### `DEC-02`: Public Online Booking Widget Release Phase

- **Context**: Several service businesses allow clients to self-book appointments online via a shareable public link (`flowpilot.app/book/acme-consulting`).
- **Options Evaluated**:
  - **Option A: Include in MVP**: Allows immediate customer acquisition testing, but introduces public unauthenticated endpoints, rate limiting vulnerabilities, bot booking spam, and public calendar rendering.
  - **Option B (Recommended): Defer to V1**: Deliver internal staff-managed scheduling first (`SCHED-01` to `SCHED-06`). Ensure the calendar, conflict logic, and customer CRM are rock-solid before exposing public booking surfaces.
- **Recommendation**: **Defer to V1**. The agreed MVP core loop is fully validated with internal bookings.
- **Impact if Deferred**: Service businesses must have staff manually create appointments from phone/email inquiries during MVP phase.

---

### `DEC-03`: Invoice PDF Generation Mechanism

- **Context**: Businesses must produce clean, branded PDF invoices for clients (`INV-03`).
- **Options Evaluated**:
  - **Option A (Recommended): CSS `@media print` + Browser Print**: Clean HTML/CSS layout optimized for print. Native browser "Print / Save as PDF" delivers instant, high-resolution output with zero server RAM usage or external dependencies.
  - **Option B: Client-Side `@react-pdf/renderer`**: Compiles PDF in the browser canvas. High design control, but increases client bundle size by ~400KB and requires a distinct styling syntax.
  - **Option C: Server-Side Headless Chromium (Puppeteer)**: Renders HTML to PDF on the server. Exact consistency, but incurs heavy memory footprint, slow generation times (1-3s), and server container bloat.
- **Recommendation**: **Option A for MVP**. Build clean, professional print stylesheets in Tailwind CSS. Evaluate Option B in V1 only if automated background email attachments are required.
- **Impact if Deferred**: None; print stylesheets can be implemented immediately.

---

### `DEC-04`: Multi-Tenant Workspace Routing Model

- **Context**: How should tenant context be represented in application routes when a user belongs to multiple organizations?
- **Options Evaluated**:
  - **Option A (Recommended): Header-Driven with In-Memory Client State (`X-Organization-Id`)**: Routes remain clean (`/dashboard`, `/customers`, `/appointments`). Active organization is stored in state/cookie and injected via `X-Organization-Id` on all API requests. Server verifies membership on every request.
  - **Option B: Path-Prefixed Routing (`/[orgSlug]/dashboard`, `/[orgSlug]/customers`)**: Tenant slug is explicitly visible in URL. Easy to bookmark, but creates route duplication, complex Next.js middleware rewrites, and potential slug collision / renaming complexities.
  - **Option C: Subdomain Routing (`acme.flowpilot.app/dashboard`)**: Traditional enterprise SaaS pattern, but requires wildcard DNS, multi-tenant SSL certificates, and complicates local development and cross-subdomain cookie handling.
- **Recommendation**: **Option A**. Matches the existing `flowpilot-backend` architecture, preserves clean URLs, simplifies Next.js App Router layout nesting, and enforces server-side membership verification.
- **Impact if Deferred**: Changing routing schemes post-implementation requires extensive layout refactoring.

---

### `DEC-05`: FlowPilot SaaS Subscription Monetization Gating

- **Context**: How should FlowPilot charge service businesses for access (`BILL` module)?
- **Options Evaluated**:
  - **Option A: Hard Paywall at Registration**: Requires credit card upfront before accessing workspace. Filters for high-intent users, but creates severe friction in user acquisition.
  - **Option B (Recommended): 14-Day Free Trial (No Credit Card Required)**: Unrestricted access to all MVP features for 14 days. Prompts for Stripe subscription checkout as trial expiration approaches.
  - **Option C: Freemium Tier**: Free forever with hard limits (e.g., max 1 staff member, max 20 appointments/month). Drives viral adoption, but increases infrastructure cost without guaranteed conversion.
- **Recommendation**: **Option B**. Maximizes trial onboarding velocity for pilot service businesses while testing willingness-to-pay.
- **Impact if Deferred**: Billing can remain in "development bypass mode" for MVP pilot users.

---

### `DEC-06`: Calendar Double-Booking & Conflict Policy

- **Context**: What should happen when a user attempts to schedule an appointment overlapping an existing booking for the same staff member (`SCHED-02`, `SCHED-04`)?
- **Options Evaluated**:
  - **Option A: Unconditional Hard Block**: System strictly rejects the booking with HTTP 409 Conflict. Zero chance of double-booking, but prevents legitimate simultaneous bookings (e.g. group workshops, emergency client squeeze-in).
  - **Option B (Recommended): Strict Block for `MEMBER` Role, Warning Override for `OWNER` / `ADMIN`**: Regular staff cannot double-book; administrators receive a prominent warning dialog with an explicit "Override and Book Anyway" action.
  - **Option C: Permissive Warning Only**: Alerts the user but allows any booking to proceed. Leads to inadvertent double-booking mistakes.
- **Recommendation**: **Option B**. Protects staff from accidental overlaps while granting agency owners operational flexibility.
- **Impact if Deferred**: Can default to Option A (strict block) in initial implementation.

---

### `DEC-07`: Record Deletion Policy (Customers, Services, Invoices)

- **Context**: What happens when a user clicks "Delete" on a Customer, Service, or Invoice that has historical connections?
- **Options Evaluated**:
  - **Option A (Recommended): Strict Soft-Delete with Cascade Protection**:
    - Customers and Services are marked `status = 'ARCHIVED'`. They disappear from active picker dropdowns but historical records retain their foreign keys.
    - Issued Invoices can **never** be deleted; they can only be transitioned to `VOID` with an explanation.
  - **Option B: Hard Delete with Orphan Cascade**: Deleting a customer deletes all associated appointments and invoices. Causes severe financial and audit discrepancies; unviable for real business operations.
- **Recommendation**: **Option A**. Non-negotiable for enterprise compliance and legal auditability.
- **Impact if Deferred**: None; soft-delete flag will be designed into Prisma schemas from day one.

---

### `DEC-08`: SMS Alerts & Reminders Scope

- **Context**: Service clients frequently respond well to SMS text reminders.
- **Options Evaluated**:
  - **Option A: Include SMS in MVP**: High perceived value, but requires carrier registration (10DLC in USA), regulatory compliance (opt-in/opt-out consent tracking), Twilio billing integration, and cost per message.
  - **Option B (Recommended): Exclude from MVP and V1; Support Email Reminders Only**: Delivers zero-cost, immediate notification capability without carrier compliance overhead.
- **Recommendation**: **Option B**. Revisit SMS in the Future phase once domestic market geography and compliance requirements are established.
- **Impact if Deferred**: Clients receive email reminders rather than SMS texts.
