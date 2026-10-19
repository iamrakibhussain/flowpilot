"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, KeyRound, ShieldAlert } from "lucide-react";
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
import { requestPasswordReset } from "@/features/auth/api";
import { ApiClientError } from "@/lib/api/errors";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid corporate email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setErrorMessage(null);
    try {
      await requestPasswordReset({ email: data.email });
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.status === 429) {
          setErrorMessage("Too many requests. Please wait a few minutes before trying again.");
        } else {
          setErrorMessage(
            err.message || "Failed to process password reset request. Please try again."
          );
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected network error occurred. Please try again.");
      }
    }
  };

  const handleResetAnother = () => {
    setIsSuccess(false);
    setSubmittedEmail("");
    setErrorMessage(null);
    reset();
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
            <KeyRound className="h-3 w-3" />
            Account Recovery
          </span>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Forgot your password?</CardTitle>
        <CardDescription className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
          Enter your registered email address and we&apos;ll send you a secure link to reset your
          password.
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
                Recovery Instructions Dispatched
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                If an account exists for{" "}
                <strong className="text-foreground">{submittedEmail}</strong>, a secure password
                recovery link has been delivered.
              </p>
            </div>
          </div>

          <div className="border-border/70 bg-surface/50 text-muted-foreground space-y-2 rounded-xl border p-4 text-xs">
            <div className="text-foreground flex items-center gap-2 font-medium">
              <ShieldAlert className="text-primary h-4 w-4" />
              <span>Security notice</span>
            </div>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                The password reset link will expire in <strong>15 minutes</strong>.
              </li>
              <li>For security, each reset token can only be used once.</li>
              <li>If you don&apos;t receive an email within 2 minutes, check your spam folder.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetAnother}
              className="h-10 w-full text-xs"
            >
              Send link to another email address
            </Button>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to sign in</span>
            </Link>
          </div>
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
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="forgot-email" isRequired>
                Registered Email Address
              </Label>
              <div className="relative">
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="pl-9"
                  hasError={!!errors.email}
                  aria-describedby={errors.email ? "forgot-email-error" : undefined}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p id="forgot-email-error" className="text-destructive text-xs" role="alert">
                  {errors.email.message}
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
              <Mail className="mr-2 h-4 w-4" />
              <span>Send Recovery Link</span>
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
      )}
    </Card>
  );
}
