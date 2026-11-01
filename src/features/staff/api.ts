import { apiClient } from "@/lib/api/client";
import type {
  StaffItem,
  StaffDetailedItem,
  StaffMetrics,
  StaffFilterParams,
  CreateStaffPayload,
  UpdateStaffPayload,
  StaffStatus,
  BlockedTimeItem,
  CreateBlockedTimePayload,
  UpdateBlockedTimePayload,
  BlockedTimeFilterParams,
} from "./types";

/**
 * Fetch staff members list with optional search & filters
 */
export async function getStaff(
  params?: StaffFilterParams,
  organizationId?: string
): Promise<StaffItem[]> {
  const queryParams: Record<string, string | undefined> = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.status) queryParams.status = params.status;
  if (params?.tier) queryParams.tier = params.tier;
  if (params?.serviceId) queryParams.serviceId = params.serviceId;

  const response = await apiClient.get<StaffItem[]>("/staff", {
    params: queryParams,
    organizationId,
  });
  return response.data;
}

/**
 * Fetch aggregated workforce capacity & revenue metrics
 */
export async function getStaffMetrics(organizationId?: string): Promise<StaffMetrics> {
  const response = await apiClient.get<StaffMetrics>("/staff/metrics", {
    organizationId,
  });
  return response.data;
}

/**
 * Fetch 360 detailed staff profile with agenda & appointments
 */
export async function getStaffById(
  id: string,
  organizationId?: string
): Promise<StaffDetailedItem> {
  const response = await apiClient.get<StaffDetailedItem>(`/staff/${id}`, {
    organizationId,
  });
  return response.data;
}

/**
 * Provision new staff profile
 */
export async function createStaff(
  payload: CreateStaffPayload,
  organizationId?: string
): Promise<StaffItem> {
  const response = await apiClient.post<StaffItem>("/staff", payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Update staff details & qualifications
 */
export async function updateStaff(
  id: string,
  payload: UpdateStaffPayload,
  organizationId?: string
): Promise<StaffItem> {
  const response = await apiClient.patch<StaffItem>(`/staff/${id}`, payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Fast 1-tap live status switch
 */
export async function updateStaffStatus(
  id: string,
  status: StaffStatus,
  organizationId?: string
): Promise<StaffItem> {
  const response = await apiClient.patch<StaffItem>(
    `/staff/${id}/status`,
    { status },
    { organizationId }
  );
  return response.data;
}

/**
 * Safe delete staff member with appointment protection
 */
export async function deleteStaff(
  id: string,
  organizationId?: string
): Promise<{ success: boolean; unassignedAppointmentsCount: number }> {
  const response = await apiClient.delete<{
    success: boolean;
    unassignedAppointmentsCount: number;
  }>(`/staff/${id}`, { organizationId });
  return response.data;
}

/**
 * Fetch blocked time intervals (breaks, holidays, leaves)
 */
export async function getBlockedTimes(
  params?: BlockedTimeFilterParams,
  organizationId?: string
): Promise<BlockedTimeItem[]> {
  const queryParams: Record<string, string | undefined> = {};
  if (params?.staffMemberId) queryParams.staffMemberId = params.staffMemberId;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;

  const response = await apiClient.get<BlockedTimeItem[]>("/staff/blocked-time", {
    params: queryParams,
    organizationId,
  });
  return response.data;
}

/**
 * Create a new blocked time entry or company holiday
 */
export async function createBlockedTime(
  payload: CreateBlockedTimePayload,
  organizationId?: string
): Promise<BlockedTimeItem> {
  const response = await apiClient.post<BlockedTimeItem>("/staff/blocked-time", payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Update an existing blocked time entry
 */
export async function updateBlockedTime(
  id: string,
  payload: UpdateBlockedTimePayload,
  organizationId?: string
): Promise<BlockedTimeItem> {
  const response = await apiClient.patch<BlockedTimeItem>(`/staff/blocked-time/${id}`, payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Delete a blocked time entry
 */
export async function deleteBlockedTime(
  id: string,
  organizationId?: string
): Promise<{ success: boolean; id: string }> {
  const response = await apiClient.delete<{ success: boolean; id: string }>(
    `/staff/blocked-time/${id}`,
    { organizationId }
  );
  return response.data;
}
