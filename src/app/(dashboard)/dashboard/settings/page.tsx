"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Lock,
  KeyRound,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
  MailCheck,
  Trash2,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getCurrentUser,
  changePassword,
  deleteAccount,
  requestPasswordReset,
  sendEmailVerification,
} from "@/features/auth/api";
import type { AuthSession } from "@/features/auth/types";
import { ApiClientError } from "@/lib/api/errors";

// Password Change Schema
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long")
      .max(128, "Password cannot exceed 128 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Account Deletion Schema
const deleteAccountSchema = z.object({
  password: z.string().min(1, "Your password is required to confirm account deletion"),
  confirmationText: z.string().min(1, 'Please type "DELETE" to confirm'),
});

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [session, setSession] = React.useState<AuthSession | null>(null);

  // Password state
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = React.useState<string | null>(null);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = React.useState<string | null>(null);
  const [isSendingResetEmail, setIsSendingResetEmail] = React.useState(false);

  // Deletion state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = React.useState<string | null>(null);

  // Email verification dispatch state
  const [isSendingVerification, setIsSendingVerification] = React.useState(false);
  const [verificationFeedback, setVerificationFeedback] = React.useState<string | null>(null);

  const handleSendVerificationFromSettings = async () => {
    setIsSendingVerification(true);
    setVerificationFeedback(null);
    try {
      const response = await sendEmailVerification();
      if (response.isAlreadyVerified) {
        // If already verified, refresh session state immediately
        const refreshed = await getCurrentUser();
        setSession(refreshed);
        setIsSendingVerification(false);
        return;
      }
      router.push("/verify-email?sent=true");
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setVerificationFeedback(err.message || "Failed to dispatch verification code.");
      } else {
        setVerificationFeedback("An unexpected error occurred while requesting verification code.");
      }
      setIsSendingVerification(false);
    }
  };

  React.useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();
        setSession(data);
      } catch {
        // Fallback for unauthenticated preview mode
      }
    }
    loadUser();
  }, []);

  // Form for changing password
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch: watchPassword,
    formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchedNewPassword = watchPassword("newPassword", "");

  const requirements = [
    { label: "At least 8 characters", met: watchedNewPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(watchedNewPassword) },
    { label: "One lowercase letter", met: /[a-z]/.test(watchedNewPassword) },
    { label: "One number", met: /[0-9]/.test(watchedNewPassword) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(watchedNewPassword) },
  ];

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setPasswordErrorMessage(null);
    setPasswordSuccessMessage(null);
    try {
      const response = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccessMessage(
        response.message ||
          "Password updated successfully! All other active sessions have been terminated."
      );
      resetPasswordForm();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setPasswordErrorMessage("Your current password is incorrect. Please try again.");
        } else if (err.status === 400) {
          setPasswordErrorMessage(
            err.message || "New password cannot be the same as your current password."
          );
        } else {
          setPasswordErrorMessage(err.message || "Failed to update password.");
        }
      } else if (err instanceof Error) {
        setPasswordErrorMessage(err.message);
      } else {
        setPasswordErrorMessage("An unexpected network error occurred.");
      }
    }
  };

  const handleSendResetEmail = async () => {
    if (!session?.user?.email || isSendingResetEmail) return;
    setIsSendingResetEmail(true);
    setResetEmailSent(null);
    try {
      await requestPasswordReset({ email: session.user.email });
      setResetEmailSent(`A recovery reset link has been dispatched to ${session.user.email}.`);
    } catch {
      setPasswordErrorMessage("Failed to send reset link to your email.");
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  // Form for account deletion
  const {
    register: registerDelete,
    handleSubmit: handleDeleteSubmit,
    formState: { errors: deleteErrors, isSubmitting: isDeletingAccount },
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      confirmationText: "",
    },
  });

  const onDeleteSubmit = async (data: DeleteAccountFormData) => {
    setDeleteErrorMessage(null);
    const normalized = data.confirmationText.trim().toUpperCase();
    if (normalized !== "DELETE" && normalized !== "DELETE MY ACCOUNT") {
      setDeleteErrorMessage('You must type "DELETE" or "DELETE MY ACCOUNT" to confirm.');
      return;
    }

    try {
      await deleteAccount({
        password: data.password,
        confirmationText: data.confirmationText,
      });

      setIsDeleteDialogOpen(false);
      router.push("/login?logged_out=true");
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setDeleteErrorMessage("Incorrect password. Account deletion aborted.");
        } else if (err.status === 403) {
          setDeleteErrorMessage(
            err.message ||
              "You are the sole owner of a team workspace. Please transfer ownership before deleting."
          );
        } else {
          setDeleteErrorMessage(err.message || "Failed to delete account.");
        }
      } else if (err instanceof Error) {
        setDeleteErrorMessage(err.message);
      } else {
        setDeleteErrorMessage("An unexpected error occurred during account deletion.");
      }
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-16">
      <PageHeader
        title="Security & Account Settings"
        description="Manage your corporate credentials, session security, email verification status, and data lifecycle."
      />

      {/* 1. Account Identity & Email Verification Card */}
      <Card className="border-border/80 bg-surface/90">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Account Identity</CardTitle>
            <CardDescription className="text-xs">
              Primary profile details associated with your multi-tenant workspace.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {session?.user?.isEmailVerified ? (
              <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Email Verified
              </Badge>
            ) : (
              <Badge className="gap-1 border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                Unverified
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-border/60 bg-muted/20 rounded-xl border p-3">
              <span className="text-muted-foreground block text-[11px]">User Name</span>
              <span className="text-foreground text-sm font-semibold">
                {session?.user?.name || "Operator"}
              </span>
            </div>
            <div className="border-border/60 bg-muted/20 rounded-xl border p-3">
              <span className="text-muted-foreground block text-[11px]">Corporate Email</span>
              <span className="text-foreground text-sm font-semibold">
                {session?.user?.email || "operator@flowpilot.io"}
              </span>
            </div>
          </div>

          {!session?.user?.isEmailVerified && (
            <div className="space-y-2">
              <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                  <MailCheck className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>
                    Your email is not verified yet. Click to receive a 6-digit confirmation code in
                    your inbox.
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSendVerificationFromSettings}
                  isLoading={isSendingVerification}
                  disabled={isSendingVerification}
                  className="h-8 shrink-0 cursor-pointer border-amber-500/50 bg-amber-500/20 px-4 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 hover:text-white"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  <span>Send Verification Code</span>
                </Button>
              </div>
              {verificationFeedback && (
                <p className="text-destructive px-1 text-xs" role="alert">
                  {verificationFeedback}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Password Reset / Change Card */}
      <Card className="border-border/80 bg-surface/90 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase">
              <KeyRound className="h-3 w-3" />
              Credentials Management
            </span>
          </div>
          <CardTitle className="text-lg font-bold tracking-tight">
            Password & Authentication
          </CardTitle>
          <CardDescription className="text-xs">
            Update your account password. For your security, updating your password automatically
            invalidates all other active sessions across devices.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} noValidate>
          <CardContent className="space-y-4">
            {passwordSuccessMessage && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p className="leading-relaxed font-medium">{passwordSuccessMessage}</p>
              </div>
            )}

            {passwordErrorMessage && (
              <div
                role="alert"
                className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-xl border p-3 text-xs"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="leading-relaxed">{passwordErrorMessage}</p>
              </div>
            )}

            {resetEmailSent && (
              <div
                role="status"
                className="border-primary/30 bg-primary/10 text-primary flex items-start gap-2.5 rounded-xl border p-3 text-xs"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="leading-relaxed">{resetEmailSent}</p>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-1.5">
              <Label htmlFor="current-password" isRequired>
                Current Password
              </Label>
              <div className="relative">
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="pr-10 pl-9"
                  hasError={!!passwordErrors.currentPassword}
                  aria-describedby={
                    passwordErrors.currentPassword ? "current-password-error" : undefined
                  }
                  {...registerPassword("currentPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors focus:outline-none"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p id="current-password-error" className="text-destructive text-xs" role="alert">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="new-password" isRequired>
                New Password
              </Label>
              <div className="relative">
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="pr-10 pl-9"
                  hasError={!!passwordErrors.newPassword}
                  aria-describedby={passwordErrors.newPassword ? "new-password-error" : undefined}
                  {...registerPassword("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors focus:outline-none"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p id="new-password-error" className="text-destructive text-xs" role="alert">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            {/* Strength checklist */}
            <div className="border-border/60 bg-surface/40 space-y-2 rounded-xl border p-3 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <ShieldAlert className="text-primary h-3.5 w-3.5" />
                Password Complexity Requirements:
              </span>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {requirements.map((req, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                      req.met ? "font-medium text-emerald-400" : "text-muted-foreground"
                    }`}
                  >
                    {req.met ? (
                      <Check className="h-3 w-3 shrink-0 text-emerald-400" />
                    ) : (
                      <X className="text-muted-foreground h-3 w-3 shrink-0" />
                    )}
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm-new-password" isRequired>
                Confirm New Password
              </Label>
              <div className="relative">
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="confirm-new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="pr-10 pl-9"
                  hasError={!!passwordErrors.confirmPassword}
                  aria-describedby={
                    passwordErrors.confirmPassword ? "confirm-password-error" : undefined
                  }
                  {...registerPassword("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p id="confirm-password-error" className="text-destructive text-xs" role="alert">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
            <Button
              type="submit"
              className="from-primary w-full bg-gradient-to-r via-blue-600 to-indigo-600 font-semibold text-white sm:w-auto"
              isLoading={isChangingPassword}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              <span>Update Password</span>
            </Button>

            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={isSendingResetEmail}
              className="text-muted-foreground hover:text-primary flex cursor-pointer items-center gap-1 text-xs transition-colors hover:underline"
            >
              <Send className="h-3 w-3" />
              <span>{isSendingResetEmail ? "Sending..." : "Prefer email? Send reset link"}</span>
            </button>
          </CardFooter>
        </form>
      </Card>

      {/* 3. Danger Zone (Account Deletion) */}
      <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
        <CardHeader>
          <div className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle className="text-base font-semibold">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-xs">
            Permanently delete your user account, workspace memberships, and personal data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <p className="text-muted-foreground">
            Once you delete your account, there is no going back. All your active sessions will be
            terminated immediately, and any workspace where you are the sole member will be purged.
          </p>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete My Account
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border bg-surface text-foreground max-w-md">
              <DialogHeader>
                <DialogTitle className="text-destructive flex items-center gap-2 text-lg font-bold">
                  <AlertTriangle className="h-5 w-5" />
                  Confirm Permanent Account Deletion
                </DialogTitle>
                <DialogDescription className="text-muted-foreground pt-1 text-xs">
                  This action is irreversible. All your sessions, profile information, and
                  sole-owned workspaces will be permanently erased.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleDeleteSubmit(onDeleteSubmit)} className="space-y-4 pt-2">
                {deleteErrorMessage && (
                  <div
                    role="alert"
                    className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-xl border p-3 text-xs"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="leading-relaxed">{deleteErrorMessage}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="delete-account-password" isRequired>
                    Confirm Your Password
                  </Label>
                  <Input
                    id="delete-account-password"
                    type="password"
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    hasError={!!deleteErrors.password}
                    {...registerDelete("password")}
                  />
                  {deleteErrors.password && (
                    <p className="text-destructive text-xs">{deleteErrors.password.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="delete-confirmation-text" isRequired>
                    Type <strong className="text-destructive font-mono">DELETE</strong> to confirm
                  </Label>
                  <Input
                    id="delete-confirmation-text"
                    type="text"
                    placeholder="DELETE"
                    autoComplete="off"
                    hasError={!!deleteErrors.confirmationText}
                    {...registerDelete("confirmationText")}
                  />
                  {deleteErrors.confirmationText && (
                    <p className="text-destructive text-xs">
                      {deleteErrors.confirmationText.message}
                    </p>
                  )}
                </div>

                <DialogFooter className="gap-2 pt-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
                    isLoading={isDeletingAccount}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Permanently Delete
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
