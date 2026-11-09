# FlowPilot — Portfolio Demo Safeguards & Operational Limitations

This document outlines the security safeguards, isolation boundaries, and known operational limitations established for the public portfolio demonstration of FlowPilot.

---

## 1. Demo Environment Safeguards

To allow public demonstration to recruiters and technical evaluators without introducing financial, privacy, or infrastructure risks, FlowPilot incorporates strict safeguards:

| Dimension                 | Safeguard Implementation                                                                               | Production vs Demo Reality                                                                           |
| :------------------------ | :----------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| **Customer Data**         | Seeded with 100% fictional business entities (Acme Corp, Zenith Logistics, Elena Rostova).             | Zero real customer or personally identifiable information (PII).                                     |
| **Financial Processing**  | Stripe is configured strictly in **Test Mode** (`sk_test_...` / `pk_test_...`).                        | Real credit cards are never charged; test cards (`4242...`) only.                                    |
| **Transactional Email**   | `EMAIL_PROVIDER=console` is enforced in demo mode.                                                     | Outbound emails are printed to server stdout/Pino logs; no external mail relay or spam risks.        |
| **File Storage**          | Uploads are validated by MIME type (JPEG, PNG, WebP, PDF) and size-clamped (max 5 MB / 10 MB).         | Private files are protected by temporary 900-second signed URLs.                                     |
| **Authentication & RBAC** | Argon2id password hashing, signed session cookies, and strict RBAC remain active.                      | No security backdoors or bypasses; standard production-grade authentication is preserved.            |
| **Tenant Isolation**      | Server-side `X-Organization-Id` verification and PostgreSQL transactional advisory locks are enforced. | If a visitor registers a new workspace, their data is strictly isolated from any existing workspace. |

---

## 2. Render Free-Tier Operational Limitations

Deploying on the Render Free Web Service tier introduces specific architectural characteristics that technical interviewers should understand:

### 2.1 Instance Sleep & Cold Starts

- **Behavior:** The backend service spins down to zero instances after 15 minutes without inbound HTTP traffic.
- **Cold Start Impact:** The first request after a sleep cycle will experience a ~30 to 50 second latency while the container boots and binds to port 10000.
- **Recommendation for Evaluators:** A simple loading spinner or notification informs users that the free backend is waking up.

### 2.2 In-Process Background Schedulers

- **Behavior:** In FlowPilot, appointment reminders, recurring billing retainers, and token cleanups run on in-process `setInterval` timers in `src/server.ts`.
- **Limitation on Free Hosts:** When the container sleeps, timers do not tick. Upon wakeup, interval counters restart.
- **Safeguard:** In demo mode, `ENABLE_BACKGROUND_JOBS=false` is configured. This prevents sleep/wake timer anomalies from executing unexpected recurring billing cycles or dunning batches.
- **On-Demand Triggers:** Evaluators can manually test automated business logic through authenticated owner endpoints:
  - `POST /api/v1/notifications/trigger-reminders` (Dispatches reminders for due appointments & overdue invoices).
  - `POST /api/v1/recurring/process-now` (Processes due retainer schedules).

---

## 3. Supabase Free-Tier Backup Limitations & Reseeding

### 3.1 Backup Reality

- Supabase Free projects do not include Point-in-Time Recovery (PITR) or automated daily WAL archiving.
- Projects without dashboard activity for 7 consecutive days may be paused by Supabase.

### 3.2 Demo Reset & Reseeding Procedure

If public demo visitors create erratic test records or corrupt the demo organization, the owner can restore the pristine demo state in 60 seconds without data loss:

```bash
# 1. Open terminal in flowpilot-backend:
cd flowpilot-backend

# 2. Re-run idempotent seed script against the database:
npm run prisma -- seed
```

### 3.3 Manual Database Export (Snapshot)

The owner can take an offsite backup of the database at any time using standard PostgreSQL utilities:

```bash
pg_dump -h aws-0-[region].pooler.supabase.com -p 5432 -U postgres.[ref] -d postgres -F c -b -v -f "flowpilot_db_backup_$(date +%Y%m%d).dump"
```

---

## 4. Hosting Quota & Cost Disclaimer

While FlowPilot's demo architecture is designed to run within the free tiers of Vercel, Render, and Supabase, the following operational nuances must be verified on the respective provider dashboards:

- **No Guaranteed Perpetual $0:** Cloud providers update free-tier terms, bandwidth allowances, and idle policies periodically. The $0 claim represents an operational baseline under standard portfolio demo usage, not an unconditional guarantee.
- **Vercel Hobby Terms:** Vercel Hobby is restricted to non-commercial personal/portfolio projects. Commercial monetization requires an upgrade to Vercel Pro.
- **Render Inactivity Policy:** Render Free provides 750 free instance hours per month across free web services.
- **Supabase 7-Day Inactivity Pause:** Inactive free databases are paused after 7 days without queries or dashboard visits. The owner should unpause the project prior to scheduled interview presentations.
