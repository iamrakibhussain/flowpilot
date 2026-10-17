"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Building2,
  Calendar,
  Users,
  FileText,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Clock,
  Zap,
  Lock,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Server,
  Check,
  CheckCheck,
  Activity,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";

/**
 * 3D Spatial Glass Window Container with Specular Rim Light & Parallax
 */
interface SpatialCockpitWindowProps {
  children: React.ReactNode;
  glowColor?: string;
  className?: string;
}

const SpatialCockpitWindow: React.FC<SpatialCockpitWindowProps> = ({
  children,
  glowColor = "rgba(49, 95, 232, 0.12)",
  className = "",
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      style={{ perspective: 1000 }}
      className={`relative ${className}`}
    >
      {/* Subtle Ambient Glow Mesh */}
      <div
        className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl blur-2xl transition-opacity duration-500"
        style={{
          background: glowColor,
          opacity: isHovered ? 0.45 : 0.2,
        }}
        aria-hidden="true"
      />

      {/* 3D Tilting Glass Cockpit */}
      <div
        style={{
          transform:
            shouldReduceMotion || !isHovered
              ? "none"
              : `rotateY(${mousePos.x * 5}deg) rotateX(${-mousePos.y * 5}deg) translateZ(8px)`,
          transition: "transform 0.16s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
        className="group border-border/80 bg-surface/90 relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border shadow-lg backdrop-blur-xl transition-all duration-300"
      >
        {/* Specular Rim Highlight Light Beam */}
        <div
          className="pointer-events-none absolute inset-x-8 top-0 z-20 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent transition-opacity duration-300 group-hover:via-white"
          aria-hidden="true"
        />

        {/* Dynamic Cursor Spotlight Glare */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(450px circle at ${(mousePos.x + 0.5) * 100}% ${(mousePos.y + 0.5) * 100}%, rgba(255, 255, 255, 0.12), transparent 60%)`,
          }}
          aria-hidden="true"
        />

        {children}
      </div>
    </div>
  );
};

interface WorkflowStep {
  id: number;
  stepNumber: string;
  badge: string;
  title: string;
  description: string;
  highlight: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 0,
    stepNumber: "01",
    badge: "Workspace Provisioning",
    title: "Establish Your Business Workspace",
    description:
      "Initialize your multi-tenant organization profile with your operating currency, timezone, and business details.",
    highlight: "Postgres Row Level Security (RLS) guarantees complete tenant isolation.",
    icon: Building2,
    accentColor: "rgba(59, 130, 246, 0.28)",
  },
  {
    id: 1,
    stepNumber: "02",
    badge: "Capacity & Buffers",
    title: "Configure Services & Staff Availability",
    description:
      "Define your service offerings, session durations, pricing, and individual team member working hours.",
    highlight:
      "Automated buffer intervals guarantee consultants never face back-to-back collisions.",
    icon: Calendar,
    accentColor: "rgba(16, 185, 129, 0.28)",
  },
  {
    id: 2,
    stepNumber: "03",
    badge: "Delivery Coordination",
    title: "Coordinate Appointments & Client Delivery",
    description:
      "Manage incoming bookings, synchronize team schedules, and log client interaction context directly in customer dossiers.",
    highlight: "Role-Based Access Control keeps confidential financial margins strictly locked.",
    icon: Users,
    accentColor: "rgba(245, 158, 11, 0.28)",
  },
  {
    id: 3,
    stepNumber: "04",
    badge: "Instant Liquidity",
    title: "Issue Invoices & Reconcile Cash Flow",
    description:
      "Convert completed client sessions directly into itemized invoices with automated tax calculations and payment tracking.",
    highlight: "Eliminates end-of-month manual reconciliation with instant Stripe Connect payouts.",
    icon: FileText,
    accentColor: "rgba(6, 182, 212, 0.28)",
  },
];

export const WorkflowSection: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [selectedCurrency, setSelectedCurrency] = React.useState<"USD" | "EUR" | "GBP" | "BDT">(
    "USD"
  );
  const [activeServiceChip, setActiveServiceChip] = React.useState(0);
  const [isSettledStage4, setIsSettledStage4] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Auto-advancing orchestration timeline (6s per step)
  React.useEffect(() => {
    if (!isPlaying || shouldReduceMotion) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying, shouldReduceMotion]);

  const currentStep = workflowSteps[activeStep];

  const handleNextStep = () => {
    setIsPlaying(false);
    setActiveStep((prev) => (prev + 1) % workflowSteps.length);
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    setActiveStep((prev) => (prev - 1 + workflowSteps.length) % workflowSteps.length);
  };

  return (
    <section
      id="how-it-works"
      className="border-border/70 bg-surface/40 relative scroll-mt-20 overflow-hidden border-t py-20 md:py-28"
    >
      {/* Background Holographic Glow Mesh & Dot Grid Matrix */}
      <div
        className="from-primary/10 pointer-events-none absolute inset-x-0 top-1/4 -z-10 mx-auto h-[600px] w-full max-w-6xl rounded-full bg-gradient-to-br via-indigo-500/10 to-cyan-400/10 opacity-70 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(#315fe8_1px,transparent_1px)] [background-size:24px_24px] opacity-20"
        aria-hidden="true"
      />

      <Container>
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/10 text-primary px-4 py-1 text-xs font-semibold backdrop-blur-xl"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            <span>How FlowPilot Works</span>
          </Badge>

          <h2 className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            A Straightforward Workflow from Setup to Scale
          </h2>

          <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
            FlowPilot transforms everyday service operations into a predictable, connected sequence.
            Explore the live operational progression below.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* MAIN PIPELINE CONSOLE: 12-COL ASYMMETRIC GRID */}
        {/* ========================================================================= */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* ======================================================================= */}
          {/* LEFT COLUMN: ILLUMINATED CIRCUIT STEPPER (5 COLS) */}
          {/* ======================================================================= */}
          <div className="relative flex flex-col justify-between space-y-4 lg:col-span-5">
            {/* Vertical Laser Circuit Line (Desktop) */}
            <div
              className="border-border/60 bg-border/40 absolute top-7 bottom-7 left-[34px] -z-0 hidden w-[2px] lg:block"
              aria-hidden="true"
            >
              <motion.div
                className="from-primary w-full bg-gradient-to-b via-cyan-400 to-indigo-600 shadow-[0_0_12px_rgba(49,95,232,0.6)]"
                animate={{
                  height: `${(activeStep / (workflowSteps.length - 1)) * 100}%`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>

            {workflowSteps.map((step, idx) => {
              const isActive = activeStep === idx;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.id}
                  onClick={() => {
                    setActiveStep(idx);
                    setIsPlaying(false);
                  }}
                  className={`group relative z-10 cursor-pointer overflow-hidden rounded-2xl border p-5 transition-all duration-300 backdrop-blur-xl ${
                    isActive
                      ? "border-primary/60 bg-surface shadow-[0_12px_35px_-8px_rgba(49,95,232,0.18)]"
                      : "border-border/70 bg-surface/75 hover:border-border hover:bg-surface/95 hover:shadow-xs"
                  }`}
                >
                  {/* Top Specular Rim Line */}
                  <div
                    className={`pointer-events-none absolute inset-x-4 top-0 h-[1px] transition-opacity duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                        : "bg-gradient-to-r from-transparent via-white/80 dark:via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                    }`}
                    aria-hidden="true"
                  />

                  {/* Active Indicator Spring Background Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="active-workflow-card-indicator"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      className="from-primary absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b to-indigo-600"
                    />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Step Numeric Node with Double-Ring Ripple */}
                    <div className="relative shrink-0">
                      {isActive && (
                        <span className="bg-primary/25 absolute -inset-1 animate-ping rounded-xl" />
                      )}
                      <div
                        className={`relative flex h-11 w-11 items-center justify-center rounded-xl font-mono text-sm font-black transition-all ${
                          isActive
                            ? "from-primary border-primary/30 bg-gradient-to-br to-indigo-600 text-white shadow-[0_0_20px_rgba(49,95,232,0.35)]"
                            : "bg-surface/90 border-border/80 text-muted-foreground group-hover:text-foreground group-hover:border-primary/30 border shadow-2xs"
                        }`}
                      >
                        <StepIcon className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground font-mono text-[11px] font-bold tracking-wider uppercase">
                          Stage {step.stepNumber} &bull; {step.badge}
                        </span>
                        {isActive && (
                          <span className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                            Active
                          </span>
                        )}
                      </div>

                      <h3
                        className={`mt-1 text-base font-bold transition-colors ${
                          isActive
                            ? "text-foreground font-extrabold"
                            : "text-foreground/85 group-hover:text-foreground"
                        }`}
                      >
                        {step.title}
                      </h3>

                      <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                        {step.description}
                      </p>

                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>{step.highlight}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Step Progress Timer Bar */}
                  {isActive && isPlaying && !shouldReduceMotion && (
                    <div className="bg-border/60 absolute right-0 bottom-0 left-0 h-1 overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 6, ease: "linear" }}
                        key={`timer-${activeStep}`}
                        className="from-primary h-full bg-gradient-to-r to-indigo-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN: 3D SPATIAL COCKPIT CONSOLE (7 COLS) */}
          {/* ======================================================================= */}
          <div className="lg:col-span-7">
            <SpatialCockpitWindow glowColor={currentStep.accentColor}>
              {/* Window Console Header Bar */}
              <div className="border-border/70 bg-muted/40 flex items-center justify-between border-b px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-muted-foreground font-mono text-[11px] font-medium">
                    flowpilot-orchestrator // stage-0{activeStep + 1}
                  </span>
                </div>

                {/* Stage Controls: Prev / Next / Play-Pause */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    title="Previous Stage"
                    className="border-border/70 hover:bg-background/90 text-muted-foreground hover:text-foreground flex h-7 w-7 items-center justify-center rounded-lg border transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    title="Next Stage"
                    className="border-border/70 hover:bg-background/90 text-muted-foreground hover:text-foreground flex h-7 w-7 items-center justify-center rounded-lg border transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    title={isPlaying ? "Pause automated workflow" : "Resume automated workflow"}
                    className="border-border/70 hover:bg-background/90 text-muted-foreground hover:text-foreground flex h-7 w-7 items-center justify-center rounded-lg border transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 sm:inline-flex">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    LIVE PIPELINE
                  </span>
                </div>
              </div>

              {/* Holographic Stage Viewport */}
              <div className="relative min-h-[400px] p-4 sm:p-8">
                <AnimatePresence mode="wait">
                  {/* =============================================================== */}
                  {/* SCREEN 01: WORKSPACE & TENANT SHARD ARCHITECTURE */}
                  {/* =============================================================== */}
                  {activeStep === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.28 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                          <div className="from-primary flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br to-indigo-600 text-white shadow-xs">
                            <Server className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-foreground text-sm font-extrabold">
                              Isolated Multi-Tenant Shard
                            </h4>
                            <p className="text-muted-foreground text-[11px]">
                              Postgres Row-Level Security partition (tenant_org_apx92)
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-bold text-emerald-600">
                          Shard Active
                        </span>
                      </div>

                      {/* Interactive Currency Selector */}
                      <div className="border-border/70 bg-background/95 rounded-2xl border p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="text-foreground font-bold">
                              Operating Ledger Currency:
                            </span>
                            <p className="text-muted-foreground text-[10px]">
                              All invoicing, payout ledgers, and reporting normalize here
                            </p>
                          </div>
                          <div className="border-border/70 bg-surface flex items-center rounded-lg border p-1">
                            {(["USD", "EUR", "GBP", "BDT"] as const).map((curr) => (
                              <button
                                key={curr}
                                type="button"
                                onClick={() => setSelectedCurrency(curr)}
                                className={`rounded-md px-2.5 py-0.5 font-mono text-xs font-bold transition-all ${
                                  selectedCurrency === curr
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {curr}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Live Shard Telemetry Metrics */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="border-border/80 bg-background/95 shadow-2xs relative overflow-hidden rounded-xl border p-3">
                          <div className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" aria-hidden="true" />
                          <span className="text-muted-foreground block text-[10px] font-medium">
                            Tenant Isolation
                          </span>
                          <span className="mt-1 flex items-center gap-1 font-mono text-xs font-black text-emerald-600">
                            <ShieldCheck className="h-3.5 w-3.5" /> 100% RLS Isolated
                          </span>
                        </div>
                        <div className="border-border/80 bg-background/95 shadow-2xs relative overflow-hidden rounded-xl border p-3">
                          <div className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" aria-hidden="true" />
                          <span className="text-muted-foreground block text-[10px] font-medium">
                            Cluster Latency
                          </span>
                          <span className="text-foreground mt-1 flex items-center gap-1 font-mono text-xs font-black">
                            <Activity className="h-3.5 w-3.5 text-blue-500" /> 12ms Region US-E
                          </span>
                        </div>
                        <div className="border-border/80 bg-background/95 shadow-2xs relative col-span-2 overflow-hidden rounded-xl border p-3 sm:col-span-1">
                          <div className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" aria-hidden="true" />
                          <span className="text-muted-foreground block text-[10px] font-medium">
                            Data Leak Test
                          </span>
                          <span className="mt-1 block font-mono text-xs font-black text-emerald-600">
                            ✓ 0 Leaks Detected
                          </span>
                        </div>
                      </div>

                      <div className="border-border/60 flex items-center justify-between rounded-xl border bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span>
                            Tenant space online. Ready for automated scheduling & billing hand-off.
                          </span>
                        </div>
                        <span className="font-mono text-[10px]">Zero Config</span>
                      </div>
                    </motion.div>
                  )}

                  {/* =============================================================== */}
                  {/* SCREEN 02: SERVICES & CAPACITY COLLISION ENGINE */}
                  {/* =============================================================== */}
                  {activeStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.28 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 shadow-xs">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-foreground text-sm font-extrabold">
                              Service Matrix & Smart Rest Buffers
                            </h4>
                            <p className="text-muted-foreground text-[11px]">
                              Zero scheduling collision engine with automated rest gaps
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-bold text-emerald-600">
                          Buffer: +15m Auto
                        </span>
                      </div>

                      {/* Interactive Service Chips */}
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {[
                          { title: "Strategy Call", duration: "60 mins", price: "$250" },
                          { title: "Arch Review", duration: "90 mins", price: "$400" },
                          { title: "Advisory Sprint", duration: "30 mins", price: "$150" },
                        ].map((srv, i) => (
                          <button
                            key={srv.title}
                            type="button"
                            onClick={() => setActiveServiceChip(i)}
                            className={`rounded-xl border p-3 text-left transition-all ${
                              activeServiceChip === i
                                ? "border-emerald-500/70 bg-emerald-500/10 shadow-xs"
                                : "border-border/70 bg-background/85 hover:border-border"
                            }`}
                          >
                            <span className="text-foreground block text-xs font-bold">
                              {srv.title}
                            </span>
                            <span className="text-muted-foreground block text-[10px]">
                              {srv.duration}
                            </span>
                            <span className="font-mono text-xs font-extrabold text-emerald-600">
                              {srv.price}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Visual Timeline Buffer Shield Demonstration */}
                      <div className="border-border/70 bg-background/95 rounded-2xl border p-4 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-foreground">
                            Live Timeline Protection Demonstration
                          </span>
                          <span className="font-mono text-[10px] text-emerald-600">
                            Active Collision Guard
                          </span>
                        </div>

                        {/* Meeting Slot ➔ Buffer Wall ➔ Next Available Slot */}
                        <div className="mt-3 grid grid-cols-12 items-center gap-2 text-xs">
                          <div className="bg-surface border-border/80 col-span-5 rounded-xl border p-2.5 text-center">
                            <span className="text-foreground block font-bold">
                              09:00 - 10:00 AM
                            </span>
                            <span className="text-muted-foreground block text-[10px]">
                              Client Strategy Call
                            </span>
                          </div>

                          <div className="col-span-3 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-500/15 p-2 text-center text-emerald-700 dark:text-emerald-300">
                            <span className="flex items-center justify-center gap-1 font-mono text-[11px] font-black">
                              <Clock className="h-3 w-3" /> +15m
                            </span>
                            <span className="block text-[9px] font-bold">Protected Buffer</span>
                          </div>

                          <div className="bg-surface border-border/80 col-span-4 rounded-xl border p-2.5 text-center">
                            <span className="text-foreground block font-bold">10:15 AM</span>
                            <span className="text-muted-foreground block text-[10px]">
                              Next Open Slot
                            </span>
                          </div>
                        </div>

                        {/* Capacity Load Monitor */}
                        <div className="mt-3.5 space-y-2 border-t pt-2.5 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Sarah Chen (Principal Lead)
                            </span>
                            <span className="text-foreground font-mono font-bold">
                              75% Capacity [Balanced]
                            </span>
                          </div>
                          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                            <div className="h-full w-3/4 rounded-full bg-emerald-500" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* =============================================================== */}
                  {/* SCREEN 03: COORDINATE APPOINTMENTS & CLIENT DELIVERY */}
                  {/* =============================================================== */}
                  {activeStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.28 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 shadow-xs">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-foreground text-sm font-extrabold">
                              Live Client Delivery & Context Sync
                            </h4>
                            <p className="text-muted-foreground text-[11px]">
                              Booking automatically merged into customer history & RBAC scope
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-bold text-amber-600">
                          Stream Synced
                        </span>
                      </div>

                      {/* Live Booking Dispatch Card */}
                      <div className="border-border/80 bg-background/95 relative overflow-hidden rounded-2xl border p-4.5 shadow-sm backdrop-blur-xl">
                        {/* Specular Top Rim */}
                        <div
                          className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent"
                          aria-hidden="true"
                        />
                        <div className="border-border/60 flex items-center justify-between border-b pb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9.5 w-9.5 items-center justify-center rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-500/15 to-amber-500/5 font-mono text-xs font-bold text-amber-600 shadow-2xs">
                              02:00
                            </div>
                            <div>
                              <p className="text-foreground text-xs font-bold">
                                Enterprise Infrastructure Review
                              </p>
                              <p className="text-muted-foreground text-[11px]">
                                Apex Solutions &bull; Sarah Chen &bull; Marcus Vance
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-blue-600">
                            60m Zoom Synced
                          </span>
                        </div>

                        {/* Automatic Briefing Memo */}
                        <div className="bg-surface/90 border-border/80 shadow-2xs relative mt-3 overflow-hidden rounded-xl border p-3 text-xs">
                          <div className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" aria-hidden="true" />
                          <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                            Auto-Attached Context Memo:
                          </span>
                          <p className="text-foreground/90 mt-1 text-[11px] leading-relaxed">
                            &quot;Client requested architectural assessment of multi-tenant database
                            migration. All NDA covenants validated under tenant org_apx92.&quot;
                          </p>
                        </div>

                        {/* RBAC Boundary Security Pill */}
                        <div className="border-border/50 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2.5 text-[10px]">
                          <span className="flex items-center gap-1.5">
                            <Lock className="h-3 w-3 text-amber-500" />
                            <span>Billing scope masked for non-finance team members</span>
                          </span>
                          <span className="font-semibold text-emerald-600">RBAC Verified</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* =============================================================== */}
                  {/* SCREEN 04: ISSUE INVOICES & RECONCILE CASH FLOW */}
                  {/* =============================================================== */}
                  {activeStep === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.28 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-600 shadow-xs">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-foreground text-sm font-extrabold">
                              One-Click Invoice & Stripe Settlement
                            </h4>
                            <p className="text-muted-foreground text-[11px]">
                              Delivered appointment hours converted into instant payouts
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 font-mono text-[11px] font-bold text-cyan-600">
                          Stripe Connected
                        </span>
                      </div>

                      {/* Invoice Summary Card */}
                      <div className="border-border/80 bg-background/95 relative overflow-hidden rounded-2xl border p-4.5 shadow-sm backdrop-blur-xl">
                        {/* Specular Top Rim */}
                        <div
                          className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/80 dark:via-white/20 to-transparent"
                          aria-hidden="true"
                        />
                        <div className="flex items-center justify-between border-b pb-3 text-xs">
                          <div>
                            <span className="font-mono text-xs font-black text-cyan-600">
                              #INV-2026-904
                            </span>
                            <p className="text-muted-foreground text-[10px]">
                              Client: Apex Solutions Inc.
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                            ✓ Auto-Reconciled
                          </span>
                        </div>

                        <div className="bg-surface/90 border-border/80 shadow-2xs relative mt-3 space-y-2 overflow-hidden rounded-xl border p-3.5 text-xs">
                          <div className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" aria-hidden="true" />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-[11px]">
                              Strategic Advisory (12.5 hrs)
                            </span>
                            <span className="text-foreground font-mono font-bold">$3,125.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-[11px]">
                              Architecture Review (1 Session)
                            </span>
                            <span className="text-foreground font-mono font-bold">$400.00</span>
                          </div>
                          <div className="border-border/60 flex justify-between border-t pt-2 font-bold">
                            <span className="text-foreground">Total Disbursed:</span>
                            <span className="font-mono text-emerald-600">$3,525.00</span>
                          </div>
                        </div>

                        {/* Interactive Instant Settlement Action */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-[11px] font-semibold">
                              Direct Bank Payout:
                            </span>
                            {isSettledStage4 && (
                              <button
                                type="button"
                                onClick={() => setIsSettledStage4(false)}
                                className="text-muted-foreground hover:text-foreground text-[10px] font-semibold underline underline-offset-2"
                              >
                                Reset
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsSettledStage4((prev) => !prev)}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold shadow-sm transition-all ${
                              isSettledStage4
                                ? "bg-emerald-600 text-white"
                                : "from-primary bg-gradient-to-r to-indigo-600 text-white hover:scale-105"
                            }`}
                          >
                            {isSettledStage4 ? (
                              <>
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                                <span>✓ Disbursed via Stripe</span>
                              </>
                            ) : (
                              <>
                                <Zap className="h-3.5 w-3.5" />
                                <span>Simulate Instant Payout</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Holographic Disbursed Stamp Overlay */}
                        <AnimatePresence>
                          {isSettledStage4 && (
                            <motion.div
                              initial={{ scale: 2, opacity: 0, rotate: -20 }}
                              animate={{ scale: 1, opacity: 1, rotate: -6 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 350, damping: 25 }}
                              className="pointer-events-none absolute top-3 right-3 rounded-xl border-2 border-emerald-500 bg-emerald-500/15 px-3 py-1 shadow-md backdrop-blur-md"
                            >
                              <div className="flex items-center gap-1.5 text-emerald-600">
                                <CheckCheck className="h-4 w-4 stroke-[3]" />
                                <span className="font-mono text-[11px] font-black tracking-wider uppercase">
                                  FUNDS DISBURSED
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Quick Feature Tag Strip */}
              <div className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 text-xs font-semibold">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="text-primary h-3.5 w-3.5" />
                  <span>Integrated Operations Pipeline Engine</span>
                </span>
                <span className="text-primary flex items-center gap-1 font-bold">
                  <span>Active Phase: Stage {currentStep.stepNumber}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </SpatialCockpitWindow>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM INTEGRATED TELEMETRY STRIP */}
        {/* ========================================================================= */}
        <div className="border-border/70 bg-surface/80 mt-12 grid grid-cols-2 gap-4 rounded-2xl border p-6 shadow-sm backdrop-blur-xl sm:grid-cols-4 sm:p-8">
          <div className="sm:border-border/60 text-center sm:border-r sm:pr-4">
            <span className="from-primary block bg-gradient-to-r to-indigo-600 bg-clip-text font-mono text-2xl font-black text-transparent sm:text-3xl">
              Instant
            </span>
            <span className="text-muted-foreground mt-1 block text-xs font-medium">
              Multi-Tenant Workspace Provisioning
            </span>
          </div>

          <div className="sm:border-border/60 text-center sm:border-r sm:px-4">
            <span className="block font-mono text-2xl font-black text-emerald-600 sm:text-3xl">
              0%
            </span>
            <span className="text-muted-foreground mt-1 block text-xs font-medium">
              Calendar Collisions & Booking Overlaps
            </span>
          </div>

          <div className="sm:border-border/60 text-center sm:border-r sm:px-4">
            <span className="from-primary block bg-gradient-to-r to-cyan-500 bg-clip-text font-mono text-2xl font-black text-transparent sm:text-3xl">
              1-Click
            </span>
            <span className="text-muted-foreground mt-1 block text-xs font-medium">
              Delivered Session to Invoice Conversion
            </span>
          </div>

          <div className="text-center sm:pl-4">
            <span className="block font-mono text-2xl font-black text-amber-500 sm:text-3xl">
              100%
            </span>
            <span className="text-muted-foreground mt-1 block text-xs font-medium">
              Multi-Tenant Data Shard Isolation
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
};
