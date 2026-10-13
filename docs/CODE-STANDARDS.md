# FlowPilot — Code Standards & Engineering Guidelines

> **Document Version**: 1.0.0  
> **Status**: Approved Team Engineering Standard  
> **Target Toolchain**: TypeScript Strict, ESLint 9 Flat Config, Prettier

---

## 1. TypeScript Strictness Standards

FlowPilot enforces a zero-tolerance policy for loose typing:

1. **No `any`**: The `any` type is strictly forbidden. Use `unknown` for data from untrusted external inputs (API responses, webhooks, URL params) and narrow using type guards or Zod schemas.
2. **No Unsafe Type Assertions**: Avoid `as SomeType` unless bridging an untyped third-party library. Always favor type predicates (`function isUser(val: unknown): val is User`).
3. **No Non-Null Assertions (`!`)**: Avoid `!` operator unless accompanied by an explicit code comment justifying why the value is guaranteed to exist.
4. **Explicit Domain Contracts**: All domain entities, API payloads, and query filters must have explicit interface definitions in `src/types/` or `src/features/*/types.ts`.

---

## 2. Naming & File Conventions

| Asset Type                        | Convention                         | Examples                                                |
| :-------------------------------- | :--------------------------------- | :------------------------------------------------------ |
| **Files & Directories**           | `kebab-case.ts` / `kebab-case.tsx` | `empty-state.tsx`, `query-client.ts`, `page-header.tsx` |
| **React Components**              | `PascalCase`                       | `EmptyState`, `Button`, `PageHeader`                    |
| **Custom Hooks**                  | `camelCase` with `use` prefix      | `useAuth`, `useOrganization`, `useDebounce`             |
| **Utility Functions**             | `camelCase`                        | `cn()`, `normalizeApiError()`, `formatCurrency()`       |
| **TypeScript Types & Interfaces** | `PascalCase`                       | `User`, `ApiResponse<T>`, `WorkspaceRole`               |
| **Constants & Enums**             | `UPPER_SNAKE_CASE` or `as const`   | `DEFAULT_TIMEOUT_MS`, `HTTP_STATUS`                     |

---

## 3. Import Ordering & Path Aliases

All internal project modules use the `@/*` path alias mapped to `./src/*`. Imports must follow this order:

```tsx
// 1. React & Framework standard libraries
import * as React from "react";
import Link from "next/link";

// 2. Third-party dependencies
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertCircle } from "lucide-react";

// 3. FlowPilot library, config, and utils
import { env } from "@/lib/config/env";
import { cn } from "@/lib/utils/cn";
import { apiClient } from "@/lib/api/client";

// 4. UI components & Layouts
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 5. Types
import type { ApiResponse } from "@/lib/api/types";
```

---

## 4. Component Structure & Boundaries

```tsx
// 1. Client directive if interactive
"use client";

// 2. Imports
import * as React from "react";
import { cn } from "@/lib/utils/cn";

// 3. Exported Props Interface
export interface CardBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success";
}

// 4. Component definition with explicit displayName
export const CardBadge: React.FC<CardBadgeProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  return (
    <span className={cn("inline-flex px-2 py-0.5 text-xs", className)} {...props}>
      {children}
    </span>
  );
};
CardBadge.displayName = "CardBadge";
```

---

## 5. Error Handling & Logging Standards

1. **Never Swallow Exceptions Silently**:
   - `try / catch` blocks must log the error or propagate a normalized `ApiClientError`.
2. **Never Log Sensitive Information**:
   - Passwords, credit cards, full authentication tokens, or personal identity numbers must never appear in `console.error` or monitoring payloads.
3. **User-Friendly Error Messages**:
   - Technical stack traces are never rendered to users. Display human-readable explanations via `ErrorState`.
