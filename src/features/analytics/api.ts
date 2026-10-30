import { apiClient } from "@/lib/api/client";
import type {
  TimeframeFilter,
  AnalyticsOverview,
  CashflowPoint,
  ServiceProfitability,
  StaffProductivity,
  CustomerIntelligence,
} from "./types";

export async function getAnalyticsOverview(
  timeframe?: TimeframeFilter,
  organizationId?: string
): Promise<AnalyticsOverview> {
  const response = await apiClient.get<AnalyticsOverview>("/analytics/overview", {
    params: { timeframe },
    organizationId,
  });
  return response.data;
}

export async function getCashflowMetrics(
  timeframe?: TimeframeFilter,
  organizationId?: string
): Promise<CashflowPoint[]> {
  const response = await apiClient.get<CashflowPoint[]>("/analytics/cashflow", {
    params: { timeframe },
    organizationId,
  });
  return response.data;
}

export async function getServiceProfitability(
  timeframe?: TimeframeFilter,
  organizationId?: string
): Promise<ServiceProfitability[]> {
  const response = await apiClient.get<ServiceProfitability[]>("/analytics/services", {
    params: { timeframe },
    organizationId,
  });
  return response.data;
}

export async function getStaffProductivity(
  timeframe?: TimeframeFilter,
  organizationId?: string
): Promise<StaffProductivity[]> {
  const response = await apiClient.get<StaffProductivity[]>("/analytics/staff", {
    params: { timeframe },
    organizationId,
  });
  return response.data;
}

export async function getCustomerIntelligence(
  timeframe?: TimeframeFilter,
  organizationId?: string
): Promise<CustomerIntelligence> {
  const response = await apiClient.get<CustomerIntelligence>("/analytics/customers", {
    params: { timeframe },
    organizationId,
  });
  return response.data;
}

export async function downloadAnalyticsCsv(
  timeframe?: TimeframeFilter,
  organizationId?: string
): Promise<void> {
  const response = await apiClient.get<string>("/analytics/export", {
    params: { timeframe },
    organizationId,
  });

  const csvText = typeof response.data === "string" ? response.data : String(response.data || "");
  const blob = new Blob([csvText], {
    type: "text/csv;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `flowpilot-analytics-${timeframe || "30d"}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
