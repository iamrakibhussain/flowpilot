import { apiClient } from "@/lib/api/client";
import type {
  AppointmentListItem,
  ListAppointmentsParams,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
  RescheduleAppointmentPayload,
  CheckConflictPayload,
  ConflictCheckResult,
  AppointmentStatusType,
  ServiceItem,
  StaffItem,
} from "./types";

/**
 * Fetch list of appointments with optional date range and filters
 */
export async function getAppointments(
  params?: ListAppointmentsParams,
  organizationId?: string
): Promise<AppointmentListItem[]> {
  const queryParams: Record<string, string | undefined> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.customerId) queryParams.customerId = params.customerId;
  if (params?.staffMemberId) queryParams.staffMemberId = params.staffMemberId;
  if (params?.serviceId) queryParams.serviceId = params.serviceId;
  if (params?.status) queryParams.status = params.status;
  if (params?.type) queryParams.type = params.type;
  if (params?.search) queryParams.search = params.search;

  const response = await apiClient.get<AppointmentListItem[]>("/appointments", {
    params: queryParams,
    organizationId,
  });
  return response.data;
}

/**
 * Fetch single appointment by ID
 */
export async function getAppointmentById(
  id: string,
  organizationId?: string
): Promise<AppointmentListItem> {
  const response = await apiClient.get<AppointmentListItem>(`/appointments/${id}`, {
    organizationId,
  });
  return response.data;
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  payload: CreateAppointmentPayload,
  organizationId?: string
): Promise<AppointmentListItem> {
  const response = await apiClient.post<AppointmentListItem>("/appointments", payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Update appointment details
 */
export async function updateAppointment(
  id: string,
  payload: UpdateAppointmentPayload,
  organizationId?: string
): Promise<AppointmentListItem> {
  const response = await apiClient.patch<AppointmentListItem>(`/appointments/${id}`, payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Reschedule appointment with conflict check
 */
export async function rescheduleAppointment(
  id: string,
  payload: RescheduleAppointmentPayload,
  organizationId?: string
): Promise<AppointmentListItem> {
  const response = await apiClient.patch<AppointmentListItem>(
    `/appointments/${id}/reschedule`,
    payload,
    { organizationId }
  );
  return response.data;
}

/**
 * Transition status of an appointment
 */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatusType,
  notes?: string,
  organizationId?: string
): Promise<AppointmentListItem> {
  const response = await apiClient.patch<AppointmentListItem>(
    `/appointments/${id}/status`,
    { status, notes },
    { organizationId }
  );
  return response.data;
}

/**
 * Pre-flight check for schedule conflicts
 */
export async function checkAppointmentConflict(
  payload: CheckConflictPayload,
  organizationId?: string
): Promise<ConflictCheckResult> {
  const response = await apiClient.post<ConflictCheckResult>(
    "/appointments/check-conflict",
    payload,
    { organizationId }
  );
  return response.data;
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(
  id: string,
  reason?: string,
  organizationId?: string
): Promise<AppointmentListItem> {
  const response = await apiClient.delete<AppointmentListItem>(`/appointments/${id}`, {
    data: { reason },
    organizationId,
  });
  return response.data;
}

/**
 * Fetch available services for the organization
 */
export async function getServices(
  activeOnly = false,
  organizationId?: string
): Promise<ServiceItem[]> {
  const response = await apiClient.get<ServiceItem[]>("/services", {
    params: { activeOnly: activeOnly ? "true" : undefined },
    organizationId,
  });
  return response.data;
}

/**
 * Fetch staff members for the organization
 */
export async function getStaffMembers(organizationId?: string): Promise<StaffItem[]> {
  const response = await apiClient.get<StaffItem[]>("/staff", {
    organizationId,
  });
  return response.data;
}
