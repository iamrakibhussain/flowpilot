import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  archiveCustomer,
  reactivateCustomer,
  addCustomerNote,
} from "./api";
import type {
  CustomersFilterParams,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  CustomerListResponse,
  CustomerDetailResponse,
} from "./types";

export const customerQueryKeys = {
  all: ["customers"] as const,
  lists: () => [...customerQueryKeys.all, "list"] as const,
  list: (orgId: string, params: CustomersFilterParams) =>
    [...customerQueryKeys.lists(), orgId, params] as const,
  details: () => [...customerQueryKeys.all, "detail"] as const,
  detail: (orgId: string, id: string) => [...customerQueryKeys.details(), orgId, id] as const,
};

/**
 * Helper to resolve active organization ID from active session or cached storage
 */
export function useResolvedOrgId(): string {
  const { organizationId } = useWorkspaceSession();
  if (organizationId) return organizationId;
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem("flowpilot_active_org");
    if (cached) return cached;
  }
  return "";
}

/**
 * Hook to fetch paginated customers list
 */
export function useCustomers(params: CustomersFilterParams = {}) {
  const organizationId = useResolvedOrgId();

  return useQuery<CustomerListResponse>({
    queryKey: customerQueryKeys.list(organizationId || "default", params),
    queryFn: () => getCustomers(params, organizationId || undefined),
    enabled: Boolean(organizationId),
    staleTime: 30000,
  });
}

/**
 * Hook to fetch a 360-degree customer profile
 */
export function useCustomer(id: string) {
  const organizationId = useResolvedOrgId();

  return useQuery<CustomerDetailResponse>({
    queryKey: customerQueryKeys.detail(organizationId || "default", id),
    queryFn: () => getCustomerById(id, organizationId || undefined),
    enabled: Boolean(organizationId && id),
    staleTime: 20000,
  });
}

/**
 * Hook to create a customer
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) =>
      createCustomer(payload, organizationId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * Hook to update a customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) =>
      updateCustomer(id, payload, organizationId || undefined),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: customerQueryKeys.detail(organizationId || "default", variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * Hook to archive a customer
 */
export function useArchiveCustomer() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (id: string) => archiveCustomer(id, organizationId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * Hook to reactivate an archived customer
 */
export function useReactivateCustomer() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (id: string) => reactivateCustomer(id, organizationId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * Hook to add a note to a customer
 */
export function useAddCustomerNote(customerId: string) {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (content: string) =>
      addCustomerNote(customerId, content, organizationId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerQueryKeys.detail(organizationId || "default", customerId),
      });
    },
  });
}
