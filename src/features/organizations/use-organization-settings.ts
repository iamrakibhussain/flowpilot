"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useWorkspaceSession } from "./use-workspace-session";
import {
  getOrganizationSettings,
  updateOrganizationSettings,
  checkSlugAvailability,
} from "./settings-api";
import type { OrganizationSettings, UpdateOrganizationSettingsPayload } from "./types";

/**
 * Hook to retrieve full organization configuration and branding settings
 */
export function useOrganizationSettings() {
  const { organizationId } = useWorkspaceSession();

  return useQuery<OrganizationSettings>({
    queryKey: queryKeys.organizations.settings(organizationId),
    queryFn: () => getOrganizationSettings(organizationId),
    enabled: Boolean(organizationId),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to mutate organization settings with cross-cache invalidation
 */
export function useUpdateOrganizationSettings() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation<OrganizationSettings, Error, UpdateOrganizationSettingsPayload>({
    mutationFn: (payload) => updateOrganizationSettings(payload, organizationId),
    onSuccess: (updatedSettings) => {
      // Invalidate settings query
      queryClient.setQueryData(queryKeys.organizations.settings(organizationId), updatedSettings);

      // Invalidate session so dashboard sidebar & header update brand name immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });

      // Invalidate invoices so currency and logo propagate
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });

      // Invalidate services and analytics
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

/**
 * Hook for checking slug availability on-the-fly
 */
export function useCheckSlug() {
  const { organizationId } = useWorkspaceSession();

  return useMutation<{ available: boolean; slug: string }, Error, string>({
    mutationFn: (slug) => checkSlugAvailability(slug, organizationId),
  });
}
