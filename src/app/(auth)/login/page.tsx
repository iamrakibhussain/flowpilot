"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
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
import { loginUser } from "@/features/auth/api";
import { ApiClientError } from "@/lib/api/errors";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid corporate email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function getSafeRedirectUrl(rawRedirect: string | null): string {
  if (!rawRedirect) return "/dashboard";
  const trimmed = rawRedirect.trim();
  // Ensure relative path starting with single slash, not protocol-relative //, and no URL schemes
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.includes("://") &&
    !trimmed.includes("\\")
  ) {
    return trimmed;
  }
  return "/dashboard";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const statusMessage = React.useMemo(() => {
    if (searchParams.get("logged_out") === "true") {
      return "You have been signed out securely. Session and credentials invalidated.";
    }
    if (searchParams.get("reset") === "true") {
      return "Your password has been reset successfully. Please sign in with your new password.";
    }
    return null;
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      await loginUser({
        email: data.email,
        password: data.password,
      });

      // Navigate to safe validated redirect target or default dashboard
      const safeRedirect = getSafeRedirectUrl(searchParams.get("redirect"));
      router.push(safeRedirect);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setErrorMessage("Invalid email or password. Please try again.");
        } else if (err.status === 429) {
          setErrorMessage("Too many login attempts. Please wait a few minutes.");
        } else {
          setErrorMessage(err.message || "Failed to sign in. Please verify your credentials.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected network error occurred. Please try again.");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-[420px]"
    >
      <Card className="relative w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-1 shadow-[0_20px_50px_-15px_rgba(23,32,51,0.08),0_0_1px_1px_rgba(23,32,51,0.03)] backdrop-blur-2xl">
        {/* Top Specular Accent Glow Line */}
        <div
          className="from-primary/70 pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r via-blue-500 to-indigo-500"
          aria-hidden="true"
        />
        {/* Ambient Corner Soft Flare */}
        <div
          className="from-primary/10 pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-bl to-cyan-400/10 blur-3xl"
          aria-hidden="true"
        />

        <CardHeader className="space-y-2 pb-5 text-center">
          {/* Centered Glowing Lock Icon */}
          <div className="from-primary shadow-primary/25 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br via-blue-600 to-indigo-600 text-white shadow-lg transition-transform duration-300 hover:scale-105">
            <Lock className="h-5 w-5" />
          </div>

          <div className="flex items-center justify-center">
            <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase shadow-xs">
              <Sparkles className="h-3 w-3" />
              Workspace Access
            </span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Sign in to your workspace
          </CardTitle>
          <CardDescription className="mx-auto max-w-xs text-xs leading-relaxed text-slate-600 sm:text-sm">
            Enter your organization credentials to access FlowPilot.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {statusMessage && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 shadow-xs"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p className="leading-relaxed font-medium">{statusMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 shadow-xs"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <p className="leading-relaxed font-medium">{errorMessage}</p>
              </div>
            )}

            <div className="group space-y-1.5">
              <Label htmlFor="login-email" isRequired className="text-slate-800">
                Business Email
              </Label>
              <div className="relative">
                <div className="group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors">
                  <Mail className="h-4 w-4 transition-transform duration-200 group-focus-within:scale-110" />
                </div>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="focus-visible:border-primary focus-visible:ring-primary/15 h-11 rounded-xl border-slate-200 bg-white pl-9.5 text-sm text-slate-900 shadow-xs transition-all placeholder:text-slate-400 hover:bg-slate-50/50 focus-visible:ring-4"
                  hasError={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-xs text-rose-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="group space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" isRequired className="text-slate-800">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-muted-foreground hover:text-primary text-xs transition-colors hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors">
                  <Lock className="h-4 w-4 transition-transform duration-200 group-focus-within:scale-110" />
                </div>
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="focus-visible:border-primary focus-visible:ring-primary/15 h-11 rounded-xl border-slate-200 bg-white pr-10 pl-9.5 text-sm text-slate-900 shadow-xs transition-all placeholder:text-slate-400 hover:bg-slate-50/50 focus-visible:ring-4"
                  hasError={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
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
                <p id="password-error" className="text-xs text-rose-600" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3.5 pt-2">
            {/* Animated Shimmer Button with Active Scale Bounce */}
            <Button
              type="submit"
              className="from-primary shadow-primary/25 hover:shadow-primary/40 relative h-12 w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r via-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg transition-all before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent hover:scale-[1.01] hover:before:animate-[shimmer_1.8s_infinite] active:scale-[0.98]"
              isLoading={isSubmitting}
            >
              <Lock className="mr-2 h-4 w-4" />
              <span>Sign In to Workspace</span>
            </Button>

            {/* Security Trust Callout */}
            <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-center text-[11px] text-slate-600 shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>End-to-end encrypted session • Multi-tenant Isolation</span>
            </div>

            <div className="text-center text-xs text-slate-500">
              Don&apos;t have a workspace yet?{" "}
              <Link
                href="/register"
                className="text-primary font-semibold underline-offset-2 hover:underline"
              >
                Create a free workspace
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <React.Suspense
        fallback={
          <Card className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-2xl">
            <div className="border-primary mx-auto mb-3 flex h-10 w-10 animate-spin items-center justify-center rounded-full border-2 border-t-transparent" />
            <p className="text-sm font-medium text-slate-600">Loading workspace...</p>
          </Card>
        }
      >
        <LoginForm />
      </React.Suspense>
    </div>
  );
}
