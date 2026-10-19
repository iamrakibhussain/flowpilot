/**
 * Core User entity contract matching FlowPilot backend
 */
export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  isEmailVerified?: boolean;
  createdAt?: string;
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
 * Session contract returned by the authentication endpoints (/auth/me, /auth/login, /auth/register)
 */
export interface AuthSession {
  user: User;
  activeOrganizationId: string | null;
  memberships: OrganizationMembershipSummary[];
}

/**
 * Registration API input payload
 */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

/**
 * Login API input payload
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Authentication state machine status
 */
export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface VerifyEmailPayload {
  code: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountPayload {
  password: string;
  confirmationText: string;
}
