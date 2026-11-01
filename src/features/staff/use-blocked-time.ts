"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import {
  getBlockedTimes,
  createBlockedTime,
  updateBlockedTime,
  deleteBlockedTime,
} from "./api";
import type {
  BlockedTimeFilterParams,
  CreateBlockedTimePayload,
  UpdateBlockedTimePayload,
  BlockedTimeItem,
} from "./types";

export const blockedTimeKeys = {
  all: ["staff", "blocked-times"] as const,
  list: (orgId?: string, params?: BlockedTimeFilterParams) =>
    [...blockedTimeKeys.all, orgId || "default", params || {}] as const,
};

function useResolvedOrgId(): string {
  const { organizationId } = useWorkspaceSession();
  if (organizationId) return organizationId;
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem("flowpilot_active_org");
    if (cached) return cached;
  }
  return "";
}

/**
 * Fetch blocked time intervals (breaks, leaves, company holidays)
 */
export function useBlockedTimes(
  params?: BlockedTimeFilterParams,
  explicitOrgId?: string
) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: blockedTimeKeys.list(organizationId, params),
    queryFn: () => getBlockedTimes(params, organizationId),
    enabled: Boolean(organizationId),
    staleTime: 1000 * 30, // 30s cache
  });
}

/**
 * Mutation to create a new blocked interval or company holiday
 */
export function useCreateBlockedTime() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (payload: CreateBlockedTimePayload) =>
      createBlockedTime(payload, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockedTimeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "schedule"] });
    },
  });
}

/**
 * Mutation to update an existing blocked time entry
 */
export function useUpdateBlockedTime() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateBlockedTimePayload;
    }) => updateBlockedTime(id, payload, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockedTimeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "schedule"] });
    },
  });
}

/**
 * Mutation to delete a blocked interval and reopen calendar slot
 */
export function useDeleteBlockedTime() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (id: string) => deleteBlockedTime(id, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockedTimeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "schedule"] });
    },
  });
}

