# FlowPilot — Recruiter & Hiring Manager Demo Walkthrough

**Target Audience:** Technical Recruiters, Engineering Managers, Solution Architects, Potential Clients  
**Demo Duration:** 5 to 7 Minutes  
**Live Demo URL:** `https://[your-app-name].vercel.app` _(Configured upon owner deployment)_  
**Showcase Access:**

- Sign in with your configured workspace owner credentials, or
- Register a fresh tenant via `/register` to test the full multi-tenant onboarding journey.

---

## Walkthrough Script & Key Highlights

### 1. Public Landing Page & Technology Stack (1 Minute)

- **What to show:** Visit the homepage (`/`). Observe the dynamic GPU-accelerated Aurora background, responsive navigation header, feature breakdown cards, pricing tiers, and interactive FAQ accordion.
- **Key Talking Point:** _"The frontend is built with Next.js 16 App Router and React 19, utilizing Tailwind CSS 4 and Radix UI primitives. It features a complete 8-viewport responsive matrix (320px to 1920px) with zero horizontal overflow."_

---

### 2. Authentication & Multi-Tenant Isolation (1 Minute)

- **What to show:** Click **"Sign In"** in the top navigation. Enter your credentials, or click **"Get Started"** to create a new organization.
- **What happens:** The server verifies credentials using **Argon2id** (with constant-time dummy verification to mitigate timing attacks) and sets an `HttpOnly`, `SameSite` signed session cookie.
- **Key Talking Point:** _"FlowPilot enforces server-side multi-tenancy. Every request transmits the active workspace ID (`X-Organization-Id`), which the backend strictly verifies against database membership tables. A user cannot access or tamper with data belonging to another tenant."_

---

### 3. Operations Dashboard & Business Metrics (1 Minute)

- **What to show:** Land on the main Dashboard (`/dashboard`). Point out the live revenue counter, active customer metrics, upcoming appointments, and sequential invoice history.
- **Key Talking Point:** _"Unlike static UI demos with hardcoded mock objects, every widget here queries real PostgreSQL records via TanStack Query and Prisma ORM, with optimistic cache invalidation on mutations."_

---

### 4. Appointment Booking & Staff Coordination (1 Minute)

- **What to show:** Navigate to **Appointments** and **Services** (`/services`). Click on a specialist (e.g. Sarah Lin or Marcus Vance).
- **Key Talking Point:** _"The scheduling engine includes concurrency hardening. It enforces specialist shift windows, buffer intervals between sessions, and database-level transaction locks that completely prevent accidental double-booking."_

---

### 5. Estimates, Invoices & Stripe Test Checkout (1.5 Minutes)

- **What to show:**
  1. Navigate to **Invoices** (`/invoices`). Notice the collision-free, strictly sequential invoice numbers (e.g., `INV-2026-001`).
  2. Select an invoice with status `PENDING` and click **"Pay Online"**.
  3. Observe the Stripe-hosted Checkout session in Test Mode.
- **Key Talking Point:** _"Invoice sequences are generated using atomic database sequence counters with retry mechanics under concurrent load. The payment engine integrates Stripe API version 2025-01-27 with signed webhook verification and idempotent replay protection."_

---

### 6. Cloud Storage & Client Self-Service Portal (1 Minute)

- **What to show:**
  1. Navigate to **Settings** (`/settings/organization`). View the branding section where public logos and avatars are served via Supabase Storage.
  2. Explain the Client Self-Service Portal (`/portal/flowpilot-global`), where external clients log in via magic links to review appointments and settle invoices without full SaaS accounts.
- **Key Talking Point:** _"Storage is abstracted through a provider interface supporting Supabase Storage and AWS S3. Public assets stream directly via CDN, while private documents (invoices, contracts) require temporary 15-minute signed URLs."_

---

### 7. Responsive Navigation & Log Out (30 Seconds)

- **What to show:** Resize the browser window to mobile view (375px). Notice the hamburger drawer, touch-friendly tables, and command palette (`Cmd+K` / `Ctrl+K`). Click **"Log Out"** to invalidate the server session.
- **Key Talking Point:** _"Voluntary user logout is strictly respected—users remain logged in indefinitely until they explicitly log out, avoiding frustrating mid-workflow session timeouts."_
