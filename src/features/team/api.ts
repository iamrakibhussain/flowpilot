import { apiClient } from "@/lib/api/client";
import type {
  TeamMemberItem,
  TeamInvitationItem,
  SendInvitationPayload,
  VerifyInvitationResponse,
  AcceptInvitationPayload,
  Role,
} from "./types";

/**
 * Fetch all workspace team members
 */
export async function getTeamMembers(organizationId?: string): Promise<TeamMemberItem[]> {
  const response = await apiClient.get<TeamMemberItem[]>("/team/members", {
    organizationId,
  });
  return response.data;
}

/**
 * Fetch all pending workspace invitations
 */
export async function getTeamInvitations(organizationId?: string): Promise<TeamInvitationItem[]> {
  const response = await apiClient.get<TeamInvitationItem[]>("/team/invitations", {
    organizationId,
  });
  return response.data;
}

/**
 * Dispatch an invitation to join workspace with specific role
 */
export async function sendTeamInvitation(
  payload: SendInvitationPayload,
  organizationId?: string
): Promise<TeamInvitationItem> {
  const response = await apiClient.post<TeamInvitationItem>("/team/invitations", payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Revoke a pending invitation
 */
export async function revokeTeamInvitation(
  invitationId: string,
  organizationId?: string
): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(
    `/team/invitations/${invitationId}`,
    {
      organizationId,
    }
  );
  return response.data;
}

/**
 * Update a member's role (OWNER, ADMIN, MEMBER, BILLING)
 */
export async function updateMemberRole(
  membershipId: string,
  role: Role,
  organizationId?: string
): Promise<TeamMemberItem> {
  const response = await apiClient.patch<TeamMemberItem>(
    `/team/members/${membershipId}/role`,
    { role },
    {
      organizationId,
    }
  );
  return response.data;
}

/**
 * Remove a member from the workspace
 */
export async function removeTeamMember(
  membershipId: string,
  organizationId?: string
): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(`/team/members/${membershipId}`, {
    organizationId,
  });
  return response.data;
}

/**
 * Public: Verify an invitation token before accepting
 */
export async function verifyInvitation(token: string): Promise<VerifyInvitationResponse> {
  const response = await apiClient.get<VerifyInvitationResponse>(
    `/team/invitations/verify/${encodeURIComponent(token)}`
  );
  return response.data;
}

/**
 * Public: Accept an invitation and gain workspace access
 */
export async function acceptInvitation(
  payload: AcceptInvitationPayload
): Promise<{ user: { id: string; email: string; name: string }; activeOrganizationId: string }> {
  const response = await apiClient.post<{
    user: { id: string; email: string; name: string };
    activeOrganizationId: string;
  }>("/team/invitations/accept", payload);
  return response.data;
}
