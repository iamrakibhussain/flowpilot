"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  syncServiceStaff,
  deleteService,
  toggleServiceActive,
  getPublicBookingProfile,
  getPublicBookingSlots,
  bookPublicAppointment,
} from "./api";
import type {
  CreateServiceInput,
  UpdateServiceInput,
  ServiceListQuery,
  PublicBookingInput,
} from "./types";

export const serviceKeys = {
  all: ["services"] as const,
  lists: () => [...serviceKeys.all, "list"] as const,
  list: (orgId?: string, query?: ServiceListQuery) =>
    [...serviceKeys.lists(), orgId, query] as const,
  details: () => [...serviceKeys.all, "detail"] as const,
  detail: (orgId?: string, id?: string) => [...serviceKeys.details(), orgId, id] as const,
  publicProfile: (slug?: string) => ["public-booking", "profile", slug] as const,
  publicSlots: (slug?: string, serviceId?: string, date?: string, staffId?: string) =>
    ["public-booking", "slots", slug, serviceId, date, staffId] as const,
};

export function useResolvedOrgId(): string {
  const { organizationId } = useWorkspaceSession();
  if (organizationId) return organizationId;
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem("flowpilot_active_org");
    if (cached) return cached;
  }
  return "";
}

export function useServices(query?: ServiceListQuery, explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: serviceKeys.list(organizationId, query),
    queryFn: () => getServices(query, organizationId),
    enabled: Boolean(organizationId),
    staleTime: 1000 * 60,
  });
}

export function useService(id?: string, explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: serviceKeys.detail(organizationId, id),
    queryFn: () => getServiceById(id!, organizationId),
    enabled: Boolean(organizationId && id),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (data: CreateServiceInput) => createService(data, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceInput }) =>
      updateService(id, data, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(organizationId, variables.id) });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useSyncServiceStaff() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: ({ id, staffMemberIds }: { id: string; staffMemberIds: string[] }) =>
      syncServiceStaff(id, staffMemberIds, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(organizationId, variables.id) });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (id: string) => deleteService(id, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useToggleServiceActive() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (id: string) => toggleServiceActive(id, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

// -------------------------------------------------------------
// Public Client Self-Scheduling Hooks
// -------------------------------------------------------------

export function usePublicBookingProfile(slug?: string) {
  return useQuery({
    queryKey: serviceKeys.publicProfile(slug),
    queryFn: () => getPublicBookingProfile(slug!),
    enabled: Boolean(slug && slug.trim().length > 0),
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}

export function usePublicBookingSlots(
  slug?: string,
  serviceId?: string,
  date?: string,
  staffMemberId?: string
) {
  return useQuery({
    queryKey: serviceKeys.publicSlots(slug, serviceId, date, staffMemberId),
    queryFn: () => getPublicBookingSlots(slug!, serviceId!, date!, staffMemberId),
    enabled: Boolean(slug && serviceId && date),
    staleTime: 1000 * 30, // 30 sec live slots
  });
}

export function useBookPublicAppointment(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PublicBookingInput) => bookPublicAppointment(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-booking", "slots"] });
    },
  });
}
