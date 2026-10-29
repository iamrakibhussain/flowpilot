"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import {
  getStaff,
  getStaffMetrics,
  getStaffById,
  createStaff,
  updateStaff,
  updateStaffStatus,
  deleteStaff,
} from "./api";
import type {
  StaffFilterParams,
  CreateStaffPayload,
  UpdateStaffPayload,
  StaffStatus,
} from "./types";

export const staffKeys = {
  all: ["staff"] as const,
  lists: () => [...staffKeys.all, "list"] as const,
  list: (orgId?: string, params?: StaffFilterParams) =>
    [...staffKeys.lists(), orgId, params] as const,
  metrics: (orgId?: string) => [...staffKeys.all, "metrics", orgId] as const,
  details: () => [...staffKeys.all, "detail"] as const,
  detail: (orgId?: string, id?: string) => [...staffKeys.details(), orgId, id] as const,
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

export function useStaff(params?: StaffFilterParams, explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: staffKeys.list(organizationId, params),
    queryFn: () => getStaff(params, organizationId),
    enabled: Boolean(organizationId),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useStaffMetrics(explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: staffKeys.metrics(organizationId),
    queryFn: () => getStaffMetrics(organizationId),
    enabled: Boolean(organizationId),
    staleTime: 1000 * 30,
  });
}

export function useStaffById(id: string, explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: staffKeys.detail(organizationId, id),
    queryFn: () => getStaffById(id, organizationId),
    enabled: Boolean(organizationId && id),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  const resolvedOrgId = useResolvedOrgId();

  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => createStaff(payload, resolvedOrgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  const resolvedOrgId = useResolvedOrgId();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStaffPayload }) =>
      updateStaff(id, payload, resolvedOrgId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(resolvedOrgId, variables.id) });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateStaffStatus() {
  const queryClient = useQueryClient();
  const resolvedOrgId = useResolvedOrgId();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StaffStatus }) =>
      updateStaffStatus(id, status, resolvedOrgId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(resolvedOrgId, variables.id) });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  const resolvedOrgId = useResolvedOrgId();

  return useMutation({
    mutationFn: (id: string) => deleteStaff(id, resolvedOrgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
}
