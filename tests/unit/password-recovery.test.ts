import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  requestPasswordReset,
  resetPassword,
  sendEmailVerification,
  verifyEmail,
  changePassword,
  deleteAccount,
} from "../../src/features/auth/api";
import { apiClient } from "../../src/lib/api/client";

describe("Password Recovery & Verification API Client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("requestPasswordReset", () => {
    it("dispatches POST /auth/forgot-password with the given email", async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          message:
            "If an account exists with this email, password reset instructions have been sent.",
        },
      } as never);

      const result = await requestPasswordReset({ email: "security@company.com" });

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "security@company.com",
      });
      expect(result.message).toContain("If an account exists");
    });
  });

  describe("resetPassword", () => {
    it("dispatches POST /auth/reset-password with token and new password", async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          message: "Password has been successfully reset. Please log in with your new password.",
        },
      } as never);

      const result = await resetPassword({
        token: "fedcba9876543210fedcba9876543210",
        password: "NewStrongPassword123!",
      });

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith("/auth/reset-password", {
        token: "fedcba9876543210fedcba9876543210",
        password: "NewStrongPassword123!",
      });
      expect(result.message).toContain("successfully reset");
    });
  });

  describe("sendEmailVerification", () => {
    it("dispatches POST /auth/send-verification without payload", async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          message: "Verification code sent to your registered email address.",
        },
      } as never);

      const result = await sendEmailVerification();

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith("/auth/send-verification");
      expect(result.message).toContain("Verification code sent");
    });
  });

  describe("verifyEmail", () => {
    it("dispatches POST /auth/verify-email with 6-digit code", async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          message: "Email successfully verified.",
          emailVerifiedAt: "2026-10-18T10:00:00.000Z",
        },
      } as never);

      const result = await verifyEmail({ code: "492817" });

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith("/auth/verify-email", {
        code: "492817",
      });
      expect(result.emailVerifiedAt).toBe("2026-10-18T10:00:00.000Z");
    });
  });

  describe("changePassword", () => {
    it("dispatches POST /auth/change-password with current and new password", async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          message: "Password updated successfully.",
        },
      } as never);

      const result = await changePassword({
        currentPassword: "OldPassword123!",
        newPassword: "NewSecretPassword456!",
      });

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith("/auth/change-password", {
        currentPassword: "OldPassword123!",
        newPassword: "NewSecretPassword456!",
      });
      expect(result.message).toContain("Password updated successfully");
    });
  });

  describe("deleteAccount", () => {
    it("dispatches DELETE /auth/account with password and confirmation phrase", async () => {
      const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
        data: {
          success: true,
          message: "Your FlowPilot account and personal data have been permanently deleted.",
        },
      } as never);

      const result = await deleteAccount({
        password: "MySecretPassword123!",
        confirmationText: "DELETE",
      });

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith("/auth/account", {
        password: "MySecretPassword123!",
        confirmationText: "DELETE",
      });
      expect(result.message).toContain("permanently deleted");
    });
  });
});
