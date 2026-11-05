import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRecurringSchedules,
  getRecurringStats,
  getRecurringScheduleById,
  createRecurringSchedule,
  updateRecurringSchedule,
  pauseRecurringSchedule,
  resumeRecurringSchedule,
  cancelRecurringSchedule,
  logRetainerHours,
  triggerProcessNow,
} from "./api";
import type {
  ListRecurringSchedulesQuery,
  CreateRecurringScheduleInput,
  UpdateRecurringScheduleInput,
  LogRetainerHoursInput,
} from "./types";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";

export const RECURRING_QUERY_KEYS = {
  all: ["recurring"] as const,
  lists: () => [...RECURRING_QUERY_KEYS.all, "list"] as const,
  list: (params?: ListRecurringSchedulesQuery, orgId?: string) =>
    [...RECURRING_QUERY_KEYS.lists(), params, orgId] as const,
  stats: (orgId?: string) => [...RECURRING_QUERY_KEYS.all, "stats", orgId] as const,
  details: () => [...RECURRING_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string, orgId?: string) => [...RECURRING_QUERY_KEYS.details(), id, orgId] as const,
};

export function useRecurringSchedules(params?: ListRecurringSchedulesQuery) {
  const { organizationId, isAuthenticated } = useWorkspaceSession();
  return useQuery({
    queryKey: RECURRING_QUERY_KEYS.list(params, organizationId),
    queryFn: () => getRecurringSchedules(params, organizationId),
    enabled: Boolean(organizationId && isAuthenticated),
  });
}

export function useRecurringStats() {
  const { organizationId, isAuthenticated } = useWorkspaceSession();
  return useQuery({
    queryKey: RECURRING_QUERY_KEYS.stats(organizationId),
    queryFn: () => getRecurringStats(organizationId),
    enabled: Boolean(organizationId && isAuthenticated),
  });
}

export function useRecurringSchedule(id: string) {
  const { organizationId, isAuthenticated } = useWorkspaceSession();
  return useQuery({
    queryKey: RECURRING_QUERY_KEYS.detail(id, organizationId),
    queryFn: () => getRecurringScheduleById(id, organizationId),
    enabled: Boolean(id) && Boolean(organizationId && isAuthenticated),
  });
}

export function useCreateRecurringSchedule() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (payload: CreateRecurringScheduleInput) =>
      createRecurringSchedule(payload, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_QUERY_KEYS.all });
    },
  });
}

export function useUpdateRecurringSchedule() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRecurringScheduleInput }) =>
      updateRecurringSchedule(id, payload, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: RECURRING_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: RECURRING_QUERY_KEYS.detail(variables.id, organizationId),
      });
    },
  });
}

export function usePauseRecurringSchedule() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (id: string) => pauseRecurringSchedule(id, organizationId),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: RECURRING_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RECURRING_QUERY_KEYS.detail(id, organizationId) });
    },
  });
}

export function useResumeRecurringSchedule() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (id: string) => resumeRecurringSchedule(id, organizationId),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: RECURRING_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RECURRING_QUERY_KEYS.detail(id, organizationId) });
    },
  });
}

export function useCancelRecurringSchedule() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (id: string) => cancelRecurringSchedule(id, organizationId),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: RECURRING_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RECURRING_QUERY_KEYS.detail(id, organizationId) });
    },
  });
}

export function useLogRetainerHours() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: ({ scheduleId, payload }: { scheduleId: string; payload: LogRetainerHoursInput }) =>
      logRetainerHours(scheduleId, payload, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: RECURRING_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: RECURRING_QUERY_KEYS.detail(variables.scheduleId, organizationId),
      });
    },
  });
}

export function useProcessRecurringNow() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: () => triggerProcessNow(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
