import { apiClient } from "@/lib/api/client";
import type {
  OrganizationSettings,
  UpdateOrganizationSettingsPayload,
  WorkspaceAuditLog,
} from "./types";

/**
 * Fetch organization configuration & brand settings
 */
export async function getOrganizationSettings(
  organizationId?: string
): Promise<OrganizationSettings> {
  const response = await apiClient.get<OrganizationSettings>("/organizations/settings", {
    organizationId,
  });
  return response.data;
}

/**
 * Update organization configuration & brand settings (Restricted to OWNER / ADMIN)
 */
export async function updateOrganizationSettings(
  payload: UpdateOrganizationSettingsPayload,
  organizationId?: string
): Promise<OrganizationSettings> {
  const response = await apiClient.patch<OrganizationSettings>("/organizations/settings", payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Check whether a custom public booking slug is available
 */
export async function checkSlugAvailability(
  slug: string,
  organizationId?: string
): Promise<{ available: boolean; slug: string }> {
  const response = await apiClient.post<{ available: boolean; slug: string }>(
    "/organizations/settings/check-slug",
    { slug },
    { organizationId }
  );
  return response.data;
}

/**
 * Fetch workspace audit logs (settings changes)
 */
export async function getWorkspaceAuditLogs(
  limit = 20,
  organizationId?: string
): Promise<WorkspaceAuditLog[]> {
  const response = await apiClient.get<WorkspaceAuditLog[]>("/organizations/audit-logs", {
    organizationId,
    params: { limit },
  });
  return response.data;
}
