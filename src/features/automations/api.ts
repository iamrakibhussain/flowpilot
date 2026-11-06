import { apiClient } from "@/lib/api/client";
import type {
  FlowRuleListItem,
  FlowRuleExecutionItem,
  FlowRuleStatsResponse,
  CreateFlowRuleInput,
  UpdateFlowRuleInput,
  ListFlowRulesQuery,
  TestFlowRuleInput,
  TestFlowRuleResult,
} from "./types";

export interface PaginatedFlowRules {
  rules: FlowRuleListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedFlowRuleExecutions {
  executions: FlowRuleExecutionItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Fetch list of FlowRules with filtering
 */
export async function getFlowRules(
  params?: ListFlowRulesQuery,
  organizationId?: string
): Promise<PaginatedFlowRules> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params?.trigger) queryParams.trigger = params.trigger;
  if (params?.action) queryParams.action = params.action;
  if (params?.isActive !== undefined) queryParams.isActive = params.isActive;
  if (params?.search) queryParams.search = params.search;
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  const response = await apiClient.get<
    | FlowRuleListItem[]
    | {
        rules: FlowRuleListItem[];
        total: number;
        page: number;
        limit: number;
      }
  >("/flow-rules", {
    params: queryParams as Record<string, string | undefined>,
    organizationId,
  });

  const raw = response.data as unknown as
    | {
        rules?: FlowRuleListItem[];
        total?: number;
        page?: number;
        limit?: number;
      }
    | FlowRuleListItem[];
  const rulesList: FlowRuleListItem[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { rules?: FlowRuleListItem[] })?.rules)
      ? (raw as { rules: FlowRuleListItem[] }).rules
      : [];

  const total =
    typeof (raw as { total?: number })?.total === "number"
      ? (raw as { total: number }).total
      : (response.meta?.totalCount ?? rulesList.length);

  const page =
    typeof (raw as { page?: number })?.page === "number"
      ? (raw as { page: number }).page
      : (response.meta?.page ?? 1);
  const limit =
    typeof (raw as { limit?: number })?.limit === "number"
      ? (raw as { limit: number }).limit
      : (response.meta?.limit ?? 20);

  return {
    rules: rulesList,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Fetch automation engine aggregate metrics
 */
export async function getFlowRuleStats(organizationId?: string): Promise<FlowRuleStatsResponse> {
  const response = await apiClient.get<FlowRuleStatsResponse>("/flow-rules/stats", {
    organizationId,
  });
  return response.data;
}

/**
 * Fetch single rule details
 */
export async function getFlowRuleById(
  id: string,
  organizationId?: string
): Promise<FlowRuleListItem> {
  const response = await apiClient.get<FlowRuleListItem>(`/flow-rules/${id}`, {
    organizationId,
  });
  return response.data;
}

/**
 * Create a new FlowRule
 */
export async function createFlowRule(
  input: CreateFlowRuleInput,
  organizationId?: string
): Promise<FlowRuleListItem> {
  const response = await apiClient.post<FlowRuleListItem>("/flow-rules", input, {
    organizationId,
  });
  return response.data;
}

/**
 * Update an existing FlowRule
 */
export async function updateFlowRule(
  id: string,
  input: UpdateFlowRuleInput,
  organizationId?: string
): Promise<FlowRuleListItem> {
  const response = await apiClient.patch<FlowRuleListItem>(`/flow-rules/${id}`, input, {
    organizationId,
  });
  return response.data;
}

/**
 * Toggle active state of a FlowRule
 */
export async function toggleFlowRule(
  id: string,
  isActive?: boolean,
  organizationId?: string
): Promise<FlowRuleListItem> {
  const response = await apiClient.patch<FlowRuleListItem>(
    `/flow-rules/${id}/toggle`,
    { isActive },
    { organizationId }
  );
  return response.data;
}

/**
 * Delete a FlowRule
 */
export async function deleteFlowRule(id: string, organizationId?: string): Promise<void> {
  await apiClient.delete<void>(`/flow-rules/${id}`, {
    organizationId,
  });
}

/**
 * Fetch execution logs for a rule
 */
export async function getFlowRuleExecutions(
  id: string,
  params?: { page?: number; limit?: number },
  organizationId?: string
): Promise<PaginatedFlowRuleExecutions> {
  const queryParams: Record<string, string | number | undefined> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;

  const response = await apiClient.get<
    | FlowRuleExecutionItem[]
    | {
        executions: FlowRuleExecutionItem[];
        total: number;
        page: number;
        limit: number;
      }
  >(`/flow-rules/${id}/executions`, {
    params: queryParams as Record<string, string | undefined>,
    organizationId,
  });

  const raw = response.data as unknown as
    | {
        executions?: FlowRuleExecutionItem[];
        total?: number;
        page?: number;
        limit?: number;
      }
    | FlowRuleExecutionItem[];
  const execsList: FlowRuleExecutionItem[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { executions?: FlowRuleExecutionItem[] })?.executions)
      ? (raw as { executions: FlowRuleExecutionItem[] }).executions
      : [];

  const total =
    typeof (raw as { total?: number })?.total === "number"
      ? (raw as { total: number }).total
      : (response.meta?.totalCount ?? execsList.length);

  const page =
    typeof (raw as { page?: number })?.page === "number"
      ? (raw as { page: number }).page
      : (response.meta?.page ?? 1);
  const limit =
    typeof (raw as { limit?: number })?.limit === "number"
      ? (raw as { limit: number }).limit
      : (response.meta?.limit ?? 20);

  return {
    executions: execsList,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Test a rule simulation
 */
export async function testFlowRule(
  id: string,
  payload?: TestFlowRuleInput,
  organizationId?: string
): Promise<TestFlowRuleResult> {
  const response = await apiClient.post<TestFlowRuleResult>(
    `/flow-rules/${id}/test`,
    payload || {},
    { organizationId }
  );
  return response.data;
}
