/**
 * Factory for TanStack Query keys to ensure consistent cache invalidation and query deduplication.
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
  },
  organizations: {
    all: ["organizations"] as const,
    list: () => [...queryKeys.organizations.all, "list"] as const,
    detail: (id: string) => [...queryKeys.organizations.all, "detail", id] as const,
    members: (id: string) => [...queryKeys.organizations.all, "members", id] as const,
    settings: (orgId?: string) =>
      [...queryKeys.organizations.all, "settings", orgId ?? "default"] as const,
    auditLogs: (orgId?: string) =>
      [...queryKeys.organizations.all, "audit-logs", orgId ?? "default"] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.customers.all, "list", filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.customers.all, "detail", id] as const,
  },
  services: {
    all: ["services"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.services.all, "list", filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.services.all, "detail", id] as const,
  },
  appointments: {
    all: ["appointments"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.appointments.all, "list", filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.appointments.all, "detail", id] as const,
  },
  invoices: {
    all: ["invoices"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.invoices.all, "list", filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.invoices.all, "detail", id] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    metrics: (timeframe: string, orgId?: string) =>
      [...queryKeys.dashboard.all, "metrics", timeframe, orgId ?? "default"] as const,
    activities: (type?: string, orgId?: string) =>
      [...queryKeys.dashboard.all, "activities", type ?? "all", orgId ?? "default"] as const,
    schedule: (orgId?: string) =>
      [...queryKeys.dashboard.all, "schedule", orgId ?? "default"] as const,
    staff: (orgId?: string) => [...queryKeys.dashboard.all, "staff", orgId ?? "default"] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    overview: (timeframe?: string, orgId?: string) =>
      [...queryKeys.analytics.all, "overview", timeframe ?? "30d", orgId ?? "default"] as const,
    cashflow: (timeframe?: string, orgId?: string) =>
      [...queryKeys.analytics.all, "cashflow", timeframe ?? "30d", orgId ?? "default"] as const,
    services: (timeframe?: string, orgId?: string) =>
      [...queryKeys.analytics.all, "services", timeframe ?? "30d", orgId ?? "default"] as const,
    staff: (timeframe?: string, orgId?: string) =>
      [...queryKeys.analytics.all, "staff", timeframe ?? "30d", orgId ?? "default"] as const,
    customers: (timeframe?: string, orgId?: string) =>
      [...queryKeys.analytics.all, "customers", timeframe ?? "30d", orgId ?? "default"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (filters?: Record<string, unknown>, orgId?: string) =>
      [...queryKeys.notifications.all, "list", filters ?? {}, orgId ?? "default"] as const,
  },
};
