/**
 * Core User entity contract
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  createdAt: string;
}

/**
 * Workspace membership roles for multi-tenant organizations
 */
export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "BILLING";

/**
 * Summary of an organization membership associated with the current user session
 */
export interface OrganizationMembershipSummary {
  organizationId: string;
  organizationName: string;
  role: WorkspaceRole;
}

/**
 * Session contract returned by the authentication verification endpoint
 */
export interface AuthSession {
  user: User;
  activeOrganizationId: string | null;
  memberships: OrganizationMembershipSummary[];
}

/**
 * Authentication state machine status
 */
export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";
