import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFlowRules,
  getFlowRuleStats,
  getFlowRuleById,
  createFlowRule,
  updateFlowRule,
  toggleFlowRule,
  deleteFlowRule,
  getFlowRuleExecutions,
  testFlowRule,
  type PaginatedFlowRules,
} from "./api";
import type {
  ListFlowRulesQuery,
  CreateFlowRuleInput,
  UpdateFlowRuleInput,
  TestFlowRuleInput,
} from "./types";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";

export const FLOW_RULES_QUERY_KEYS = {
  all: ["flow-rules"] as const,
  lists: () => [...FLOW_RULES_QUERY_KEYS.all, "list"] as const,
  list: (params?: ListFlowRulesQuery, orgId?: string) =>
    [...FLOW_RULES_QUERY_KEYS.lists(), params, orgId] as const,
  stats: (orgId?: string) => [...FLOW_RULES_QUERY_KEYS.all, "stats", orgId] as const,
  details: () => [...FLOW_RULES_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string, orgId?: string) => [...FLOW_RULES_QUERY_KEYS.details(), id, orgId] as const,
  executions: (id: string, params?: { page?: number; limit?: number }, orgId?: string) =>
    [...FLOW_RULES_QUERY_KEYS.all, "executions", id, params, orgId] as const,
};

export function useFlowRules(params?: ListFlowRulesQuery) {
  const { organizationId, isAuthenticated } = useWorkspaceSession();
  return useQuery({
    queryKey: FLOW_RULES_QUERY_KEYS.list(params, organizationId),
    queryFn: () => getFlowRules(params, organizationId),
    enabled: Boolean(organizationId && isAuthenticated),
  });
}

export function useFlowRuleStats() {
  const { organizationId, isAuthenticated } = useWorkspaceSession();
  return useQuery({
    queryKey: FLOW_RULES_QUERY_KEYS.stats(organizationId),
    queryFn: () => getFlowRuleStats(organizationId),
    enabled: Boolean(organizationId && isAuthenticated),
    refetchInterval: 30000, // Refresh metrics every 30 seconds
  });
}

export function useFlowRule(id: string) {
  const { organizationId, isAuthenticated } = useWorkspaceSession();
  return useQuery({
    queryKey: FLOW_RULES_QUERY_KEYS.detail(id, organizationId),
    queryFn: () => getFlowRuleById(id, organizationId),
    enabled: Boolean(id) && Boolean(organizationId && isAuthenticated),
  });
}

export function useFlowRuleExecutions(id: string, params?: { page?: number; limit?: number }) {
  const { organizationId, isAuthenticated } = useWorkspaceSession();
  return useQuery({
    queryKey: FLOW_RULES_QUERY_KEYS.executions(id, params, organizationId),
    queryFn: () => getFlowRuleExecutions(id, params, organizationId),
    enabled: Boolean(id) && Boolean(organizationId && isAuthenticated),
  });
}

export function useCreateFlowRule() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (input: CreateFlowRuleInput) => createFlowRule(input, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLOW_RULES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FLOW_RULES_QUERY_KEYS.stats(organizationId) });
    },
  });
}

export function useUpdateFlowRule() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFlowRuleInput }) =>
      updateFlowRule(id, input, organizationId),
    onSuccess: (updatedRule) => {
      queryClient.invalidateQueries({ queryKey: FLOW_RULES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: FLOW_RULES_QUERY_KEYS.detail(updatedRule.id, organizationId),
      });
      queryClient.invalidateQueries({ queryKey: FLOW_RULES_QUERY_KEYS.stats(organizationId) });
    },
  });
}

export function useToggleFlowRule() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive?: boolean }) =>
      toggleFlowRule(id, isActive, organizationId),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: FLOW_RULES_QUERY_KEYS.lists() });

      // Optimistic update
      queryClient.setQueriesData<PaginatedFlowRules>(
        { queryKey: FLOW_RULES_QUERY_KEYS.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            rules: old.rules.map((rule) =>
              rule.id === id
                ? { ...rule, isActive: isActive !== undefined ? isActive : !rule.isActive }
                : rule
            ),
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FLOW_RULES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FLOW_RULES_QUERY_KEYS.stats(organizationId) });
    },
  });
}

export function useDeleteFlowRule() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (id: string) => deleteFlowRule(id, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLOW_RULES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FLOW_RULES_QUERY_KEYS.stats(organizationId) });
    },
  });
}

export function useTestFlowRule() {
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: TestFlowRuleInput }) =>
      testFlowRule(id, payload, organizationId),
  });
}
