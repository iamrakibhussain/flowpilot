# FlowPilot — Environment Variables Reference Matrix

This document provides a single, authoritative reference for all environment variables used across both repositories (`flowpilot` and `flowpilot-backend`).

---

## 1. Classification Definitions

- **PUBLIC (Frontend Client):** Injected into client-side JavaScript bundles via `NEXT_PUBLIC_*` prefixes. Never place secret keys or database credentials in these variables.
- **SECRET (Backend Server):** Cryptographic keys, API tokens, and credentials. Strictly confined to server processes and never committed to version control.
- **OPERATIONAL (Config):** Non-secret system settings governing ports, timeouts, log levels, and provider selections.

---

## 2. Frontend Variables (`flowpilot`)

Configured in Vercel Project Settings (`Settings -> Environment Variables`) or `.env.local` for local development.

| Variable Name                        | Purpose                                                           | Required | Default / Example Placeholder                   | Classification |
| :----------------------------------- | :---------------------------------------------------------------- | :------- | :---------------------------------------------- | :------------- |
| `NEXT_PUBLIC_APP_ENV`                | Application environment lifecycle mode                            | **Yes**  | `production` (or `development`)                 | OPERATIONAL    |
| `NEXT_PUBLIC_APP_URL`                | Canonical frontend origin URL                                     | **Yes**  | `https://flowpilot-demo.vercel.app`             | PUBLIC         |
| `NEXT_PUBLIC_API_BASE_URL`           | REST API base URL called by frontend client                       | **Yes**  | `https://flowpilot-demo.vercel.app/api/v1`      | PUBLIC         |
| `BACKEND_API_URL`                    | Upstream backend origin for Next.js rewrites                      | Optional | `https://flowpilot-backend.onrender.com/api/v1` | OPERATIONAL    |
| `NEXT_PUBLIC_API_TIMEOUT_MS`         | Client HTTP request timeout in milliseconds                       | Optional | `15000`                                         | PUBLIC         |
| `NEXT_PUBLIC_ENABLE_MOCKS`           | Enables isolated mock data provider (must be false in production) | Optional | `false`                                         | OPERATIONAL    |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for Test Mode checkout                     | Optional | `pk_test_...`                                   | PUBLIC         |

---

## 3. Backend Variables (`flowpilot-backend`)

Configured in Render Service Environment or `.env` for local development.

### 3.1 Server & Network

| Variable Name  | Purpose                                            | Required | Default / Example Placeholder       | Classification |
| :------------- | :------------------------------------------------- | :------- | :---------------------------------- | :------------- |
| `NODE_ENV`     | Runtime mode (`development`, `test`, `production`) | **Yes**  | `production`                        | OPERATIONAL    |
| `PORT`         | HTTP port on which Express server listens          | **Yes**  | `10000` (Render default)            | OPERATIONAL    |
| `HOST`         | Interface IP binding address                       | **Yes**  | `0.0.0.0`                           | OPERATIONAL    |
| `TRUST_PROXY`  | Express reverse proxy hop trust level              | **Yes**  | `1` (on Render / ALB)               | OPERATIONAL    |
| `LOG_LEVEL`    | Pino logger severity threshold                     | Optional | `info`                              | OPERATIONAL    |
| `CORS_ORIGIN`  | Comma-separated list of allowed origins            | **Yes**  | `https://flowpilot-demo.vercel.app` | OPERATIONAL    |
| `FRONTEND_URL` | Frontend canonical URL for links                   | **Yes**  | `https://flowpilot-demo.vercel.app` | OPERATIONAL    |

### 3.2 Database & Connection Pooling

| Variable Name  | Purpose                                                        | Required | Default / Example Placeholder                                                            | Classification |
| :------------- | :------------------------------------------------------------- | :------- | :--------------------------------------------------------------------------------------- | :------------- |
| `DATABASE_URL` | Pooled PostgreSQL connection string (PgBouncer port 6543)      | **Yes**  | `postgresql://postgres.[ref]:[pass]@...:6543/postgres?pgbouncer=true&connection_limit=1` | SECRET         |
| `DIRECT_URL`   | Direct PostgreSQL connection string (port 5432 for migrations) | **Yes**  | `postgresql://postgres.[ref]:[pass]@...:5432/postgres`                                   | SECRET         |

### 3.3 Security & Authentication

| Variable Name             | Purpose                                             | Required | Default / Example Placeholder             | Classification |
| :------------------------ | :-------------------------------------------------- | :------- | :---------------------------------------- | :------------- |
| `COOKIE_SECRET`           | 32+ char secret for HMAC signing of session cookies | **Yes**  | `replace_with_32_char_random_hex`         | SECRET         |
| `COOKIE_SAME_SITE`        | Cookie SameSite attribute (`strict`, `lax`, `none`) | Optional | `lax` (or `none` for direct cross-origin) | OPERATIONAL    |
| `SESSION_EXPIRY_DAYS`     | User session lifetime in days                       | Optional | `7`                                       | OPERATIONAL    |
| `RATE_LIMIT_WINDOW_MS`    | Rate limiting sliding window in ms                  | Optional | `900000` (15 mins)                        | OPERATIONAL    |
| `RATE_LIMIT_MAX_REQUESTS` | Max general API requests per window per IP          | Optional | `100`                                     | OPERATIONAL    |

### 3.4 Storage (Supabase)

| Variable Name                       | Purpose                                            | Required | Default / Example Placeholder       | Classification |
| :---------------------------------- | :------------------------------------------------- | :------- | :---------------------------------- | :------------- |
| `STORAGE_PROVIDER`                  | Cloud storage provider selection                   | **Yes**  | `supabase`                          | OPERATIONAL    |
| `SUPABASE_URL`                      | Supabase project API gateway URL                   | **Yes**  | `https://[project-ref].supabase.co` | PUBLIC         |
| `SUPABASE_SERVICE_ROLE_KEY`         | High-privilege Supabase service role key           | **Yes**  | `eyJhbGciOi...`                     | SECRET         |
| `STORAGE_BUCKET_PUBLIC`             | Bucket name for public branding & avatar files     | Optional | `flowpilot-public`                  | OPERATIONAL    |
| `STORAGE_BUCKET_PRIVATE`            | Bucket name for private invoices & contracts       | Optional | `flowpilot-private`                 | OPERATIONAL    |
| `STORAGE_SIGNED_URL_EXPIRY_SECONDS` | Signed URL lifetime in seconds                     | Optional | `900` (15 minutes)                  | OPERATIONAL    |
| `STORAGE_SIGNING_SECRET`            | 32+ char secret for local storage fallback signing | Optional | `replace_with_32_char_random_hex`   | SECRET         |

### 3.5 Operational Safeties & Demo Controls

| Variable Name            | Purpose                                             | Required | Default / Example Placeholder        | Classification |
| :----------------------- | :-------------------------------------------------- | :------- | :----------------------------------- | :------------- |
| `EMAIL_PROVIDER`         | Active email transport provider                     | **Yes**  | `console` (safe for portfolio demo)  | OPERATIONAL    |
| `ENABLE_BACKGROUND_JOBS` | Enables/disables in-process `setInterval` cron jobs | Optional | `false` (recommended on Render Free) | OPERATIONAL    |
| `SEED_ADMIN_PASSWORD`    | Initial admin password for manual database seed     | Optional | _(min 8 chars, never hardcoded)_     | SECRET         |
| `STRIPE_SECRET_KEY`      | Stripe Test Secret Key (optional)                   | Optional | `sk_test_...`                        | SECRET         |
| `STRIPE_WEBHOOK_SECRET`  | Stripe Webhook Secret (optional)                    | Optional | `whsec_...`                          | SECRET         |

---

## 4. Secret Generation Quick Reference

To generate high-entropy secrets for `COOKIE_SECRET` and `STORAGE_SIGNING_SECRET`:

```bash
# Generate 64-character hex strings:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
