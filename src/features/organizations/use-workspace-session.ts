"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/features/auth/api";
import { queryKeys } from "@/lib/api/query-keys";
import type { AuthSession, OrganizationMembershipSummary } from "@/features/auth/types";

export interface WorkspaceSessionState {
  session: AuthSession | null;
  userName: string;
  userEmail: string;
  organizationName: string;
  organizationRole: string;
  memberships: OrganizationMembershipSummary[];
  isLoading: boolean;
}

export function useWorkspaceSession(): WorkspaceSessionState {
  // Use TanStack Query to deduplicate requests across all header/sidebar/dashboard components.
  // The user remains logged in until they explicitly click the logout button.
  const { data: session, isLoading } = useQuery<AuthSession>({
    queryKey: queryKeys.auth.session(),
    queryFn: async () => {
      const data = await getCurrentUser();
      if (data?.activeOrganizationId && typeof window !== "undefined") {
        localStorage.setItem("flowpilot_active_org", data.activeOrganizationId);
      }
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache time before refreshing in background
    gcTime: 1000 * 60 * 60 * 24, // Retain session in client memory
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const activeMembership = React.useMemo(() => {
    if (!session || !session.memberships?.length) return null;
    return (
      session.memberships.find((m) => m.organizationId === session.activeOrganizationId) ||
      session.memberships[0]
    );
  }, [session]);

  const organizationName = activeMembership?.organizationName || "Company Workspace";
  const organizationRole = activeMembership?.role || "OWNER";
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const memberships = session?.memberships || [];

  return {
    session: session ?? null,
    userName,
    userEmail,
    organizationName,
    organizationRole,
    memberships,
    isLoading,
  };
}

