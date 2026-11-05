import { apiClient } from "@/lib/api/client";
import type {
  RecurringScheduleListItem,
  RecurringScheduleDetails,
  RecurringStatsResponse,
  CreateRecurringScheduleInput,
  UpdateRecurringScheduleInput,
  LogRetainerHoursInput,
  ListRecurringSchedulesQuery,
} from "./types";

export interface PaginatedRecurringSchedules {
  schedules: RecurringScheduleListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Fetch paginated recurring schedules with query filters
 */
export async function getRecurringSchedules(
  params?: ListRecurringSchedulesQuery,
  organizationId?: string
): Promise<PaginatedRecurringSchedules> {
  const queryParams: Record<string, string | undefined> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.customerId) queryParams.customerId = params.customerId;
  if (params?.frequency) queryParams.frequency = params.frequency;
  if (params?.search) queryParams.search = params.search;
  if (params?.page) queryParams.page = String(params.page);
  if (params?.limit) queryParams.limit = String(params.limit);

  const response = await apiClient.get<RecurringScheduleListItem[]>("/recurring", {
    params: queryParams,
    organizationId,
  });

  return {
    schedules: response.data,
    meta: {
      total: response.meta?.totalCount ?? response.data.length,
      page: response.meta?.page ?? 1,
      limit: response.meta?.limit ?? 20,
      totalPages: response.meta?.totalPages ?? 1,
    },
  };
}

/**
 * Fetch aggregate recurring billing statistics
 */
export async function getRecurringStats(organizationId?: string): Promise<RecurringStatsResponse> {
  const response = await apiClient.get<RecurringStatsResponse>("/recurring/stats", {
    organizationId,
  });
  return response.data;
}

/**
 * Fetch single recurring schedule with invoices and retainer logs
 */
export async function getRecurringScheduleById(
  id: string,
  organizationId?: string
): Promise<RecurringScheduleDetails> {
  const response = await apiClient.get<RecurringScheduleDetails>(`/recurring/${id}`, {
    organizationId,
  });
  return response.data;
}

/**
 * Create a new recurring schedule
 */
export async function createRecurringSchedule(
  payload: CreateRecurringScheduleInput,
  organizationId?: string
): Promise<RecurringScheduleListItem> {
  const response = await apiClient.post<RecurringScheduleListItem>("/recurring", payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Update an existing recurring schedule
 */
export async function updateRecurringSchedule(
  id: string,
  payload: UpdateRecurringScheduleInput,
  organizationId?: string
): Promise<RecurringScheduleListItem> {
  const response = await apiClient.patch<RecurringScheduleListItem>(`/recurring/${id}`, payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Pause a recurring schedule
 */
export async function pauseRecurringSchedule(
  id: string,
  organizationId?: string
): Promise<RecurringScheduleListItem> {
  const response = await apiClient.post<RecurringScheduleListItem>(
    `/recurring/${id}/pause`,
    undefined,
    {
      organizationId,
    }
  );
  return response.data;
}

/**
 * Resume a paused recurring schedule
 */
export async function resumeRecurringSchedule(
  id: string,
  organizationId?: string
): Promise<RecurringScheduleListItem> {
  const response = await apiClient.post<RecurringScheduleListItem>(
    `/recurring/${id}/resume`,
    undefined,
    {
      organizationId,
    }
  );
  return response.data;
}

/**
 * Cancel a recurring schedule
 */
export async function cancelRecurringSchedule(
  id: string,
  organizationId?: string
): Promise<RecurringScheduleListItem> {
  const response = await apiClient.post<RecurringScheduleListItem>(
    `/recurring/${id}/cancel`,
    undefined,
    {
      organizationId,
    }
  );
  return response.data;
}

/**
 * Log retainer hours against active cycle
 */
export async function logRetainerHours(
  scheduleId: string,
  payload: LogRetainerHoursInput,
  organizationId?: string
): Promise<{
  logId: string;
  hoursAllocated: number;
  hoursLogged: number;
  overageHours: number;
  hoursRemaining: number;
}> {
  const response = await apiClient.post<{
    logId: string;
    hoursAllocated: number;
    hoursLogged: number;
    overageHours: number;
    hoursRemaining: number;
  }>(`/recurring/${scheduleId}/retainer-hours`, payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Trigger immediate execution of due schedules
 */
export async function triggerProcessNow(organizationId?: string): Promise<{
  processedCount: number;
  invoicesCreated: number;
  completedSchedules: number;
  skipped?: boolean;
}> {
  const response = await apiClient.post<{
    processedCount: number;
    invoicesCreated: number;
    completedSchedules: number;
    skipped?: boolean;
  }>("/recurring/process-now", undefined, {
    organizationId,
  });
  return response.data;
}
