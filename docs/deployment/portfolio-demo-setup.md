# FlowPilot — Portfolio Demo Step-by-Step Setup Guide

This guide provides exact, step-by-step instructions for the repository owner to provision the free-tier infrastructure and deploy FlowPilot for public portfolio demonstration.

---

## Prerequisites (Owner Accounts Needed)

1. [GitHub](https://github.com) account with access to `iamrakibhussain/flowpilot` and `iamrakibhussain/flowpilot-backend`.
2. [Supabase](https://supabase.com) account (Free Tier).
3. [Render](https://render.com) account (Free Tier).
4. [Vercel](https://vercel.com) account (Hobby Tier).
5. [Stripe](https://stripe.com) account (Test Mode only).

---

## Step 1: Provision the Demo Supabase Project

> [!IMPORTANT]
> Never use the existing internal development database (`emahsbgbbujiedhlddhb`) for the public portfolio demo. Create a fresh, isolated project.

1. Log into your **Supabase Dashboard** (`https://supabase.com/dashboard`).
2. Click **"New Project"**.
3. Fill in the project details:
   - **Name:** `flowpilot-demo` (or similar)
   - **Database Password:** Generate a high-entropy password using a password manager and store it securely.
   - **Region:** Select a region close to your target audience (e.g., `us-east-1` or `eu-central-1`).
   - **Pricing Plan:** Free.
4. Wait 1–2 minutes for the database to provision.
5. In your Supabase Project Settings (`Settings -> Database`):
   - Under **Connection string -> Transaction pooler (Port 6543)**, copy the URL. This is your `DATABASE_URL`.
   - Under **Connection string -> Session mode / Direct (Port 5432)**, copy the URL. This is your `DIRECT_URL`.
6. In `Settings -> API`:
   - Copy the **Project URL** (`https://[ref].supabase.co`). This is your `SUPABASE_URL`.
   - Under **Project API keys**, reveal and copy the `service_role` secret key. This is your `SUPABASE_SERVICE_ROLE_KEY`.

---

## Step 2: Create Storage Buckets in Supabase

1. In your new Supabase project sidebar, navigate to **Storage**.
2. Click **"New Bucket"**:
   - **Name:** `flowpilot-public`
   - **Public bucket:** **Toggle ON** (Allows direct CDN image streaming).
   - Click **Save**.
3. Click **"New Bucket"** again:
   - **Name:** `flowpilot-private`
   - **Public bucket:** **Toggle OFF** (Requires signed URLs for access).
   - Click **Save**.

---

## Step 3: Run Database Migrations & Seed Demo Data

Run this step locally from your terminal before starting the remote web service.

1. Open your terminal in `flowpilot-backend`:
   ```bash
   cd flowpilot-backend
   ```
2. Set your temporary migration environment variables (substituting your actual password and project ref):
   ```bash
   # Windows PowerShell:
   $env:DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   $env:DIRECT_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres"
   ```
3. Run the Prisma migration deploy command:
   ```bash
   npx prisma migrate deploy
   ```
   _Expected output: All 4 migrations applied successfully with 0 errors._
4. Seed the clean portfolio demo data:
   ```bash
   # Set initial administrator password (optional, min 8 chars):
   $env:SEED_ADMIN_PASSWORD="your_secure_password"
   npm run prisma -- seed
   ```
   _Expected output: Demo workspace "FlowPilot Global Operations" provisioned with administrator "Alex Mercer" (`admin@flowpilot.internal`) along with realistic service catalogs, staff roster, appointments, and invoices._

---

## Step 4: Deploy the Backend to Render

1. Log into your **Render Dashboard** (`https://dashboard.render.com`).
2. Click **"New +"** -> **"Web Service"**.
3. Connect your GitHub repository: `iamrakibhussain/flowpilot-backend`.
4. Configure service settings:
   - **Name:** `flowpilot-backend` (will give `https://flowpilot-backend.onrender.com`)
   - **Region:** Match your Supabase region (e.g. Oregon or Ohio).
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm ci && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Click **"Advanced"** -> **"Add Environment Variable"** and enter:
   | Key                                 | Value                                                                                    | Notes                                 |
   | :---------------------------------- | :--------------------------------------------------------------------------------------- | :------------------------------------ |
   | `NODE_ENV`                          | `production`                                                                             | Strict production rules active        |
   | `PORT`                              | `10000`                                                                                  | Render standard port                  |
   | `HOST`                              | `0.0.0.0`                                                                                | Bind all network interfaces           |
   | `TRUST_PROXY`                       | `1`                                                                                      | Trust Render single-hop reverse proxy |
   | `DATABASE_URL`                      | `postgresql://postgres.[ref]:[pass]@...:6543/postgres?pgbouncer=true&connection_limit=1` | Supabase Pooler URL                   |
   | `DIRECT_URL`                        | `postgresql://postgres.[ref]:[pass]@...:5432/postgres`                                   | Supabase Direct URL                   |
   | `FRONTEND_URL`                      | `https://[your-app-name].vercel.app`                                                     | Updated after Vercel deploy           |
   | `CORS_ORIGIN`                       | `https://[your-app-name].vercel.app`                                                     | Updated after Vercel deploy           |
   | `COOKIE_SECRET`                     | _(Random 32+ char hex string)_                                                           | `openssl rand -hex 32`                |
   | `COOKIE_SAME_SITE`                  | `lax`                                                                                    | Use `lax` with Next.js rewrites       |
   | `SESSION_EXPIRY_DAYS`               | `7`                                                                                      | 7-day session validity                |
   | `EMAIL_PROVIDER`                    | `console`                                                                                | Safe for demo (no real spam emails)   |
   | `STORAGE_PROVIDER`                  | `supabase`                                                                               | Native cloud storage                  |
   | `SUPABASE_URL`                      | `https://[ref].supabase.co`                                                              | Project URL                           |
   | `SUPABASE_SERVICE_ROLE_KEY`         | _(Your Supabase service_role key)_                                                       | Never exposed client-side             |
   | `STORAGE_BUCKET_PUBLIC`             | `flowpilot-public`                                                                       | Public assets bucket                  |
   | `STORAGE_BUCKET_PRIVATE`            | `flowpilot-private`                                                                      | Private files bucket                  |
   | `STORAGE_SIGNED_URL_EXPIRY_SECONDS` | `900`                                                                                    | 15-minute token TTL                   |
   | `STORAGE_SIGNING_SECRET`            | _(Random 32+ char hex string)_                                                           | `openssl rand -hex 32`                |
   | `ENABLE_BACKGROUND_JOBS`            | `false`                                                                                  | Prevents sleep/wake cron races        |
6. In **Health Check Path**, enter: `/api/v1/health`.
7. Click **"Create Web Service"**.
8. Wait ~3–4 minutes for build and deployment. Once live, test the health check in your browser:
   `https://[your-backend-name].onrender.com/api/v1/health`
   _Expected response: `{"success":true,"data":{"status":"ok",...}}`_

---

## Step 5: Deploy the Frontend to Vercel

1. Log into your **Vercel Dashboard** (`https://vercel.com`).
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository: `iamrakibhussain/flowpilot`.
4. Configure project:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** Next.js default (`.next`)
5. Under **Environment Variables**, enter:
   | Key                                  | Value                                                   |
   | :----------------------------------- | :------------------------------------------------------ |
   | `NEXT_PUBLIC_APP_ENV`                | `production`                                            |
   | `NEXT_PUBLIC_APP_URL`                | `https://[your-project-name].vercel.app`                |
   | `NEXT_PUBLIC_API_BASE_URL`           | `https://[your-project-name].vercel.app/api/v1`         |
   | `BACKEND_API_URL`                    | `https://[your-backend-name].onrender.com/api/v1`       |
   | `NEXT_PUBLIC_API_TIMEOUT_MS`         | `15000`                                                 |
   | `NEXT_PUBLIC_ENABLE_MOCKS`           | `false`                                                 |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` _(Optional: Stripe Test Publishable Key)_ |
6. Click **"Deploy"**.
7. Wait ~2 minutes for the Next.js production build to complete.
8. Once deployed, note your Vercel URL (e.g., `https://flowpilot-demo.vercel.app`).

---

## Step 6: Final URL Sync & Smoke Verification

1. Go back to your **Render Dashboard** -> `flowpilot-backend` -> **Environment Variables**.
2. Update `FRONTEND_URL` and `CORS_ORIGIN` with your exact live Vercel URL:
   - `FRONTEND_URL = https://flowpilot-demo.vercel.app`
   - `CORS_ORIGIN = https://flowpilot-demo.vercel.app`
3. Click **"Save Changes"** (Render will trigger a fast 30s zero-downtime redeploy).
4. Perform the end-to-end smoke test in your browser:
   - Visit `https://flowpilot-demo.vercel.app`.
   - Click **"Sign In"** and log in with your administrator account, or click **"Get Started"** (`/register`) to provision a fresh test tenant.
   - Verify that the Dashboard loads with clean metrics, navigation, and settings.
   - Test navigating to Services, Staff, Invoices, and Organization Settings.
   - Click **"Log Out"** and confirm clean session termination.
