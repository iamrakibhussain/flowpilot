"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Building2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Zap,
  CreditCard,
  Star,
  Globe,
  Check,
  TrendingUp,
  Activity,
  Calendar,
  BadgeCheck,
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
import { registerUser } from "@/features/auth/api";
import { ApiClientError } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";

// Strict validation schema enforcing security & usability
const registerFormSchema = z
  .object({
    name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name cannot exceed 100 characters")
      .trim(),
    email: z
      .string()
      .min(1, "Business email is required")
      .email("Please enter a valid corporate/business email address")
      .max(255, "Email cannot exceed 255 characters")
      .trim(),
    organizationName: z
      .string()
      .min(2, "Workspace name must be at least 2 characters")
      .max(100, "Workspace name cannot exceed 100 characters")
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password cannot exceed 128 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Service and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "workspace"
  );
}

function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  criteria: { label: string; passed: boolean }[];
} {
  const criteria = [
    { label: "8+ characters", passed: password.length >= 8 },
    { label: "Uppercase letter (A-Z)", passed: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a-z)", passed: /[a-z]/.test(password) },
    { label: "Number (0-9) or symbol", passed: /[0-9]|[^A-Za-z0-9]/.test(password) },
  ];

  const score = criteria.filter((c) => c.passed).length;

  if (score === 0) return { score: 0, label: "Very Weak", color: "bg-slate-200", criteria };
  if (score === 1) return { score: 1, label: "Weak", color: "bg-rose-500", criteria };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500", criteria };
  if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500", criteria };
  return { score: 4, label: "Strong", color: "bg-emerald-500", criteria };
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [createdOrgName, setCreatedOrgName] = React.useState<string>("");
  const [activePreviewTab, setActivePreviewTab] = React.useState<
    "revenue" | "appointments" | "invoices"
  >("revenue");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      organizationName: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const watchedName = useWatch({ control, name: "name" }) || "";
  const watchedEmail = useWatch({ control, name: "email" }) || "";
  const watchedOrgName = useWatch({ control, name: "organizationName" }) || "";
  const watchedPassword = useWatch({ control, name: "password" }) || "";
  const watchedConfirmPassword = useWatch({ control, name: "confirmPassword" }) || "";
  const workspaceSlug = slugify(watchedOrgName);
  const passwordStrength = calculatePasswordStrength(watchedPassword);

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        organizationName: data.organizationName,
      });

      setIsSuccess(true);
      setCreatedOrgName(result.memberships?.[0]?.organizationName || data.organizationName);

      // Smooth auto-navigation to email verification code step after registration
      setTimeout(() => {
        router.push(`/verify-email?registered=true&email=${encodeURIComponent(data.email)}`);
      }, 1600);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.status === 409) {
          setServerError(
            "A user or workspace with this email already exists. Please sign in instead."
          );
        } else if (err.status === 429) {
          setServerError("Too many registration attempts from this IP. Please wait a few minutes.");
        } else {
          setServerError(err.message || "Failed to create workspace. Please check your details.");
        }
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("An unexpected network error occurred. Please try again.");
      }
    }
  };

  // Celebratory Success View
  if (isSuccess) {
    return (
      <div data-wide-auth="true" className="mx-auto w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-2xl backdrop-blur-3xl">
            {/* Top Specular Line */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              aria-hidden="true"
            />

            <CardHeader className="pt-10 pb-4 text-center">
              <div className="animate-in zoom-in-75 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-50 text-emerald-600 shadow-[0_0_32px_rgba(16,185,129,0.25)] duration-500">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
                Workspace Provisioned!
              </CardTitle>
              <CardDescription className="mx-auto mt-2.5 max-w-sm text-sm text-slate-600">
                Welcome to <span className="font-semibold text-slate-900">{createdOrgName}</span>.
                Your isolated operations cluster has been initialized.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pb-8 text-center">
              {/* Endpoint Box */}
              <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/90 p-4 font-mono text-xs shadow-xs">
                <div className="flex items-center justify-between font-sans text-[11px] text-slate-500">
                  <span>Dedicated Production Subdomain</span>
                  <span className="font-mono font-semibold text-emerald-600">● ACTIVE</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-sm text-slate-900">
                  <Globe className="text-primary h-4 w-4" />
                  <span className="text-slate-500">https://flowpilot.app/workspace/</span>
                  <span className="text-primary font-bold">{workspaceSlug}</span>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span>
                    Role: <strong className="text-slate-900">OWNER</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Multi-tenant Isolation:{" "}
                    <strong className="font-semibold text-emerald-600">Active</strong>
                  </span>
                </div>
              </div>

              {/* Micro Provisioning Checklist */}
              <div className="space-y-1.5 rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 text-left font-mono text-[11px] text-slate-700">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>Multi-tenant PostgreSQL isolated boundary mapped</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>Argon2id cryptographic master keys stored</span>
                </div>
                <div className="text-primary flex items-center gap-2">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                    <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
                  </span>
                  <span>6-Digit Verification Code dispatched to email inbox</span>
                </div>
              </div>

              <Button
                type="button"
                className="from-primary shadow-primary/25 relative mt-2 h-12 w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r via-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                onClick={() => router.push("/verify-email?registered=true")}
              >
                <span>Enter 6-Digit Verification Code</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div data-wide-auth="true" className="w-full">
      <div className="grid w-full items-start gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12">
        {/* Left Column: Living "Next-Gen SaaS Command Center" with Framer Motion entrance */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="hidden justify-between space-y-6 pt-1 lg:col-span-5 lg:flex lg:flex-col"
        >
          {/* Top Pill & Headline */}
          <div className="space-y-4">
            <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold shadow-xs backdrop-blur-md">
              <Sparkles className="text-primary h-3.5 w-3.5" />
              <span>Next-Gen Operations Architecture</span>
            </div>

            <h1 className="text-3xl leading-[1.15] font-extrabold tracking-tight text-slate-900 xl:text-4xl">
              One unified command center for your{" "}
              <span className="from-primary bg-gradient-to-r via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                entire business.
              </span>
            </h1>

            <p className="text-sm leading-relaxed text-slate-600">
              Replace fragmented tools with an all-in-one operations hub for client scheduling,
              automated invoicing, customer intelligence, and team access.
            </p>
          </div>

          {/* Interactive Live Workspace macOS Preview Card */}
          <div className="group relative space-y-3.5 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-[0_20px_50px_-15px_rgba(23,32,51,0.08),0_0_1px_1px_rgba(23,32,51,0.03)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_25px_60px_-15px_rgba(49,95,232,0.12)]">
            {/* Soft Ambient Radial Lights */}
            <div
              className="from-primary/10 pointer-events-none absolute -top-20 -left-20 h-44 w-44 rounded-full bg-gradient-to-br to-cyan-400/10 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -right-20 -bottom-20 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl"
              aria-hidden="true"
            />

            {/* Floating Live Activity Toast */}
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1 -right-1 z-20 hidden items-center gap-2 rounded-full border border-emerald-500/25 bg-white/95 px-3 py-1 text-[10px] font-semibold text-emerald-700 shadow-md shadow-emerald-500/10 backdrop-blur-md select-none xl:flex"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>⚡ $1,450 Invoice auto-settled</span>
            </motion.div>

            {/* macOS Window Controls & Header */}
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
              <div className="flex items-center gap-2">
                {/* 3 colored traffic dots */}
                <div className="flex items-center gap-1.5 pr-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/90 shadow-xs" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/90 shadow-xs" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/90 shadow-xs" />
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-xs">
                  <Building2 className="text-primary h-3.5 w-3.5" />
                  <span className="max-w-[150px] truncate">
                    {watchedOrgName.trim() || "Your Business Name"}
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Isolated DB
              </span>
            </div>

            {/* Live Subdomain Terminal Bar */}
            <div className="space-y-1 rounded-xl border border-slate-200/90 bg-slate-50/90 p-3 font-mono text-xs shadow-xs">
              <div className="flex items-center justify-between font-sans text-[10px] tracking-wider text-slate-500 uppercase">
                <span>Workspace URL</span>
                <span className="text-[10px] font-semibold text-emerald-600">● REAL-TIME SYNC</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-800">
                <Globe className="text-primary h-3.5 w-3.5 shrink-0" />
                <span className="text-slate-500">flowpilot.app/</span>
                <span className="text-primary truncate font-bold">{workspaceSlug}</span>
              </div>
            </div>

            {/* Interactive Preview Tabs (Revenue | Appointments | Invoicing) */}
            <div className="flex rounded-lg border border-slate-200/80 bg-slate-100/70 p-1 text-xs">
              <button
                type="button"
                onClick={() => setActivePreviewTab("revenue")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 text-[11px] font-semibold transition-all duration-200",
                  activePreviewTab === "revenue"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                <Activity className="h-3 w-3" />
                Revenue
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab("appointments")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 text-[11px] font-semibold transition-all duration-200",
                  activePreviewTab === "appointments"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                <Calendar className="h-3 w-3" />
                Bookings
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab("invoices")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1 text-[11px] font-semibold transition-all duration-200",
                  activePreviewTab === "invoices"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                <CreditCard className="h-3 w-3" />
                Invoices
              </button>
            </div>

            {/* Dynamic Interactive Card Body with AnimatePresence */}
            <AnimatePresence mode="wait">
              {activePreviewTab === "revenue" && (
                <motion.div
                  key="revenue"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Activity className="text-primary h-3.5 w-3.5" />
                      Monthly Recurring Revenue
                    </span>
                    <span className="flex items-center rounded-md border border-emerald-200/60 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      <TrendingUp className="mr-0.5 h-2.5 w-2.5" />
                      +28.4%
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-extrabold tracking-tight text-slate-900">
                        $42,850
                      </span>
                      <span className="ml-1 text-[11px] text-slate-400">USD/mo</span>
                    </div>
                    {/* Animated SVG Sparkline with gradient & pulsing tip */}
                    <div className="relative">
                      <svg className="h-6 w-20 overflow-visible" viewBox="0 0 60 20" fill="none">
                        <path
                          d="M2 17 L14 12 L26 14 L38 6 L50 9 L58 2"
                          stroke="url(#sparkline-grad)"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="58" cy="2" r="2.5" fill="#10b981" />
                        <defs>
                          <linearGradient
                            id="sparkline-grad"
                            x1="0"
                            y1="0"
                            x2="60"
                            y2="0"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#315fe8" />
                            <stop offset="1" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}

              {activePreviewTab === "appointments" && (
                <motion.div
                  key="appointments"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                      Confirmed Bookings
                    </span>
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-600">
                      99.2% Attendance
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-extrabold tracking-tight text-slate-900">
                        18 Booked
                      </span>
                      <span className="ml-1 text-[11px] text-slate-500">Today</span>
                    </div>
                    <div className="flex -space-x-1.5">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-[9px] font-bold text-white ring-2 ring-white">
                        AM
                      </span>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-teal-500 text-[9px] font-bold text-white ring-2 ring-white">
                        SR
                      </span>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-violet-500 to-purple-600 text-[9px] font-bold text-white ring-2 ring-white">
                        +24
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activePreviewTab === "invoices" && (
                <motion.div
                  key="invoices"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <CreditCard className="h-3.5 w-3.5 text-teal-600" />
                      Auto-Reconciliation
                    </span>
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-700">
                      &lt; 2 hrs avg speed
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-extrabold tracking-tight text-slate-900">
                        $12,400
                      </span>
                      <span className="ml-1 text-[11px] font-semibold text-emerald-600">
                        • 0 Overdue
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-700">
                      <BadgeCheck className="h-3 w-3 text-emerald-600" />
                      Stripe Connected
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom 3 Status Pills */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-2 text-center shadow-xs">
                <div className="font-semibold text-slate-900">OWNER</div>
                <div className="text-[10px] text-slate-500">Scoped Admin</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-2 text-center shadow-xs">
                <div className="font-semibold text-emerald-600">14 Days</div>
                <div className="text-[10px] text-slate-500">Pro Trial</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-2 text-center shadow-xs">
                <div className="text-primary font-mono font-semibold">Argon2id</div>
                <div className="text-[10px] text-slate-500">Encrypted</div>
              </div>
            </div>
          </div>

          {/* Three Feature Pillars */}
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 shadow-xs">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-slate-900">Zero-Leak Multi-Tenancy</h4>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  PostgreSQL-level isolation guarantees organizational data never crosses tenant
                  boundaries.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-xs">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-slate-900">
                  Integrated Billing & Invoicing
                </h4>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  Generate professional branded invoices, auto-reconcile payments, and manage client
                  balances.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 text-teal-600 shadow-xs">
                <Zap className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-slate-900">
                  Real-Time Scheduling & Sync
                </h4>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  Automated appointment booking with staff availability and instant client
                  notifications.
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof Pill */}
          <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3.5 shadow-xs backdrop-blur-md">
            <div className="flex items-center gap-1 pb-1.5 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1 text-[11px] font-semibold text-slate-900">5.0</span>
              <span className="text-[11px] text-slate-500">• 2,500+ businesses</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 italic">
              &ldquo;FlowPilot gave our team a single, secure home for client bookings and finances.
              Setup took less than two minutes.&rdquo;
            </p>
          </div>
        </motion.div>

        {/* Right Column: Executive Frosted White Register Form Card with Motion Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7"
        >
          <Card className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_20px_50px_-15px_rgba(23,32,51,0.08),0_0_1px_1px_rgba(23,32,51,0.03)] backdrop-blur-2xl">
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

            <CardHeader className="space-y-2 pb-5">
              <div className="flex items-center justify-between">
                <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase shadow-xs">
                  <Sparkles className="h-3 w-3" />
                  14-Day Free Trial
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  No credit card needed
                </span>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create your business workspace
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                Set up an isolated operations hub for your clients, services, scheduling, and
                billing.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <CardContent className="space-y-4">
                {/* Server Error Alert */}
                {serverError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 shadow-xs"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                    <div className="space-y-1">
                      <p className="font-semibold text-rose-900">Unable to register</p>
                      <p className="leading-relaxed opacity-90">{serverError}</p>
                    </div>
                  </div>
                )}

                {/* Grid for Name & Business Email */}
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {/* Full Name Field */}
                  <div className="group space-y-1.5">
                    <Label htmlFor="register-name" isRequired className="text-slate-800">
                      Full Name
                    </Label>
                    <div className="relative">
                      <div className="group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors">
                        <User className="h-4 w-4 transition-transform duration-200 group-focus-within:scale-110" />
                      </div>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="e.g. Alex Morgan"
                        autoComplete="name"
                        className="focus-visible:border-primary focus-visible:ring-primary/15 h-11 rounded-xl border-slate-200 bg-white pl-9.5 text-sm text-slate-900 shadow-xs transition-all placeholder:text-slate-400 hover:bg-slate-50/50 focus-visible:ring-4"
                        hasError={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        {...register("name")}
                      />
                      {watchedName.trim().length >= 2 && !errors.name && (
                        <div className="animate-in fade-in zoom-in-75 pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-600 duration-200">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    {errors.name && (
                      <p id="name-error" className="text-xs text-rose-600" role="alert">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Business Email Field */}
                  <div className="group space-y-1.5">
                    <Label htmlFor="register-email" isRequired className="text-slate-800">
                      Business Email
                    </Label>
                    <div className="relative">
                      <div className="group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors">
                        <Mail className="h-4 w-4 transition-transform duration-200 group-focus-within:scale-110" />
                      </div>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="name@company.com"
                        autoComplete="email"
                        className="focus-visible:border-primary focus-visible:ring-primary/15 h-11 rounded-xl border-slate-200 bg-white pl-9.5 text-sm text-slate-900 shadow-xs transition-all placeholder:text-slate-400 hover:bg-slate-50/50 focus-visible:ring-4"
                        hasError={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        {...register("email")}
                      />
                      {watchedEmail.includes("@") &&
                        watchedEmail.includes(".") &&
                        !errors.email && (
                          <div className="animate-in fade-in zoom-in-75 pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-600 duration-200">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}
                    </div>
                    {errors.email && (
                      <p id="email-error" className="text-xs text-rose-600" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Organization / Workspace Name Field */}
                <div className="group space-y-1.5">
                  <Label htmlFor="register-org" isRequired className="text-slate-800">
                    Organization / Workspace Name
                  </Label>
                  <div className="relative">
                    <div className="group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors">
                      <Building2 className="h-4 w-4 transition-transform duration-200 group-focus-within:scale-110" />
                    </div>
                    <Input
                      id="register-org"
                      type="text"
                      placeholder="e.g. Apex Global Operations"
                      autoComplete="organization"
                      className="focus-visible:border-primary focus-visible:ring-primary/15 h-11 rounded-xl border-slate-200 bg-white pl-9.5 text-sm text-slate-900 shadow-xs transition-all placeholder:text-slate-400 hover:bg-slate-50/50 focus-visible:ring-4"
                      hasError={!!errors.organizationName}
                      aria-describedby={errors.organizationName ? "org-error" : undefined}
                      {...register("organizationName")}
                    />
                    {watchedOrgName.trim().length >= 2 && !errors.organizationName && (
                      <div className="animate-in fade-in zoom-in-75 pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-600 duration-200">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  {errors.organizationName && (
                    <p id="org-error" className="text-xs text-rose-600" role="alert">
                      {errors.organizationName.message}
                    </p>
                  )}

                  {/* Real-time Slug Preview Pill */}
                  {watchedOrgName && watchedOrgName.trim().length > 0 && (
                    <div className="border-primary/20 bg-primary/10 text-primary animate-in fade-in flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs shadow-xs duration-200">
                      <span className="font-sans text-[11px] opacity-80">workspace:</span>
                      <span className="truncate font-semibold">flowpilot.app/{workspaceSlug}</span>
                    </div>
                  )}
                </div>

                {/* Password & Confirm Password Grid */}
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {/* Password Field */}
                  <div className="group space-y-1.5">
                    <Label htmlFor="register-password" isRequired className="text-slate-800">
                      Password
                    </Label>
                    <div className="relative">
                      <div className="group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors">
                        <Lock className="h-4 w-4 transition-transform duration-200 group-focus-within:scale-110" />
                      </div>
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        autoComplete="new-password"
                        className="focus-visible:border-primary focus-visible:ring-primary/15 h-11 rounded-xl border-slate-200 bg-white pr-10 pl-9.5 text-sm text-slate-900 shadow-xs transition-all placeholder:text-slate-400 hover:bg-slate-50/50 focus-visible:ring-4"
                        hasError={!!errors.password}
                        aria-describedby="password-strength-criteria"
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-rose-600" role="alert">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="group space-y-1.5">
                    <Label
                      htmlFor="register-confirm-password"
                      isRequired
                      className="text-slate-800"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <div className="group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors">
                        <Lock className="h-4 w-4 transition-transform duration-200 group-focus-within:scale-110" />
                      </div>
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        autoComplete="new-password"
                        className="focus-visible:border-primary focus-visible:ring-primary/15 h-11 rounded-xl border-slate-200 bg-white pr-10 pl-9.5 text-sm text-slate-900 shadow-xs transition-all placeholder:text-slate-400 hover:bg-slate-50/50 focus-visible:ring-4"
                        hasError={!!errors.confirmPassword}
                        aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                        {...register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors focus:outline-none"
                        aria-label={
                          showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p id="confirm-error" className="text-xs text-rose-600" role="alert">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                    {watchedConfirmPassword.length > 0 &&
                      watchedPassword === watchedConfirmPassword && (
                        <p className="animate-in fade-in flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Passwords match</span>
                        </p>
                      )}
                  </div>
                </div>

                {/* Real-time Liquid Password Strength Meter */}
                {watchedPassword.length > 0 && (
                  <div
                    className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/90 p-3 shadow-xs"
                    id="password-strength-criteria"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Security Strength:</span>
                      <span className="font-semibold text-slate-900">{passwordStrength.label}</span>
                    </div>

                    {/* 4-Segment Strength Bar */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            step <= passwordStrength.score ? passwordStrength.color : "bg-slate-200"
                          )}
                        />
                      ))}
                    </div>

                    {/* Criteria Checklist */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                      {passwordStrength.criteria.map((item) => (
                        <div
                          key={item.label}
                          className={cn(
                            "flex items-center gap-1.5 transition-colors",
                            item.passed ? "font-medium text-emerald-700" : "text-slate-400"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px]",
                              item.passed
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-200 text-slate-400"
                            )}
                          >
                            <Check className="h-2.5 w-2.5" />
                          </span>
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Terms & Privacy Checkbox */}
                <div className="pt-1">
                  <label className="flex cursor-pointer items-start gap-2.5 text-xs select-none">
                    <input
                      type="checkbox"
                      className="text-primary focus:ring-primary focus:ring-offset-background mt-0.5 h-4 w-4 rounded border-slate-300"
                      {...register("agreeTerms")}
                    />
                    <span className="leading-normal text-slate-600">
                      I agree to the{" "}
                      <span className="text-foreground hover:text-primary font-medium underline underline-offset-2">
                        Terms of Service
                      </span>{" "}
                      and acknowledge the{" "}
                      <span className="text-foreground hover:text-primary font-medium underline underline-offset-2">
                        Privacy Policy
                      </span>
                      .
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="mt-1 text-xs text-rose-600" role="alert">
                      {errors.agreeTerms.message}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3.5 pt-2">
                {/* High-Converting Animated Shimmer CTA Button with Active Scale Bounce */}
                <Button
                  type="submit"
                  className="from-primary shadow-primary/25 hover:shadow-primary/40 relative h-12 w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r via-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg transition-all before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent hover:scale-[1.01] hover:before:animate-[shimmer_1.8s_infinite] active:scale-[0.98]"
                  isLoading={isSubmitting}
                >
                  <Layers className="mr-2 h-4 w-4" />
                  <span>Create Workspace & Get Started</span>
                </Button>

                {/* Multi-Tenant Security Trust Callout */}
                <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-center text-[11px] text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>Your workspace will be provisioned in an isolated database boundary.</span>
                </div>

                {/* Sign In Navigation Link */}
                <div className="text-center text-xs text-slate-500">
                  Already have a workspace?{" "}
                  <Link
                    href="/login"
                    className="text-primary font-semibold underline-offset-2 hover:underline"
                  >
                    Sign in to your account
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
