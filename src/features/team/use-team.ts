"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import {
  getTeamMembers,
  getTeamInvitations,
  sendTeamInvitation,
  revokeTeamInvitation,
  updateMemberRole,
  removeTeamMember,
  verifyInvitation,
  acceptInvitation,
} from "./api";
import type { SendInvitationPayload, AcceptInvitationPayload, Role } from "./types";

export const teamKeys = {
  all: ["team"] as const,
  members: (orgId?: string) => [...teamKeys.all, "members", orgId] as const,
  invitations: (orgId?: string) => [...teamKeys.all, "invitations", orgId] as const,
  verification: (token?: string) => [...teamKeys.all, "verify", token] as const,
};

function useResolvedOrgId(): string {
  const { organizationId } = useWorkspaceSession();
  if (organizationId) return organizationId;
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem("flowpilot_active_org");
    if (cached) return cached;
  }
  return "";
}

export function useTeamMembers(explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: teamKeys.members(organizationId),
    queryFn: () => getTeamMembers(organizationId),
    enabled: Boolean(organizationId),
    staleTime: 1000 * 30, // 30s
  });
}

export function useTeamInvitations(explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: teamKeys.invitations(organizationId),
    queryFn: () => getTeamInvitations(organizationId),
    enabled: Boolean(organizationId),
    staleTime: 1000 * 30,
  });
}

export function useSendTeamInvitation() {
  const queryClient = useQueryClient();
  const resolvedOrgId = useResolvedOrgId();

  return useMutation({
    mutationFn: (payload: SendInvitationPayload) => sendTeamInvitation(payload, resolvedOrgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}

export function useRevokeTeamInvitation() {
  const queryClient = useQueryClient();
  const resolvedOrgId = useResolvedOrgId();

  return useMutation({
    mutationFn: (invitationId: string) => revokeTeamInvitation(invitationId, resolvedOrgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invitations(resolvedOrgId) });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  const resolvedOrgId = useResolvedOrgId();

  return useMutation({
    mutationFn: ({ membershipId, role }: { membershipId: string; role: Role }) =>
      updateMemberRole(membershipId, role, resolvedOrgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(resolvedOrgId) });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  const resolvedOrgId = useResolvedOrgId();

  return useMutation({
    mutationFn: (membershipId: string) => removeTeamMember(membershipId, resolvedOrgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}

export function useVerifyInvitation(token: string) {
  return useQuery({
    queryKey: teamKeys.verification(token),
    queryFn: () => verifyInvitation(token),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AcceptInvitationPayload) => acceptInvitation(payload),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
