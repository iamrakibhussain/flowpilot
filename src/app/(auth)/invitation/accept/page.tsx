"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Lock,
  User,
  Mail,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
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
import { useVerifyInvitation, useAcceptInvitation } from "@/features/team/use-team";

function getPasswordStrength(pass: string): {
  score: number;
  label: string;
  color: string;
  bg: string;
} {
  if (!pass) return { score: 0, label: "", color: "", bg: "" };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (pass.length >= 12) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak", color: "text-rose-500", bg: "bg-rose-500" };
  if (score <= 3)
    return { score: 2, label: "Moderate", color: "text-amber-500", bg: "bg-amber-500" };
  return { score: 3, label: "Strong", color: "text-emerald-500", bg: "bg-emerald-500" };
}

function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { data: invite, isLoading, error: verifyError } = useVerifyInvitation(token);
  const acceptMutation = useAcceptInvitation();

  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const pwdStrength = React.useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  if (!token) {
    return (
      <Card className="border-border/80 bg-background/95 w-full max-w-md rounded-3xl border p-6 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <CardTitle className="text-foreground text-lg font-bold">
          Missing Invitation Token
        </CardTitle>
        <CardDescription className="text-muted-foreground mt-2 text-xs">
          No invitation token was detected in your link. Please verify the URL or ask your workspace
          administrator to resend an invite.
        </CardDescription>
        <div className="mt-6">
          <Link href="/login">
            <Button variant="outline" className="w-full rounded-xl text-xs font-semibold">
              Return to Login
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-border/80 bg-background/95 w-full max-w-md rounded-3xl border p-8 text-center shadow-2xl backdrop-blur-xl">
        <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-600" />
        <CardTitle className="text-foreground text-base font-bold">
          Verifying Workspace Invite...
        </CardTitle>
        <CardDescription className="text-muted-foreground mt-1 text-xs">
          Securing cryptographic invitation context from FlowPilot.
        </CardDescription>
      </Card>
    );
  }

  if (verifyError || !invite?.valid) {
    return (
      <Card className="border-border/80 bg-background/95 w-full max-w-md rounded-3xl border p-6 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <CardTitle className="text-foreground text-lg font-bold">
          Invitation Expired or Invalid
        </CardTitle>
        <CardDescription className="text-muted-foreground mt-2 text-xs leading-relaxed">
          {verifyError instanceof Error
            ? verifyError.message
            : "This invitation link has expired, was revoked, or has already been accepted."}
        </CardDescription>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/login">
            <Button className="w-full rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700">
              Sign In to FlowPilot
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!invite.userExists) {
      if (!name.trim()) {
        setFormError("Please enter your full name.");
        return;
      }
      if (password.length < 8) {
        setFormError("Password must be at least 8 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setFormError("Passwords do not match.");
        return;
      }
    }

    try {
      const result = await acceptMutation.mutateAsync({
        token,
        name: invite.userExists ? undefined : name.trim(),
        password: invite.userExists ? undefined : password,
      });

      if (typeof window !== "undefined" && result.activeOrganizationId) {
        localStorage.setItem("flowpilot_active_org", result.activeOrganizationId);
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to accept workspace invitation";
      setFormError(msg);
    }
  };

  const orgInitials = invite.organizationName.slice(0, 2).toUpperCase() || "FP";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <Card className="border-border/80 bg-background/95 overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl">
        {/* Top Header */}
        <CardHeader className="space-y-3.5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md shadow-blue-500/20">
                {orgInitials}
              </div>
              <span className="text-foreground text-base font-black tracking-tight">
                {invite.organizationName}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
              <Sparkles className="h-2.5 w-2.5" /> Workspace Invite
            </span>
          </div>

          <div>
            <CardTitle className="text-foreground text-xl font-black tracking-tight">
              Accept Team Invitation
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-xs leading-relaxed">
              <strong>{invite.inviterName}</strong> has invited you to collaborate in this workspace
              with{" "}
              <strong className="font-bold text-blue-600 uppercase dark:text-blue-400">
                {invite.role}
              </strong>{" "}
              privileges.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 text-xs">
            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Email Field (Read-only) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assigned Account Email</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <Input
                  type="email"
                  value={invite.email}
                  disabled
                  className="border-border bg-muted/40 rounded-xl pl-9 font-mono text-xs font-medium"
                />
              </div>
            </div>

            {invite.userExists ? (
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs">
                <div className="mb-1.5 flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Existing FlowPilot Account Detected</span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  You already have an active account for this email. Clicking accept will
                  immediately link your account to <strong>{invite.organizationName}</strong> with{" "}
                  <strong>{invite.role}</strong> access. No new password setup required!
                </p>
              </div>
            ) : (
              <>
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Your Full Name <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="rounded-xl pl-9 text-xs shadow-2xs"
                    />
                  </div>
                </div>

                {/* Password with Strength Indicator */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      Create Password <span className="text-rose-500">*</span>
                    </Label>
                    {pwdStrength.label && (
                      <span className={`text-[10px] font-bold ${pwdStrength.color}`}>
                        {pwdStrength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-xl pr-9 pl-9 text-xs shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Password Strength Bar */}
                  {password.length > 0 && (
                    <div className="bg-muted mt-1.5 flex h-1 w-full gap-1 overflow-hidden rounded-full">
                      <div
                        className={`h-full transition-all duration-300 ${
                          pwdStrength.score >= 1 ? pwdStrength.bg : "bg-transparent"
                        }`}
                        style={{ width: "33.3%" }}
                      />
                      <div
                        className={`h-full transition-all duration-300 ${
                          pwdStrength.score >= 2 ? pwdStrength.bg : "bg-transparent"
                        }`}
                        style={{ width: "33.3%" }}
                      />
                      <div
                        className={`h-full transition-all duration-300 ${
                          pwdStrength.score >= 3 ? pwdStrength.bg : "bg-transparent"
                        }`}
                        style={{ width: "33.3%" }}
                      />
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      Confirm Password <span className="text-rose-500">*</span>
                    </Label>
                    {passwordsMatch && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" /> Passwords match
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="rounded-xl pl-9 text-xs shadow-2xs"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              disabled={acceptMutation.isPending}
              className="w-full cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700"
            >
              {acceptMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Accessing Workspace...</span>
                </>
              ) : (
                <>
                  <span>Accept Invitation & Enter Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-muted-foreground text-center text-[10px]">
              By accepting, you agree to FlowPilot&apos;s workspace collaboration terms and privacy
              guidelines.
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Ambient background glow meshes */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 -bottom-40 -z-10 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />

      <React.Suspense
        fallback={
          <Card className="border-border/80 bg-background/95 w-full max-w-md rounded-3xl border p-8 text-center shadow-xl backdrop-blur-xl">
            <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin text-blue-600" />
            <p className="text-muted-foreground text-xs font-medium">
              Loading invitation context...
            </p>
          </Card>
        }
      >
        <AcceptInvitationForm />
      </React.Suspense>
    </div>
  );
}
