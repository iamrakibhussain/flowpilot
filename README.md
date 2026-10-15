# FlowPilot — Frontend Architecture & Foundation

> **Product Vision**: _"One workspace to run a service business."_  
> **Status**: **Phase 0 — Engineering Foundation & Architecture Baseline**  
> **Backend Service**: `flowpilot-backend` (Separate repository / Express REST API)

FlowPilot is a modern multi-tenant Business Operations SaaS engineered to unify CRM, appointment scheduling, staff coordination, invoicing, and payment reconciliation for service businesses, agencies, and consulting teams.

This repository (`flowpilot`) contains the standalone frontend application layer. It is architected for strict type safety, predictable multi-tenant boundaries, WCAG 2.2 AA accessibility, and modular design system scalability.

---

## 1. Current Project Status

- **Architecture Foundation**: Complete and validated.
- **Business Feature Implementation**: Strictly deferred to upcoming phases per architectural guidelines. No production business features (appointment booking, real invoices, live CRM records) have been created yet.
- **Integration Readiness**: The typed `ApiClient`, error normalizer, and TanStack Query client are configured to connect to `flowpilot-backend` over REST.

---

## 2. Technology Stack

| Layer                   | Technology            | Version         | Purpose                                                     |
| :---------------------- | :-------------------- | :-------------- | :---------------------------------------------------------- |
| **Framework**           | Next.js (App Router)  | `16.4.0`        | React Server Components, Turbopack, nested route groups     |
| **Runtime Library**     | React                 | `19.3.0`        | Declarative UI rendering, concurrent features               |
| **Type System**         | TypeScript            | `^5.0`          | Strict compilation (`strict: true`, no `any`)               |
| **Styling**             | Tailwind CSS          | `^4.0`          | Design tokens via `@theme` & CSS variables                  |
| **Headless Primitives** | Radix UI              | Latest          | Accessible Dialog, DropdownMenu, Tabs, and Slot primitives  |
| **Icons**               | Lucide React          | `^1.56.0`       | Modern, consistent iconography                              |
| **Form Handling**       | React Hook Form       | `^7.90.0`       | High-performance uncontrolled form state management         |
| **Validation**          | Zod                   | `^3.25.76`      | Runtime schema validation and type inference                |
| **Server State**        | TanStack Query        | `^5.104.2`      | Asynchronous server state caching, retry, and deduplication |
| **Unit Testing**        | Vitest                | `^5.0.4`        | Blazing fast ESM unit and component test runner             |
| **DOM Testing**         | React Testing Library | `^16.3.3`       | User-centric, accessible component assertion utilities      |
| **Browser Testing**     | Playwright            | `^1.64.0`       | Cross-browser end-to-end integration testing                |
| **Code Quality**        | ESLint & Prettier     | `^9.0` / `^3.9` | Flat config linting and Tailwind class formatting           |

---

## 3. Repository Structure

```
flowpilot/
├── .github/workflows/ci.yml       # GitHub Actions continuous integration pipeline
├── docs/                          # Architectural documentation & specifications
│   ├── FRONTEND-ARCHITECTURE.md   # System topology, RSC strategy, security
│   ├── DESIGN-SYSTEM.md           # Color tokens, typography, radii, component catalogue
│   ├── UI-UX-SPECIFICATION.md     # States matrix, forms, navigation, tables
│   ├── API-INTEGRATION.md         # Request envelopes, error mapping, query keys
│   ├── AUTHENTICATION-FRONTEND.md # Multi-tenant session model, cookie security
│   ├── ACCESSIBILITY.md           # WCAG 2.2 AA standards, keyboard navigation, focus
│   ├── TESTING-STRATEGY.md        # Testing pyramid, Vitest, Playwright conventions
│   ├── CODE-STANDARDS.md          # TypeScript rules, naming, import organization
│   ├── ARCHITECTURE-DECISIONS.md  # ADRs 001 through 008
│   └── IMPLEMENTATION-ROADMAP.md  # Progressive milestone plan (Phases 0 through 7)
├── public/                        # Static assets and icons
├── src/
│   ├── app/                       # Next.js App Router route groups
│   │   ├── (public)/              # Public routes & architecture verification overview
│   │   ├── (auth)/                # Authentication route group & validation shell
│   │   ├── (dashboard)/           # Multi-tenant workspace layout shell
│   │   ├── globals.css            # Tailwind v4 theme and semantic CSS variables
│   │   ├── layout.tsx             # Root layout with QueryProvider & skip-link
│   │   ├── loading.tsx            # Global loading fallback
│   │   ├── error.tsx              # Route error boundary
│   │   ├── not-found.tsx          # Accessible 404 page
│   │   └── global-error.tsx       # Root failure recovery boundary
│   ├── components/
│   │   ├── ui/                    # Design system primitives (Button, Input, Card, etc.)
│   │   ├── feedback/              # EmptyState, ErrorState, LoadingState
│   │   ├── layout/                # Container, PageHeader
│   │   └── providers/             # QueryProvider
│   ├── features/                  # Domain-specific types & future modules
│   │   ├── auth/                  # User, AuthSession, WorkspaceRole types
│   │   └── organizations/         # Organization & Member types
│   ├── lib/
│   │   ├── api/                   # ApiClient, error classes, query keys factory
│   │   ├── config/                # Validated environment configuration (env.ts)
│   │   └── utils/                 # cn class merging utility
│   └── types/                     # Shared cross-cutting frontend TypeScript contracts
├── tests/
│   ├── setup.ts                   # Vitest setup file
│   ├── unit/                      # Vitest unit test suites
│   └── e2e/                       # Playwright smoke test suites
├── .editorconfig                  # Universal formatting settings
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignore rules
├── .prettierrc.json               # Prettier configuration
├── eslint.config.mjs              # ESLint 9 flat configuration
├── next.config.ts                 # Next.js 16 configuration with Turbopack
├── package.json                   # Project manifest & npm scripts
├── tsconfig.json                  # Strict TypeScript compiler options
└── vitest.config.mts              # Vitest test configuration
```

---

## 4. Prerequisites

- **Node.js**: `v24.x` (or `v20.x` LTS minimum)
- **Package Manager**: `npm` `v11.x` (or compatible)

---

## 5. Getting Started & Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url> flowpilot
   cd flowpilot
   ```

2. **Configure environment variables**:

   ```bash
   cp .env.example .env.local
   ```

   Inspect `.env.local` and adjust `NEXT_PUBLIC_API_BASE_URL` if your local backend runs on a different port.

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the Architecture Overview and Verification page.

---

## 6. Development & Quality Commands

| Command                   | Action                                                                               |
| :------------------------ | :----------------------------------------------------------------------------------- |
| `npm run dev`             | Starts local Next.js development server with Turbopack                               |
| `npm run build`           | Builds optimized production bundle                                                   |
| `npm run start`           | Starts production server                                                             |
| `npm run type-check`      | Runs strict TypeScript compiler check (`tsc --noEmit`)                               |
| `npm run lint`            | Runs ESLint 9 across all files                                                       |
| `npm run lint:fix`        | Runs ESLint and automatically fixes fixable issues                                   |
| `npm run format`          | Formats all files using Prettier and Tailwind plugin                                 |
| `npm run format:check`    | Verifies code formatting conformance without modifying files                         |
| `npm run test:unit`       | Executes all Vitest unit and component tests                                         |
| `npm run test:unit:watch` | Starts Vitest in interactive watch mode                                              |
| `npm run test:e2e`        | Runs Playwright end-to-end browser test suite                                        |
| `npm run validate`        | Runs full pre-commit pipeline (`type-check` + `lint` + `format:check` + `test:unit`) |

---

## 7. Documentation Index

Detailed architectural specifications are located in `/docs/`:

1. [FRONTEND-ARCHITECTURE.md](docs/FRONTEND-ARCHITECTURE.md) — System topology, RSC strategy, security.
2. [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) — Tokens, typography, component catalogue, contrast.
3. [UI-UX-SPECIFICATION.md](docs/UI-UX-SPECIFICATION.md) — States matrix, forms, navigation, tables.
4. [API-INTEGRATION.md](docs/API-INTEGRATION.md) — Request envelopes, error mapping, query keys.
5. [AUTHENTICATION-FRONTEND.md](docs/AUTHENTICATION-FRONTEND.md) — Multi-tenant session model, cookie security.
6. [ACCESSIBILITY.md](docs/ACCESSIBILITY.md) — WCAG 2.2 AA standards, keyboard navigation, focus.
7. [TESTING-STRATEGY.md](docs/TESTING-STRATEGY.md) — Testing pyramid, Vitest, Playwright conventions.
8. [CODE-STANDARDS.md](docs/CODE-STANDARDS.md) — TypeScript rules, naming, import organization.
9. [ARCHITECTURE-DECISIONS.md](docs/ARCHITECTURE-DECISIONS.md) — ADRs 001 through 008.
10. [IMPLEMENTATION-ROADMAP.md](docs/IMPLEMENTATION-ROADMAP.md) — Progressive milestone roadmap (Phases 0 through 7).

---

## 8. Known Limitations & Planned Backend Integration

1. **Backend Dependency**: Full authentication, customer management, and appointment scheduling require the separate `flowpilot-backend` Express REST API service to be developed and deployed.
2. **Mock Mode Isolation**: The frontend includes validation harnesses, but does not simulate production database records.
3. **OpenAPI Generation**: Once `flowpilot-backend` publishes an OpenAPI v3 document, client types can be automatically synchronized via code generation.
   #   f l o w p i l o t 
    
    
