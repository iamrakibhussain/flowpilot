# FlowPilot — Accessibility (a11y) Specification

> **Document Version**: 1.0.0  
> **Target Standard**: WCAG 2.2 Level AA  
> **Core Principle**: Accessible by Default, Not as an Afterthought

---

## 1. Landmark & Semantic HTML Architecture

FlowPilot ensures all pages are navigable by assistive technologies through strict semantic structure:

- `<header>`: Contains primary workspace branding, breadcrumbs, search, and profile actions.
- `<main id="main-content">`: Main operational surface. Root layout includes an accessible skip-to-content link:
  ```html
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 ..."
  >
    Skip to main content
  </a>
  ```
- `<nav aria-label="...">`: Clearly labeled navigation landmarks for sidebar and breadcrumb navigation.
- `<aside aria-label="Workspace Sidebar">`: Collapsible workspace navigation.
- `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`: Semantic HTML data tables rather than `<div>` grids.

---

## 2. Keyboard Navigation & Focus Management

1. **Focus Ring Visuals**:
   - All interactive controls (buttons, inputs, links, tabs) use a high-contrast focus indicator:
     `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
   - Focus indicators maintain at least a **3:1 contrast ratio** against adjacent surfaces.
2. **Focus Trapping in Modals (`Dialog`)**:
   - When a modal dialog opens, focus is trapped within the dialog.
   - Background page content receives `aria-hidden="true"`.
   - Pressing `Escape` closes the modal and returns focus to the initiating button.
3. **Compound Widget Keyboard Patterns**:
   - `DropdownMenu`: Arrow Up/Down navigation, Enter/Space activation, Escape to dismiss.
   - `Tabs`: Arrow Left/Right switches tabs, Tab moves focus into active panel content.

---

## 3. Form Accessibility Standards

1. **Explicit Associations**:
   ```tsx
   <Label htmlFor="customer-email" isRequired>Email Address</Label>
   <Input
     id="customer-email"
     type="email"
     aria-invalid={hasError ? "true" : undefined}
     aria-describedby={hasError ? "customer-email-error" : undefined}
   />
   {hasError && (
     <p id="customer-email-error" role="alert" className="text-xs text-destructive">
       {errorMessage}
     </p>
   )}
   ```
2. **No Color Alone for Status**:
   - Errors, warnings, and success states are accompanied by descriptive text and icons (`AlertCircle`, `CheckCircle2`), never by color alone.

---

## 4. Reduced Motion & Sensory Accommodation

- All CSS animations and spinners include `motion-reduce:animate-none`.
- Users with vestibular disorders or motion sensitivity receive zero unsolicited motion triggers when `prefers-reduced-motion: reduce` is enabled in their operating system.

---

## 5. Touch Targets

- Minimum touch target size on mobile and touch devices is **44 x 44 CSS pixels**.
- Icon buttons (such as notification bells or table row action menus) maintain `h-10 w-10` or padding buffers to ensure effortless tapping.

---

## 6. Testing & Compliance Verification

- **Automated Testing**: Vitest component tests verify semantic roles (`getByRole("button")`, `getByRole("status")`, `getByRole("alert")`).
- **Linter Enforcements**: `eslint-plugin-jsx-a11y` rules enabled through Next.js core web vitals and strict linting.
- **Manual Audits**: Keyboard-only traversal audits and screen-reader tests (NVDA/VoiceOver) prior to feature releases.
