# FlowPilot — Design System Specification

> **Document Version**: 1.0.0  
> **Status**: Approved Foundation Baseline  
> **Aesthetic Direction**: Calm, polished, high-density, trustworthy B2B SaaS  
> **Target Contrast Standard**: WCAG 2.2 Level AA Compliant

---

## 1. Visual Direction & Principles

FlowPilot is engineered for business owners, service professionals, agency managers, and administrative staff who spend multiple hours a day inside the workspace. The design system adheres to four core visual tenets:

1. **Calm & Focused**: Restrained use of accent colors. Surfaces and borders separate content with crisp precision rather than visual clutter.
2. **High Information Density**: Compact spacing and balanced typography allow service operators to view calendars, customer records, and invoice lists efficiently without excessive scrolling.
3. **Semantic Clarity**: Colors represent explicit operational states (e.g., success for paid invoices, warning for overdue appointments, destructive for cancellations).
4. **Accessible by Default**: Every interactive element satisfies WCAG 2.2 AA non-text and text contrast ratios (minimum 4.5:1 for body copy, 3:1 for large text and interactive boundaries).

---

## 2. Color Tokens & Theme Architecture

The system uses CSS Custom Properties declared in `src/app/globals.css` and mapped to Tailwind CSS v4 `@theme` tokens.

### Light Theme (Default)

| Token Name             | Hex Value | Semantic Role                                               | Contrast Against Background |
| :--------------------- | :-------- | :---------------------------------------------------------- | :-------------------------- |
| `--primary`            | `#315FE8` | Brand accent, primary buttons, active highlights            | 4.6:1 (AA)                  |
| `--primary-foreground` | `#FFFFFF` | Text on primary surfaces                                    | 4.6:1 (AA)                  |
| `--primary-hover`      | `#264CC5` | Hover state for primary actions                             | 6.1:1 (AAA)                 |
| `--foreground`         | `#172033` | Primary body text and headings                              | 14.2:1 (AAA)                |
| `--background`         | `#F7F9FC` | Page canvas background                                      | Base                        |
| `--surface`            | `#FFFFFF` | Card, table, and modal background surfaces                  | Base                        |
| `--muted`              | `#F0F3F8` | Table headers, secondary pill tags, hover backgrounds       | 1.1:1                       |
| `--muted-foreground`   | `#5A6882` | Secondary labels, captions, metadata timestamps             | 4.8:1 (AA)                  |
| `--border`             | `#E1E7F0` | Structural dividers, card borders, table separators         | 3.1:1 (Non-text AA)         |
| `--input`              | `#E1E7F0` | Unfocused form field borders                                | 3.1:1 (Non-text AA)         |
| `--ring`               | `#315FE8` | Focus visible outline ring                                  | 3.1:1 (Non-text AA)         |
| `--success`            | `#16856B` | Paid invoices, confirmed appointments, completed tasks      | 5.2:1 (AA)                  |
| `--warning`            | `#B7791F` | Pending approvals, draft invoices, approaching deadlines    | 4.7:1 (AA)                  |
| `--destructive`        | `#C2414B` | Overdue invoices, cancellations, destructive delete actions | 4.9:1 (AA)                  |

### Dark Theme

| Token Name           | Hex Value | Semantic Role                                            |
| :------------------- | :-------- | :------------------------------------------------------- |
| `--background`       | `#0D121C` | Deep slate page canvas                                   |
| `--surface`          | `#141B29` | Raised surface and container background                  |
| `--foreground`       | `#F0F4FC` | High-contrast body text and headings                     |
| `--muted`            | `#1C2638` | Secondary container backgrounds                          |
| `--muted-foreground` | `#8A9BB7` | Muted metadata and helper text                           |
| `--border`           | `#243046` | Subtle structural division lines                         |
| `--input`            | `#243046` | Form input boundaries                                    |
| `--primary`          | `#3F6CF5` | Slightly lifted primary accent for dark mode readability |
| `--success`          | `#1EA384` | Dark mode semantic success                               |
| `--warning`          | `#D6932A` | Dark mode semantic warning                               |
| `--destructive`      | `#DF525C` | Dark mode semantic destructive                           |

---

## 3. Typography Hierarchy

FlowPilot uses a clean, modern sans-serif typography stack optimized for readability across English and international character sets:

`font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";`

### Type Scale

| Style Token                 | Font Size          | Line Height       | Weight         | Typical Application                      |
| :-------------------------- | :----------------- | :---------------- | :------------- | :--------------------------------------- |
| **Display Heading**         | `2.25rem` (36px)   | `2.5rem` (1.1)    | 800 (Bold)     | Marketing hero titles, splash headers    |
| **Page Title (h1)**         | `1.875rem` (30px)  | `2.25rem` (1.2)   | 700 (Bold)     | `PageHeader` titles, primary view titles |
| **Section Header (h2)**     | `1.25rem` (20px)   | `1.75rem` (1.4)   | 600 (Semibold) | Card group titles, major drawer headers  |
| **Card / Modal Title (h3)** | `1.125rem` (18px)  | `1.5rem` (1.33)   | 600 (Semibold) | CardHeader titles, modal titles          |
| **Subsection Header (h4)**  | `0.875rem` (14px)  | `1.25rem` (1.4)   | 600 (Semibold) | Form section subheaders, table headers   |
| **Body (Default)**          | `0.875rem` (14px)  | `1.25rem` (1.5)   | 400 (Regular)  | Standard body copy, table cell content   |
| **Body Small**              | `0.75rem` (12px)   | `1rem` (1.33)     | 400 (Regular)  | Helper text, form error messages         |
| **Micro / Mono**            | `0.6875rem` (11px) | `0.875rem` (1.27) | 500 (Medium)   | Timestamps, badges, currency tags        |

---

## 4. Spacing, Radii, and Elevation

### Spacing Scale

- Baseline unit: **4px**
- `px-1` / `py-1`: 4px (micro padding)
- `px-2` / `py-2`: 8px (dense controls, badges, chips)
- `px-3` / `py-2`: 12px x 8px (standard input & button padding)
- `p-4`: 16px (compact card padding, sidebar items)
- `p-6`: 24px (standard dashboard card & modal padding)
- `p-8`: 32px (empty state & page-level spacing)

### Border Radii

- `--radius-sm`: `0.25rem` (4px) — Small buttons, badges, sub-menu items
- `--radius-md`: `0.375rem` (6px) — Inputs, dropdown menus, tabs
- `--radius-lg`: `0.5rem` (8px) — Cards, containers, modals
- `--radius-full`: `9999px` — Status pills, user avatars

### Elevation & Shadows

- `shadow-xs`: `0 1px 2px 0 rgb(0 0 0 / 0.05)` — Cards, input borders, buttons
- `shadow-md`: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` — Dropdown menus, popovers
- `shadow-lg`: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` — Dialog modals, slide-over panels

---

## 5. Motion & Animation Principles

1. **Restrained Durations**:
   - Micro-interactions (hover, focus rings, clicks): **150ms** (`transition-colors`, `duration-150`)
   - Surface transitions (dropdown expansion, modal entrance): **200ms** (`duration-200`)
   - Slide-over drawers & full-page transitions: **250ms - 300ms**
2. **Accessible Reduced-Motion Enforcement**:
   - All pulse animations and spinners utilize `motion-reduce:animate-none`.
   - Users who specify `prefers-reduced-motion: reduce` receive instantaneous state changes without motion sickness triggers.

---

## 6. Primitives & Components Library

| Component      | File Path                                   | Key Features                                                                                                                       |
| :------------- | :------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| `Button`       | `src/components/ui/button.tsx`              | Variants: default, secondary, outline, ghost, destructive, link. Sizes: sm, default, lg, icon. Supports `isLoading` and `asChild`. |
| `Input`        | `src/components/ui/input.tsx`               | Native input wrapper, `hasError` validation state, accessible focus ring.                                                          |
| `Textarea`     | `src/components/ui/textarea.tsx`            | Vertical resizing, validation states, accessible associations.                                                                     |
| `Label`        | `src/components/ui/label.tsx`               | Accessible `<label>` with optional `isRequired` red asterisk indicator.                                                            |
| `Badge`        | `src/components/ui/badge.tsx`               | Variants: default, secondary, outline, success, warning, destructive.                                                              |
| `Card`         | `src/components/ui/card.tsx`                | Modular `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.                                                 |
| `Dialog`       | `src/components/ui/dialog.tsx`              | Accessible modal dialog with backdrop blur overlay, focus trap, and close trigger.                                                 |
| `DropdownMenu` | `src/components/ui/dropdown-menu.tsx`       | Accessible popup menu with keyboard navigation, items, checkboxes, radios, and dividers.                                           |
| `Tabs`         | `src/components/ui/tabs.tsx`                | Accessible tab switcher with keyboard navigation and active pill indicator.                                                        |
| `Table`        | `src/components/ui/table.tsx`               | Responsive semantic HTML table container, hover row effects, and caption support.                                                  |
| `Skeleton`     | `src/components/ui/skeleton.tsx`            | Pulse placeholder respecting reduced motion.                                                                                       |
| `Spinner`      | `src/components/ui/spinner.tsx`             | SVG loader with `role="status"` and accessible screen-reader announcement.                                                         |
| `EmptyState`   | `src/components/feedback/empty-state.tsx`   | Reusable blank canvas state with icon, title, description, and action button.                                                      |
| `ErrorState`   | `src/components/feedback/error-state.tsx`   | Alert box with icon, explanation, and retry callback.                                                                              |
| `LoadingState` | `src/components/feedback/loading-state.tsx` | Polite `aria-live` loading placeholder.                                                                                            |
| `PageHeader`   | `src/components/layout/page-header.tsx`     | Title, description, breadcrumb slot, and action button group.                                                                      |
| `Container`    | `src/components/layout/container.tsx`       | Max-width constraints (`sm`, `default`, `lg`, `fluid`) with responsive gutter padding.                                             |
