"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import {
  getDashboardMetrics,
  getDashboardActivities,
  getTodaySchedule,
  getOnDutyStaff,
  getDashboardCustomers,
  createDashboardInvoice,
  createDashboardAppointment,
  createDashboardCustomer,
} from "./api";
import type {
  TimeframeType,
  DashboardMetricsResponse,
  CreateInvoicePayload,
  CreateAppointmentPayload,
  CreateCustomerPayload,
} from "./types";

// Clean zero metrics template for new workspaces or initial data state
export const emptyMetrics: Record<TimeframeType, DashboardMetricsResponse> = {
  "7d": {
    timeframe: "7d",
    revenue: "$0.00",
    revenueGrowth: "+0.0%",
    sparklineD: "M0,20 L100,20",
    sparklineFill: "M0,20 L100,20 L100,25 L0,25 Z",
    clients: "0",
    clientsGrowth: "0 this week",
    appointments: "0",
    appointmentsToday: "0 today",
    appointmentsUpcoming: "0 upcoming",
    responseTime: "0 min",
    periodTotalRevenue: "$0.00",
    periodTotalAppointments: "0 Bookings",
    dailyAvgRevenue: "$0.00",
    dailyAvgAppointments: "0.0 / day",
    chartPathD: "M10,140 L488,140",
    chartAreaD: "M10,140 L488,140 L488,160 L10,160 Z",
    xAxisLabels: [
      { full: "Mon", short: "M" },
      { full: "Tue", short: "T" },
      { full: "Wed", short: "W" },
      { full: "Thu", short: "T" },
      { full: "Fri", short: "F" },
      { full: "Sat", short: "S" },
      { full: "Today", short: "Now" },
    ],
    dataPoints: [
      { label: "Mon", revenue: "$0.00", appointments: "0 Bookings", cx: 60, cy: 140 },
      { label: "Wed", revenue: "$0.00", appointments: "0 Bookings", cx: 200, cy: 140 },
      { label: "Fri", revenue: "$0.00", appointments: "0 Bookings", cx: 350, cy: 140 },
      { label: "Today", revenue: "$0.00", appointments: "0 Bookings", cx: 488, cy: 140 },
    ],
    receivables: {
      total: "$0.00",
      collectionEfficiency: "100.0%",
      avgDso: "0 Days",
      settled: { amount: "$0.00", percentage: 0, count: 0 },
      pending: { amount: "$0.00", percentage: 0, count: 0 },
      overdue: { amount: "$0.00", percentage: 0, count: 0 },
    },
  },
  "30d": {
    timeframe: "30d",
    revenue: "$0.00",
    revenueGrowth: "+0.0%",
    sparklineD: "M0,20 L100,20",
    sparklineFill: "M0,20 L100,20 L100,25 L0,25 Z",
    clients: "0",
    clientsGrowth: "0 this month",
    appointments: "0",
    appointmentsToday: "0 today",
    appointmentsUpcoming: "0 upcoming",
    responseTime: "0 min",
    periodTotalRevenue: "$0.00",
    periodTotalAppointments: "0 Bookings",
    dailyAvgRevenue: "$0.00",
    dailyAvgAppointments: "0.0 / day",
    chartPathD: "M10,140 L488,140",
    chartAreaD: "M10,140 L488,140 L488,160 L10,160 Z",
    xAxisLabels: [
      { full: "Week 1", short: "W1" },
      { full: "Week 2", short: "W2" },
      { full: "Week 3", short: "W3" },
      { full: "Week 4", short: "W4" },
      { full: "Current (W5)", short: "W5" },
    ],
    dataPoints: [
      { label: "Week 1", revenue: "$0.00", appointments: "0 Bookings", cx: 80, cy: 140 },
      { label: "Week 2", revenue: "$0.00", appointments: "0 Bookings", cx: 180, cy: 140 },
      { label: "Week 3", revenue: "$0.00", appointments: "0 Bookings", cx: 280, cy: 140 },
      { label: "Week 4", revenue: "$0.00", appointments: "0 Bookings", cx: 390, cy: 140 },
      { label: "Current (Week 5)", revenue: "$0.00", appointments: "0 Bookings", cx: 488, cy: 140 },
    ],
    receivables: {
      total: "$0.00",
      collectionEfficiency: "100.0%",
      avgDso: "0 Days",
      settled: { amount: "$0.00", percentage: 0, count: 0 },
      pending: { amount: "$0.00", percentage: 0, count: 0 },
      overdue: { amount: "$0.00", percentage: 0, count: 0 },
    },
  },
  "90d": {
    timeframe: "90d",
    revenue: "$0.00",
    revenueGrowth: "+0.0%",
    sparklineD: "M0,20 L100,20",
    sparklineFill: "M0,20 L100,20 L100,25 L0,25 Z",
    clients: "0",
    clientsGrowth: "0 this quarter",
    appointments: "0",
    appointmentsToday: "0 today",
    appointmentsUpcoming: "0 upcoming",
    responseTime: "0 min",
    periodTotalRevenue: "$0.00",
    periodTotalAppointments: "0 Bookings",
    dailyAvgRevenue: "$0.00",
    dailyAvgAppointments: "0.0 / day",
    chartPathD: "M10,140 L488,140",
    chartAreaD: "M10,140 L488,140 L488,160 L10,160 Z",
    xAxisLabels: [
      { full: "Month 1", short: "M1" },
      { full: "Month 2", short: "M2" },
      { full: "Month 3", short: "M3" },
    ],
    dataPoints: [
      { label: "Month 1", revenue: "$0.00", appointments: "0 Bookings", cx: 120, cy: 140 },
      { label: "Month 2", revenue: "$0.00", appointments: "0 Bookings", cx: 310, cy: 140 },
      { label: "Month 3", revenue: "$0.00", appointments: "0 Bookings", cx: 488, cy: 140 },
    ],
    receivables: {
      total: "$0.00",
      collectionEfficiency: "100.0%",
      avgDso: "0 Days",
      settled: { amount: "$0.00", percentage: 0, count: 0 },
      pending: { amount: "$0.00", percentage: 0, count: 0 },
      overdue: { amount: "$0.00", percentage: 0, count: 0 },
    },
  },
};

export const fallbackMetrics = emptyMetrics;

/**
 * Helper to resolve active organization ID from session or localStorage
 */
function useResolvedOrgId(): string | undefined {
  const { session } = useWorkspaceSession();
  const cachedOrgId =
    typeof window !== "undefined" ? localStorage.getItem("flowpilot_active_org") : null;
  return session?.activeOrganizationId ?? cachedOrgId ?? undefined;
}

/**
 * Hook to retrieve live dashboard metrics from the database with automatic caching
 */
export function useDashboardMetrics(timeframe: TimeframeType) {
  const orgId = useResolvedOrgId();

  return useQuery({
    queryKey: queryKeys.dashboard.metrics(timeframe, orgId),
    queryFn: async () => {
      try {
        return await getDashboardMetrics(timeframe, orgId);
      } catch (err) {
        console.warn("Falling back to empty metrics for dashboard:", err);
        return emptyMetrics[timeframe];
      }
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to retrieve live operations activity queue
 */
export function useDashboardActivities(type: "all" | "invoices" | "appointments" = "all") {
  const orgId = useResolvedOrgId();

  return useQuery({
    queryKey: queryKeys.dashboard.activities(type, orgId),
    queryFn: async () => {
      try {
        return await getDashboardActivities(type, 10, orgId);
      } catch (err) {
        console.warn("Falling back to local cache for dashboard activities:", err);
        return [];
      }
    },
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to retrieve today's schedule agenda
 */
export function useTodayScheduleData() {
  const orgId = useResolvedOrgId();

  return useQuery({
    queryKey: queryKeys.dashboard.schedule(orgId),
    queryFn: async () => {
      try {
        return await getTodaySchedule(orgId);
      } catch (err) {
        console.warn("Falling back to local cache for today schedule:", err);
        return [];
      }
    },
    staleTime: 1000 * 60,
  });
}

/**
 * Hook to retrieve on-duty staff specialists
 */
export function useOnDutyStaffData() {
  const orgId = useResolvedOrgId();

  return useQuery({
    queryKey: queryKeys.dashboard.staff(orgId),
    queryFn: async () => {
      try {
        return await getOnDutyStaff(orgId);
      } catch (err) {
        console.warn("Falling back to local cache for on-duty staff:", err);
        return [];
      }
    },
    staleTime: 1000 * 60,
  });
}

/**
 * Hook to retrieve customer list for modals
 */
export function useDashboardCustomersData() {
  const orgId = useResolvedOrgId();

  return useQuery({
    queryKey: [...queryKeys.customers.all, "options", orgId ?? "default"],
    queryFn: async () => {
      try {
        return await getDashboardCustomers(orgId);
      } catch (err) {
        console.warn("Falling back for customers list:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Mutations to create Live Invoices, Appointments, and Customers
 */
export function useDashboardMutations() {
  const queryClient = useQueryClient();
  const orgId = useResolvedOrgId();

  const createInvoiceMutation = useMutation({
    mutationFn: (payload: CreateInvoicePayload) => createDashboardInvoice(payload, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => createDashboardAppointment(payload, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: (payload: CreateCustomerPayload) => createDashboardCustomer(payload, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });

  return {
    createInvoice: createInvoiceMutation.mutateAsync,
    isCreatingInvoice: createInvoiceMutation.isPending,
    createAppointment: createAppointmentMutation.mutateAsync,
    isCreatingAppointment: createAppointmentMutation.isPending,
    createCustomer: createCustomerMutation.mutateAsync,
    isCreatingCustomer: createCustomerMutation.isPending,
  };
}
