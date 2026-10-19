import { apiClient } from "@/lib/api/client";
import type {
  AuthSession,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
  ChangePasswordPayload,
  DeleteAccountPayload,
} from "./types";

/**
 * Register a new user account, organization workspace, and owner membership
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthSession> {
  const response = await apiClient.post<AuthSession>("/auth/register", payload);
  return response.data;
}

/**
 * Sign in using user credentials and establish a secure session
 */
export async function loginUser(payload: LoginPayload): Promise<AuthSession> {
  const response = await apiClient.post<AuthSession>("/auth/login", payload);
  return response.data;
}

/**
 * Retrieve the current authenticated user identity and active workspace memberships
 */
export async function getCurrentUser(): Promise<AuthSession> {
  const response = await apiClient.get<AuthSession>("/auth/me");
  return response.data;
}

/**
 * Terminate the active session on both client and server
 */
export async function logoutUser(options?: { allDevices?: boolean }): Promise<void> {
  await apiClient.post("/auth/logout", options ? { allDevices: options.allDevices } : {});
}

/**
 * Request a password reset link (safe against email enumeration)
 */
export async function requestPasswordReset(
  payload: ForgotPasswordPayload
): Promise<{ message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    "/auth/forgot-password",
    payload
  );
  return response.data;
}

/**
 * Reset password using the one-time token received via email
 */
export async function resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    "/auth/reset-password",
    payload
  );
  return response.data;
}

/**
 * Trigger sending a 6-digit email verification code to the authenticated user
 */
export async function sendEmailVerification(): Promise<{
  message: string;
  isAlreadyVerified?: boolean;
}> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    isAlreadyVerified?: boolean;
  }>("/auth/send-verification");
  return response.data;
}

/**
 * Verify email address with 6-digit OTP code
 */
export async function verifyEmail(
  payload: VerifyEmailPayload
): Promise<{ message: string; emailVerifiedAt: string; isEmailVerified?: boolean }> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    emailVerifiedAt: string;
    isEmailVerified?: boolean;
  }>("/auth/verify-email", payload);
  return response.data;
}

/**
 * Change account password from an authenticated session
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    "/auth/change-password",
    payload
  );
  return response.data;
}

/**
 * Permanently delete authenticated account and sole-owned workspaces
 */
export async function deleteAccount(payload: DeleteAccountPayload): Promise<{ message: string }> {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    "/auth/account",
    payload
  );
  return response.data;
}
