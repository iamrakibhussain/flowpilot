"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MailCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Send,
  Sparkles,
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
import { sendEmailVerification, verifyEmail, getCurrentUser } from "@/features/auth/api";
import { ApiClientError } from "@/lib/api/errors";

const verifyEmailSchema = z.object({
  code: z
    .string()
    .min(6, "Verification code must be exactly 6 digits")
    .max(6, "Verification code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Verification code must consist of numbers only"),
});

type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isJustRegistered = searchParams.get("registered") === "true";
  const isJustSent = searchParams.get("sent") === "true";
  const emailParam = searchParams.get("email");

  const [userEmail, setUserEmail] = React.useState<string | null>(emailParam);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [resendStatus, setResendStatus] = React.useState<string | null>(
    isJustSent
      ? "A 6-digit confirmation code was dispatched to your email inbox. Please check your Inbox and Spam."
      : null
  );
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [cooldownSeconds, setCooldownSeconds] = React.useState(isJustSent ? 60 : 0);
  const [isResending, setIsResending] = React.useState(false);

  // Fetch current user session to check email and verification status
  React.useEffect(() => {
    getCurrentUser()
      .then((session) => {
        if (session?.user?.email) setUserEmail(session.user.email);
        if (session?.user?.isEmailVerified) {
          setIsSuccess(true);
        }
      })
      .catch(() => {});
  }, []);

  // Cooldown countdown timer
  React.useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: "",
    },
  });

  const watchedCode = watch("code", "");

  const onSubmit = async (data: VerifyEmailFormData) => {
    setErrorMessage(null);
    setResendStatus(null);
    try {
      await verifyEmail({ code: data.code.trim() });
      setIsSuccess(true);
      router.refresh();
      setTimeout(() => {
        router.push("/dashboard/settings");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          if (
            err.message &&
            (err.message.toLowerCase().includes("code") ||
              err.message.toLowerCase().includes("invalid") ||
              err.message.toLowerCase().includes("expired"))
          ) {
            setErrorMessage(err.message);
          } else {
            setErrorMessage("You must be logged in to verify your email. Please sign in first.");
          }
        } else if (err.status === 400) {
          setErrorMessage(
            err.message || "Invalid or expired verification code. Please request a new one."
          );
        } else if (err.status === 429) {
          setErrorMessage("Too many failed attempts. Please wait a few minutes.");
        } else {
          setErrorMessage(err.message || "Email verification failed.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected network error occurred. Please try again.");
      }
    }
  };

  const handleResend = async () => {
    if (cooldownSeconds > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);
    setResendStatus(null);

    try {
      const response = await sendEmailVerification();
      if (response.isAlreadyVerified) {
        setIsSuccess(true);
        return;
      }
      setResendStatus(
        userEmail
          ? `A new 6-digit verification code has been dispatched to ${userEmail}. Please check your Inbox and Spam.`
          : response.message || "A new 6-digit verification code has been dispatched to your email."
      );
      setCooldownSeconds(60); // 60s cooldown
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setErrorMessage("You must be logged in to request a code. Please sign in first.");
        } else if (err.status === 429) {
          setErrorMessage("Too many requests. Please wait a few minutes before resending.");
        } else {
          setErrorMessage(err.message || "Failed to resend verification code.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred while requesting a new code.");
      }
    } finally {
      setIsResending(false);
    }
  };

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
            {isJustRegistered ? (
              <Sparkles className="h-3 w-3" />
            ) : (
              <MailCheck className="h-3 w-3" />
            )}
            {isJustRegistered ? "Welcome to FlowPilot" : "Security Verification"}
          </span>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {isJustRegistered ? "Verify Your Workspace Account" : "Verify your email address"}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
          {userEmail ? (
            <>
              A 6-digit confirmation code was sent to{" "}
              <strong className="text-foreground font-semibold">{userEmail}</strong>. Please check
              your <span className="text-foreground font-medium">Inbox</span> and{" "}
              <span className="text-foreground font-medium">Spam / Junk</span> folder.
            </>
          ) : isJustRegistered ? (
            "Your workspace account has been created! Enter the 6-digit verification code sent to your registered email (check Inbox and Spam) to activate access."
          ) : (
            "Enter the 6-digit verification code sent to your registered corporate email inbox."
          )}
        </CardDescription>
      </CardHeader>

      {isSuccess ? (
        <CardContent className="space-y-6 pt-2">
          <div
            role="status"
            className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-emerald-300"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-emerald-200">
                Email Successfully Verified
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Your FlowPilot account is now authenticated with full verified status. Redirecting
                to workspace...
              </p>
            </div>
          </div>

          <Link href="/dashboard" className="block w-full">
            <Button className="h-11 w-full">Proceed to Dashboard</Button>
          </Link>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div
                role="alert"
                className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-xl border p-3 text-xs"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-1">
                  <p className="leading-relaxed">{errorMessage}</p>
                  {errorMessage.includes("sign in") && (
                    <Link
                      href="/login"
                      className="text-primary font-semibold underline hover:no-underline"
                    >
                      Go to login page
                    </Link>
                  )}
                </div>
              </div>
            )}

            {resendStatus && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p className="leading-relaxed font-medium">{resendStatus}</p>
              </div>
            )}

            {!isJustRegistered && !isJustSent && !resendStatus && (
              <div className="flex flex-col justify-between gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 text-xs text-blue-300 sm:flex-row sm:items-center">
                <span>
                  Need a confirmation code? Click to receive a 6-digit code in your email.
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleResend}
                  isLoading={isResending}
                  disabled={isResending || cooldownSeconds > 0}
                  className="h-8 shrink-0 cursor-pointer border-blue-500/40 bg-blue-500/15 px-3.5 text-xs font-semibold text-blue-200 hover:bg-blue-500/25"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  <span>Send Code Now</span>
                </Button>
              </div>
            )}

            {/* 6-Digit Code Input */}
            <div className="space-y-2">
              <Label htmlFor="verification-code-input" isRequired className="block text-center">
                6-Digit Security Code
              </Label>
              <div className="relative">
                <Input
                  id="verification-code-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="123456"
                  autoComplete="one-time-code"
                  className="focus:ring-primary h-14 text-center font-mono text-2xl font-bold tracking-[0.5em] focus:ring-2"
                  hasError={!!errors.code}
                  aria-describedby={errors.code ? "code-error" : undefined}
                  {...register("code")}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setValue("code", val, { shouldValidate: true });
                  }}
                />
              </div>
              {errors.code && (
                <p id="code-error" className="text-destructive text-center text-xs" role="alert">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div className="border-border/60 bg-surface/40 text-muted-foreground flex items-center gap-2 rounded-xl border p-3 text-xs">
              <ShieldCheck className="text-primary h-4 w-4 shrink-0" />
              <span>Codes expire in 15 minutes. Delivered directly to your inbox.</span>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              className="from-primary h-11 w-full rounded-xl bg-gradient-to-r via-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-[0_0_20px_rgba(49,95,232,0.35)] transition-all hover:scale-[1.01] hover:shadow-[0_0_28px_rgba(49,95,232,0.55)] active:scale-[0.99]"
              isLoading={isSubmitting}
              disabled={watchedCode.length !== 6}
            >
              <Send className="mr-2 h-4 w-4" />
              <span>Verify & Continue</span>
            </Button>

            <div className="flex w-full items-center justify-between pt-1 text-xs">
              {isJustRegistered ? (
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  <span>Skip for now, go to Dashboard</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to sign in</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleResend}
                disabled={cooldownSeconds > 0 || isResending}
                className="text-primary inline-flex cursor-pointer items-center gap-1 font-medium hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${isResending ? "animate-spin" : ""}`} />
                <span>
                  {cooldownSeconds > 0
                    ? `Resend in ${cooldownSeconds}s`
                    : isResending
                      ? "Sending..."
                      : "Resend Code"}
                </span>
              </button>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense
      fallback={
        <Card className="border-border/80 bg-surface/95 relative w-full p-8 text-center shadow-2xl backdrop-blur-2xl">
          <p className="text-muted-foreground text-sm">Loading verification...</p>
        </Card>
      }
    >
      <VerifyEmailContent />
    </React.Suspense>
  );
}
