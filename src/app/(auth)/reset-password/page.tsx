"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Check,
  X,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resetPassword } from "@/features/auth/api";
import { ApiClientError } from "@/lib/api/errors";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password cannot exceed 100 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

const resetPasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = watch("password", "");

  const requirements = [
    { label: "At least 8 characters", met: watchedPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(watchedPassword) },
    { label: "One lowercase letter", met: /[a-z]/.test(watchedPassword) },
    { label: "One number", met: /[0-9]/.test(watchedPassword) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(watchedPassword) },
  ];

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setErrorMessage("Reset token is missing. Please use the link sent to your email.");
      return;
    }

    setErrorMessage(null);
    try {
      await resetPassword({
        token,
        password: data.password,
      });

      setIsSuccess(true);
      // Automatically redirect to login after a brief delay
      setTimeout(() => {
        router.push("/login?reset=true");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.status === 400) {
          setErrorMessage(
            "This password reset link is invalid or has expired. Please request a new one."
          );
        } else if (err.status === 429) {
          setErrorMessage("Too many attempts. Please wait a few minutes.");
        } else {
          setErrorMessage(err.message || "Failed to reset password. Please try again.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected network error occurred. Please try again.");
      }
    }
  };

  if (!token) {
    return (
      <Card className="border-border/80 bg-surface/95 relative w-full overflow-hidden shadow-2xl backdrop-blur-2xl">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center justify-between">
            <span className="border-destructive/20 bg-destructive/10 text-destructive inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase">
              <AlertCircle className="h-3 w-3" />
              Invalid Link
            </span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Missing Security Token
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
            We could not find a valid password recovery token in your URL link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-border/70 bg-surface/50 text-muted-foreground space-y-2 rounded-xl border p-4 text-xs">
            <p>
              Password recovery links are single-use and expire within 15 minutes of generation.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Link href="/forgot-password" className="w-full">
            <Button className="h-11 w-full">Request a New Reset Link</Button>
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to sign in</span>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="border-border/80 bg-surface/95 relative w-full overflow-hidden shadow-2xl backdrop-blur-2xl">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-400 uppercase">
              <CheckCircle2 className="h-3 w-3" />
              Security Updated
            </span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Password Reset Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            role="status"
            className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-emerald-300"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-emerald-200">
                Credentials Updated Securely
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                All existing sessions have been revoked across all devices to prevent unauthorized
                access. Redirecting you to sign in...
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/login?reset=true" className="w-full">
            <Button className="h-11 w-full">Sign In Now</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-surface/95 relative w-full overflow-hidden shadow-2xl backdrop-blur-2xl">
      {/* Specular Top Rim Reflection */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
        aria-hidden="true"
      />

      <CardHeader className="space-y-2 pb-6">
        <div className="flex items-center justify-between">
          <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase">
            <KeyRound className="h-3 w-3" />
            Create New Password
          </span>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Reset your password</CardTitle>
        <CardDescription className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
          Please enter and confirm your new corporate account password.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-xl border p-3 text-xs"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                <p className="leading-relaxed font-medium">{errorMessage}</p>
                {errorMessage.includes("expired") && (
                  <Link
                    href="/forgot-password"
                    className="text-primary font-semibold underline hover:no-underline"
                  >
                    Request a new recovery link
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* New Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="reset-password-input" isRequired>
              New Password
            </Label>
            <div className="relative">
              <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                id="reset-password-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                autoComplete="new-password"
                className="pr-10 pl-9"
                hasError={!!errors.password}
                aria-describedby={errors.password ? "reset-password-error" : undefined}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="reset-password-error" className="text-destructive text-xs" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Password Requirements Checklist */}
          <div className="border-border/60 bg-surface/40 space-y-2 rounded-xl border p-3 text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <ShieldCheck className="text-primary h-3.5 w-3.5" />
              Password Strength Requirements:
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

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password-input" isRequired>
              Confirm New Password
            </Label>
            <div className="relative">
              <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                id="confirm-password-input"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••••••"
                autoComplete="new-password"
                className="pr-10 pl-9"
                hasError={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="text-destructive text-xs" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="from-primary h-11 w-full rounded-xl bg-gradient-to-r via-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-[0_0_20px_rgba(49,95,232,0.35)] transition-all hover:scale-[1.01] hover:shadow-[0_0_28px_rgba(49,95,232,0.55)] active:scale-[0.99]"
            isLoading={isSubmitting}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            <span>Update Password & Revoke Old Sessions</span>
          </Button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <Card className="border-border/80 bg-surface/95 relative w-full p-8 text-center shadow-2xl backdrop-blur-2xl">
          <p className="text-muted-foreground text-sm">Loading password recovery...</p>
        </Card>
      }
    >
      <ResetPasswordContent />
    </React.Suspense>
  );
}
