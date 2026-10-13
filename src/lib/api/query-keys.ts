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
};
