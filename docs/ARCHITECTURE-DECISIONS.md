# FlowPilot — Architecture Decision Records (ADRs)

> **Document Version**: 1.0.0  
> **Status**: Accepted Engineering Records

---

## ADR 001: Selection of Next.js App Router & React 19

### Context

FlowPilot requires a modern web framework capable of streaming SSR, server/client component separation, robust metadata management, nested layouts, and static optimization for multi-tenant SaaS dashboards and public landing pages.

### Decision

Adopt **Next.js 16 (App Router)** with **React 19** and Turbopack.

### Consequences

- **Positive**: Native React Server Components eliminate client-side bundle weight for non-interactive views. Nested route groups (`(public)`, `(auth)`, `(dashboard)`) provide clean layout inheritance.
- **Trade-off**: Requires strict discipline regarding `"use client"` component leaf boundaries.

---

## ADR 002: Tailwind CSS v4 with CSS Variables for Design Tokens

### Context

The design system must support precise B2B SaaS tokens (Primary `#315FE8`, Surface `#FFFFFF`, Canvas `#F7F9FC`), dark mode readiness, high compilation speed, and low runtime overhead.

### Decision

Adopt **Tailwind CSS v4** utilizing `@theme` and CSS custom properties declared in `src/app/globals.css`.

### Consequences

- **Positive**: Zero runtime CSS-in-JS overhead; instantaneous Turbopack builds; consistent token consumption via standard utility classes (`bg-primary`, `border-border`, `text-muted-foreground`).
- **Trade-off**: Requires defining semantic CSS custom properties carefully to ensure dark theme parity.

---

## ADR 003: Radix UI Headless Primitives for Component Foundation

### Context

Building accessible UI components (Dialogs, Dropdown Menus, Tabs, Portals) from scratch is prone to accessibility defects, keyboard trapping bugs, and screen reader inconsistencies. Conversely, heavy UI component suites (MUI, Ant Design) introduce massive runtime bundles and rigid styling paradigms.

### Decision

Adopt **Radix UI headless primitives** (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs`, `@radix-ui/react-slot`) styled with Tailwind CSS and `class-variance-authority`.

### Consequences

- **Positive**: 100% accessible WAI-ARIA compliant keyboard navigation and focus management out of the box; total styling freedom via Tailwind utility classes.
- **Trade-off**: Primitives must be imported as modular headless packages.

---

## ADR 004: TanStack Query v5 for Remote Server State Management

### Context

Interacting with a separate Express REST API requires caching, request deduplication, optimistic updates, background revalidation, loading states, and cache purging on tenant switch.

### Decision

Adopt **TanStack Query v5** (`@tanstack/react-query`).

### Consequences

- **Positive**: Complete separation of server state from local UI state; automatic request deduplication; hierarchical query key invalidation; built-in stale time management.
- **Trade-off**: Requires careful cache invalidation when users switch between organizations. Addressed via `clearSessionCache()`.

---

## ADR 005: Decoupled Express REST API Boundary over Next.js Server Actions

### Context

Next.js supports Server Actions that execute server code directly. However, FlowPilot's architecture requires a dedicated, independently scalable backend (`flowpilot-backend`) utilizing an Express REST API.

### Decision

Do **NOT** use Next.js Server Actions as the business backend. FlowPilot frontend interacts solely via HTTP REST calls dispatched by `ApiClient` to `flowpilot-backend`.

### Consequences

- **Positive**: Frontend and backend are completely decoupled and independently maintainable; supports future mobile clients or third-party API integrations against the same Express service.
- **Trade-off**: Requires maintaining explicit TypeScript API contract interfaces and mock adapters for frontend-only verification.

---

## ADR 006: Secure HTTP-Only Cookie Authentication over LocalStorage Tokens

### Context

Authentication tokens stored in `localStorage` are vulnerable to total account theft through XSS vulnerabilities.

### Decision

Standardize on server-managed **HTTP-only, Secure, SameSite=Lax cookies** for browser authentication sessions.

### Consequences

- **Positive**: Immune to JavaScript-based token exfiltration; seamless hydration in Server Components.
- **Trade-off**: Requires proper CORS credential configuration (`credentials: "include"`) between frontend and backend origins.

---

## ADR 007: Vitest for Unit & Component Testing

### Context

Jest has historically been difficult to configure with ESM, Vite/Turbopack, and Next.js 16. Vitest provides native ESM execution, instant startup, and seamless compatibility with Testing Library.

### Decision

Adopt **Vitest 5** with `@testing-library/react` and `jsdom`.

### Consequences

- **Positive**: Execution times under 3 seconds; zero configuration conflicts with TypeScript path aliases.
- **Trade-off**: Vitest configuration uses `.mts` extension to align cleanly with native ESM.
