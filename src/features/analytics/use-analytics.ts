"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import {
  getAnalyticsOverview,
  getCashflowMetrics,
  getServiceProfitability,
  getStaffProductivity,
  getCustomerIntelligence,
} from "./api";
import type { TimeframeFilter } from "./types";

export function useAnalyticsOverview(timeframe: TimeframeFilter = "30d", explicitOrgId?: string) {
  const { organizationId: sessionOrgId } = useWorkspaceSession();
  const organizationId = explicitOrgId || sessionOrgId;

  return useQuery({
    queryKey: queryKeys.analytics.overview(timeframe, organizationId),
    queryFn: () => getAnalyticsOverview(timeframe, organizationId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: Boolean(organizationId),
  });
}

export function useCashflowMetrics(timeframe: TimeframeFilter = "30d", explicitOrgId?: string) {
  const { organizationId: sessionOrgId } = useWorkspaceSession();
  const organizationId = explicitOrgId || sessionOrgId;

  return useQuery({
    queryKey: queryKeys.analytics.cashflow(timeframe, organizationId),
    queryFn: () => getCashflowMetrics(timeframe, organizationId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(organizationId),
  });
}

export function useServiceProfitability(
  timeframe: TimeframeFilter = "30d",
  explicitOrgId?: string
) {
  const { organizationId: sessionOrgId } = useWorkspaceSession();
  const organizationId = explicitOrgId || sessionOrgId;

  return useQuery({
    queryKey: queryKeys.analytics.services(timeframe, organizationId),
    queryFn: () => getServiceProfitability(timeframe, organizationId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(organizationId),
  });
}

export function useStaffProductivity(timeframe: TimeframeFilter = "30d", explicitOrgId?: string) {
  const { organizationId: sessionOrgId } = useWorkspaceSession();
  const organizationId = explicitOrgId || sessionOrgId;

  return useQuery({
    queryKey: queryKeys.analytics.staff(timeframe, organizationId),
    queryFn: () => getStaffProductivity(timeframe, organizationId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(organizationId),
  });
}

export function useCustomerIntelligence(
  timeframe: TimeframeFilter = "30d",
  explicitOrgId?: string
) {
  const { organizationId: sessionOrgId } = useWorkspaceSession();
  const organizationId = explicitOrgId || sessionOrgId;

  return useQuery({
    queryKey: queryKeys.analytics.customers(timeframe, organizationId),
    queryFn: () => getCustomerIntelligence(timeframe, organizationId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(organizationId),
  });
}
