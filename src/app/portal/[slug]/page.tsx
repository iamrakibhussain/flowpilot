"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRequestPortalLink, useVerifyPortalToken } from "@/features/portal/use-portal";

export default function ClientPortalLoginPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [step, setStep] = React.useState<"email" | "code">("email");
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const requestLinkMutation = useRequestPortalLink();
  const verifyTokenMutation = useVerifyPortalToken();

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setFeedback(null);
    try {
      const res = await requestLinkMutation.mutateAsync({
        email: email.trim(),
        organizationSlug: slug,
      });
      setStep("code");
      setFeedback({
        type: "success",
        text:
          res.message ||
          "A secure sign-in link and 6-digit passcode have been dispatched to your email.",
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to send access link. Please verify your email and try again.",
      });
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) {
      setFeedback({ type: "error", text: "Please enter a valid 6-digit verification code." });
      return;
    }

    setFeedback(null);
    try {
      await verifyTokenMutation.mutateAsync({
        organizationSlug: slug,
        code: code.trim(),
      });
      router.push(`/portal/${slug}/dashboard`);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Invalid or expired passcode. Please request a new link.",
      });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/50 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/15" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Back Link to Booking */}
        <div className="flex justify-between items-center px-1">
          <Link
            href={`/book/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Public Booking Gateway</span>
          </Link>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Gateway
          </span>
        </div>

        {/* Workspace Brand Header */}
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-xl font-black text-white shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/10 dark:ring-blue-500/20">
            {slug.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-0.5 text-[11px] font-bold tracking-wider text-blue-700 uppercase shadow-2xs dark:border-blue-800/80 dark:bg-blue-950/60 dark:text-blue-300">
              <ShieldCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              Client Self-Service Portal
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 capitalize sm:text-3xl dark:text-slate-100">
              {slug.replace(/-/g, " ")}
            </h1>
            <p className="mx-auto max-w-xs text-xs text-slate-600 sm:text-sm dark:text-slate-400">
              Manage your appointments, reschedule sessions, and download invoice receipts 24/7.
            </p>
          </div>
        </div>

        {/* Auth Capsule Card */}
        <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90">
          <CardContent className="space-y-6 p-6 sm:p-8">
            {feedback && (
              <div
                className={`flex items-start gap-2.5 rounded-xl p-3.5 text-xs font-medium transition-all sm:text-sm ${
                  feedback.type === "success"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            {step === "email" ? (
              <form onSubmit={handleSendLink} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                    Your Client Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      required
                      placeholder="client@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10 dark:border-slate-800 dark:bg-slate-950/50"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Please enter the email address used during your appointment booking or invoice receipt.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={requestLinkMutation.isPending}
                  className="h-11 w-full gap-2 rounded-xl bg-blue-600 font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700"
                >
                  {requestLinkMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Dispatching Access Code...
                    </span>
                  ) : (
                    <>
                      Send Secure Login Link
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="space-y-2 pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setStep("code")}
                    className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Already have a 6-digit passcode? Enter code
                  </button>

                  <p className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800">
                    New client or haven&apos;t booked a session yet?{" "}
                    <button
                      type="button"
                      onClick={() => router.push(`/book/${slug}`)}
                      className="inline-flex items-center gap-0.5 font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Book an Appointment First &rarr;
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                      6-Digit Passcode
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Change email
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-10 text-center font-mono text-xl font-bold tracking-[8px] dark:border-slate-800 dark:bg-slate-950/50"
                    />
                  </div>
                  <p className="text-center text-[11px] text-slate-500">
                    Check your email inbox or spam folder for your 6-digit passcode.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={verifyTokenMutation.isPending || code.length !== 6}
                  className="h-11 w-full gap-2 rounded-xl bg-emerald-600 font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-700"
                >
                  {verifyTokenMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Verifying Passcode...
                    </span>
                  ) : (
                    <>
                      Enter Client Portal
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleSendLink}
                    disabled={requestLinkMutation.isPending}
                    className="text-xs text-slate-500 hover:text-slate-800 hover:underline dark:hover:text-slate-200"
                  >
                    Didn&apos;t receive the email? Resend code
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Security Trust Footnote */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            <span>15-Minute Expiry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
