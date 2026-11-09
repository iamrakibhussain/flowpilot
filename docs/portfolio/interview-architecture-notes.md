# FlowPilot — Senior Full-Stack Technical Interview Notes

These notes provide concise, authoritative talking points for the repository owner when discussing FlowPilot's architecture, engineering trade-offs, and design choices in technical interviews.

---

## 1. Why this stack? (Next.js 16 + Express + PostgreSQL + Prisma)

- **Decoupled Architecture:** Separating the Next.js frontend from the Express API engine enforces a strict contract boundary. The frontend focuses entirely on rendering, caching (TanStack Query), and user experience, while the backend functions as a standalone, framework-agnostic headless API service.
- **Why PostgreSQL + Prisma:** Service SaaS platforms depend heavily on relational data integrity (tenants -> organizations -> users -> appointments -> invoices -> payments). Foreign keys, unique constraints, and ACID transactions prevent orphaned records. Prisma provides end-to-end type safety between the database schema and TypeScript application layers.
- **Why Express over Next.js API Routes for Backend:** Real SaaS platforms require fine-grained lifecycle management: long-lived database connection pooling, in-process schedulers, graceful shutdown hooks (SIGTERM/SIGINT), and specialized security middleware (Helmet, CORS, IP rate limiting) that are awkward or costly in ephemeral serverless functions.

---

## 2. How does Multi-Tenant Isolation work?

- **Shared Database, Isolated Records:** FlowPilot employs a shared-schema multi-tenant model with tenant-keyed isolation (`organizationId`).
- **Zero Trust in Client Assertions:** While clients pass an `X-Organization-Id` header to indicate active workspace context, the server-side `tenantContextMiddleware` cross-references the authenticated `userId` against database `Membership` records on **every single request**.
- **Query Scoping:** Every Prisma read and mutation query explicitly binds `where: { organizationId }`. IDOR (Insecure Direct Object Reference) vulnerabilities are structurally eliminated because queries cannot resolve an entity unless both its ID and tenant ID match.

---

## 3. How is Concurrency & Data Integrity Handled?

### A. Last-OWNER Removal Concurrency (TOCTOU Defense)

- **The Problem:** In multi-tenant systems, if two admins concurrently attempt to delete or downgrade the last `OWNER` of an organization, standard checks suffer from Time-of-Check to Time-of-Use (TOCTOU) race conditions, leaving an orphaned workspace without an owner.
- **The Solution:** FlowPilot acquires a PostgreSQL transaction-level advisory lock (`pg_advisory_xact_lock(hashtext('org_membership_' || orgId))`). This serializes concurrent membership modifications within the transaction without locking the entire table or causing row deadlocks.

### B. Double-Booking Prevention

- **The Problem:** Two clients simultaneously booking the exact same specialist time slot.
- **The Solution:** The booking service evaluates overlapping appointment intervals and specialist shift windows inside an interactive database transaction client (`prisma.$transaction`). Concurrent overlapping inserts are rejected at the transaction boundary.

### C. Sequential Invoice Number Generation

- **The Problem:** Concurrent invoice creation causing duplicate invoice numbers or gaps in sequences.
- **The Solution:** Organization-scoped sequence allocation with automatic collision retry mechanics (`MAX_RETRIES = 3`). On any unique constraint violation (`P2002`), the transaction fetches a fresh sequence counter and retries cleanly.

---

## 4. How does Authentication & Session Security work?

- **Password Hashing:** Implemented with `@node-rs/argon2` using the memory-hard **Argon2id** algorithm. To prevent username enumeration via timing analysis, authentication attempts for non-existent emails execute a constant-time dummy Argon2id hash before returning HTTP 401.
- **Session Transport:** Sessions are tracked via 256-bit cryptographically random tokens stored in PostgreSQL. Session tokens are transmitted exclusively in `HttpOnly`, `SameSite=Lax` (or `SameSite=None; Secure` when cross-origin), signed cookies, preventing XSS-based credential theft.
- **Voluntary User Logout:** Users remain authenticated indefinitely until they voluntarily click "Log Out", respecting human workflow continuity.

---

## 5. How are File Uploads and Cloud Storage secured?

- **Dual-Bucket Strategy:**
  - `flowpilot-public`: Public logos and avatars (served directly via CDN).
  - `flowpilot-private`: Client invoices, contracts, and audit trails.
- **Access Control:** Private files can only be accessed through short-lived (900-second) cryptographic signed URLs generated on-demand by the backend after verifying tenant authorization.
- **Upload Validation:** Uploads are verified via strict MIME type allowlisting and file-size constraints (5 MB images, 10 MB documents). The Supabase service-role key is strictly isolated to backend server processes.

---

## 6. How is the Testing Suite structured?

FlowPilot maintains over 590 automated tests across three distinct testing tiers:

1. **Frontend Unit & Component Suites (Vitest 5.0.4):** 71 unit tests across 17 files testing UI components, form validation, error normalization, and query mutation hooks in a jsdom environment.
2. **Frontend Responsive Matrix (Playwright):** 160 automated viewport tests evaluating 8 device resolutions (320px to 1920px) to ensure zero horizontal layout overflow.
3. **Backend Unit & Live Integration Suites (Vitest 3.2.7):** 360 automated tests covering real PostgreSQL multi-tenant isolation, advisory locks, Argon2id security, rate limiting, and Stripe lifecycle webhooks.

---

## 7. What would change for Commercial Enterprise Production?

If scaling FlowPilot from a portfolio showcase to high-throughput commercial enterprise production, the following architectural upgrades would be implemented:

1. **Always-On Compute:** Transition backend from free-tier containers to autoscaled container clusters (AWS ECS Fargate or dedicated Kubernetes pods) with multi-AZ redundancy.
2. **Distributed Queue for Schedulers:** Decouple in-process `setInterval` schedulers into an external distributed job queue (e.g. BullMQ / Redis or AWS SQS + Lambda) with distributed locking.
3. **Database High Availability:** Upgrade Supabase to Pro/Enterprise with automated Point-in-Time Recovery (PITR), dedicated read replicas, and connection pooling.
4. **Custom Domain & CDN:** Bind canonical custom domain (`flowpilot.app`) with Cloudflare enterprise DDoS protection and edge caching.
