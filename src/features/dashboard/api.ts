import { apiClient } from "@/lib/api/client";
import type {
  DashboardMetricsResponse,
  DashboardActivityItem,
  TodayScheduleItem,
  StaffOnDutyItem,
  CustomerOption,
  TimeframeType,
  CreateInvoicePayload,
  CreateAppointmentPayload,
  CreateCustomerPayload,
} from "./types";

/**
 * Fetch executive dashboard metrics and telemetry from the backend database
 */
export async function getDashboardMetrics(
  timeframe: TimeframeType = "30d",
  organizationId?: string
): Promise<DashboardMetricsResponse> {
  const response = await apiClient.get<DashboardMetricsResponse>("/dashboard/metrics", {
    params: { timeframe },
    organizationId,
  });
  return response.data;
}

/**
 * Fetch recent multi-tenant operations activities
 */
export async function getDashboardActivities(
  type: "all" | "invoices" | "appointments" = "all",
  limit = 10,
  organizationId?: string
): Promise<DashboardActivityItem[]> {
  const response = await apiClient.get<DashboardActivityItem[]>("/dashboard/activities", {
    params: { type, limit },
    organizationId,
  });
  return response.data;
}

/**
 * Fetch today's schedule agenda
 */
export async function getTodaySchedule(organizationId?: string): Promise<TodayScheduleItem[]> {
  const response = await apiClient.get<TodayScheduleItem[]>("/dashboard/schedule/today", {
    organizationId,
  });
  return response.data;
}

/**
 * Fetch on-duty staff members and current availability
 */
export async function getOnDutyStaff(organizationId?: string): Promise<StaffOnDutyItem[]> {
  const response = await apiClient.get<StaffOnDutyItem[]>("/dashboard/staff/on-duty", {
    organizationId,
  });
  return response.data;
}

/**
 * Fetch customer list for modal selectors
 */
export async function getDashboardCustomers(organizationId?: string): Promise<CustomerOption[]> {
  const response = await apiClient.get<CustomerOption[]>("/dashboard/customers", {
    organizationId,
  });
  return response.data;
}

/**
 * Create a new live invoice in the database
 */
export async function createDashboardInvoice(
  payload: CreateInvoicePayload,
  organizationId?: string
): Promise<{ id: string; invoiceNumber?: string }> {
  const response = await apiClient.post<{ id: string; invoiceNumber?: string }>(
    "/dashboard/invoices",
    payload,
    { organizationId }
  );
  return response.data;
}

/**
 * Create a new live appointment in the database
 */
export async function createDashboardAppointment(
  payload: CreateAppointmentPayload,
  organizationId?: string
): Promise<{ id: string; title: string }> {
  const response = await apiClient.post<{ id: string; title: string }>(
    "/dashboard/appointments",
    payload,
    { organizationId }
  );
  return response.data;
}

/**
 * Create a new live customer in the database
 */
export async function createDashboardCustomer(
  payload: CreateCustomerPayload,
  organizationId?: string
): Promise<{ id: string; name: string }> {
  const response = await apiClient.post<{ id: string; name: string }>(
    "/dashboard/customers",
    payload,
    { organizationId }
  );
  return response.data;
}
