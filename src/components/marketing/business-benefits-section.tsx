"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Eye,
  Clock,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Check,
  Calendar,
  FileSpreadsheet,
  Mail,
  MessageSquare,
  CreditCard,
  Users,
  Calculator,
  Sparkles,
  TrendingUp,
  Flame,
  Zap,
  ShieldAlert,
  ArrowRight,
  Cpu,
} from "lucide-react";
import { Container } from "@/components/layout/container";

type CurrencyCode = "USD" | "EUR" | "GBP" | "BDT";

const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: "$", rate: 1.0, label: "USD ($)" },
  EUR: { symbol: "€", rate: 0.92, label: "EUR (€)" },
  GBP: { symbol: "£", rate: 0.79, label: "GBP (£)" },
  BDT: { symbol: "৳", rate: 121.5, label: "BDT (৳)" },
};

const AnimatedAmount: React.FC<{
  amountUsd: number;
  currency: CurrencyCode;
  decimals?: number;
}> = ({ amountUsd, currency, decimals = 0 }) => {
  const cfg = CURRENCY_CONFIG[currency];
  const target = amountUsd * cfg.rate;
  const [val, setVal] = React.useState(target);
  const valRef = React.useRef(target);

  React.useEffect(() => {
    const current = valRef.current;
    const diff = target - current;
    if (Math.abs(diff) < 0.01) {
      setVal(target);
      valRef.current = target;
      return;
    }

    const start = performance.now();
    const duration = 300;

    let frameId: number;
    const update = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const next = current + diff * ease;
      valRef.current = next;
      setVal(next);
      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      }
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return (
    <span>
      {cfg.symbol}
      {val.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
};

/**
 * Editorial Bento Card with True 3D Perspective Tilt & Specular Rim
 */
interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "blue" | "emerald" | "amber" | "indigo";
}

const BentoCard: React.FC<BentoCardProps> = ({ children, className = "", glowColor = "blue" }) => {
  const shouldReduceMotion = useReducedMotion();
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number } | null>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 28 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 28 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
    setMousePos({ x: mouseX, y: mouseY });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setMousePos(null);
  };

  const glowGradients = {
    blue: "rgba(59, 130, 246, 0.14)",
    emerald: "rgba(16, 185, 129, 0.14)",
    amber: "rgba(245, 158, 11, 0.14)",
    indigo: "rgba(99, 102, 241, 0.14)",
  };

  const hoverBorderStyles = {
    blue: "hover:border-blue-500/50 hover:shadow-[0_25px_60px_-15px_rgba(59,130,246,0.18)] dark:hover:border-blue-400/40",
    emerald:
      "hover:border-emerald-500/50 hover:shadow-[0_25px_60px_-15px_rgba(16,185,129,0.18)] dark:hover:border-emerald-400/40",
    amber:
      "hover:border-amber-500/50 hover:shadow-[0_25px_60px_-15px_rgba(245,158,11,0.18)] dark:hover:border-amber-400/40",
    indigo:
      "hover:border-indigo-500/50 hover:shadow-[0_25px_60px_-15px_rgba(99,102,241,0.18)] dark:hover:border-indigo-400/40",
  };

  const topLaserRims = {
    blue: "via-blue-500/60 dark:via-blue-400/50",
    emerald: "via-emerald-500/60 dark:via-emerald-400/50",
    amber: "via-amber-500/60 dark:via-amber-400/50",
    indigo: "via-indigo-500/60 dark:via-indigo-400/50",
  };

  return (
    <div style={{ perspective: "1000px" }} className={`h-full ${className}`}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateX,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={shouldReduceMotion ? undefined : { y: -5, scale: 1.008 }}
        transition={{ type: "spring", stiffness: 350, damping: 26 }}
        className={`group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-3xl border border-neutral-200/90 bg-gradient-to-br from-white/82 via-neutral-50/78 to-neutral-100/60 p-3.5 shadow-[0_4px_25px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl transition-all duration-300 sm:p-6 xl:p-8 dark:border-white/10 dark:from-neutral-900/80 dark:via-neutral-900/65 dark:to-neutral-950/80 dark:shadow-[0_4px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] dark:backdrop-blur-2xl ${hoverBorderStyles[glowColor]}`}
      >
        {/* Subtle Engineering Dot Matrix Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />

        {/* Dynamic Specular Spotlight Glare following Cursor */}
        {mousePos && !shouldReduceMotion && (
          <div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, ${glowGradients[glowColor]}, transparent 70%)`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Specular Top Rim Light */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent ${topLaserRims[glowColor]} to-transparent`}
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full flex-col justify-between">{children}</div>
      </motion.div>
    </div>
  );
};

export const BusinessBenefitsSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // Card 1: Single Source of Truth Switcher ("chaos" vs "flowpilot")
  const [sourceMode, setSourceMode] = React.useState<"chaos" | "flowpilot">("flowpilot");

  // Card 2: Team Capacity Optimizer & Day Schedule Inspector
  const [selectedStaff, setSelectedStaff] = React.useState<"sarah" | "marcus" | "elena">("sarah");
  const [capacityMode, setCapacityMode] = React.useState<"unprotected" | "optimal">("optimal");
  const [selectedDay, setSelectedDay] = React.useState<"Mon" | "Tue" | "Wed" | "Thu" | "Fri">(
    "Wed"
  );

  // Card 3: Days Sales Outstanding (DSO) Model
  const [dsoModel, setDsoModel] = React.useState<"traditional" | "flowpilot">("flowpilot");

  // Card 4: Governance Role Lens & Interactive Billable Rate Slider
  const [governanceRole, setGovernanceRole] = React.useState<"staff" | "partner">("partner");
  const [billableRate, setBillableRate] = React.useState<number>(250);

  // Bottom Operational Capacity Modeler State
  const [teamSize, setTeamSize] = React.useState<number>(6);
  const [currency, setCurrency] = React.useState<CurrencyCode>("USD");
  const [cockpitView, setCockpitView] = React.useState<"metrics" | "breakdown">("metrics");

  // Calculation Math for Card 4 (Role-Enforced Governance)
  const staffCost = 120;
  const grossMargin = billableRate - staffCost;
  const marginPercentage = Math.round((grossMargin / billableRate) * 100);
  const monthlyProfitPerSeat = grossMargin * 160;

  // Calculation Math for Operational Capacity Modeler (Benchmark: ~18.5 hrs/consultant/month)
  const hoursSavedMonthly = Math.round(teamSize * 18.5);
  const valueRecoveredMonthly = teamSize * 2750;

  return (
    <section id="benefits" className="relative scroll-mt-20 overflow-hidden py-16 md:py-24">
      <Container>
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="border-border/80 bg-background/90 text-foreground inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-2xs backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-[10.5px] font-bold tracking-wider text-neutral-600 uppercase sm:text-[11px] dark:text-neutral-400">
              Quantitative Proof &bull; Operational Clarity
            </span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="mt-4 text-2xl leading-tight font-extrabold tracking-tight text-neutral-900 min-[360px]:text-3xl sm:text-4xl md:text-5xl dark:text-white"
          >
            Measurable Clarity for Owners{" "}
            <span className="bg-gradient-to-r from-neutral-950 via-neutral-700 to-neutral-950 bg-clip-text text-transparent dark:from-white dark:via-neutral-300 dark:to-neutral-500">
              and Operations Leads
            </span>
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-muted-foreground mt-3 text-sm leading-relaxed sm:mt-4 sm:text-base sm:text-lg"
          >
            Translating unified platform capabilities into day-to-day operational and financial
            advantages. Explore how FlowPilot reduces administrative drag across your team.
          </motion.p>
        </div>

        {/* ========================================================================= */}
        {/* QUANTITATIVE PROOF BENTO GRID */}
        {/* ========================================================================= */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-12 lg:gap-6 xl:gap-8">
          {/* ======================================================================= */}
          {/* CARD 1: SINGLE OPERATIONAL SOURCE OF TRUTH (HERO 7 COLS) */}
          {/* ======================================================================= */}
          <BentoCard className="lg:col-span-7" glowColor="blue">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-600 shadow-2xs sm:h-11 sm:w-11 dark:text-blue-400">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-tight text-neutral-900 dark:text-white">
                      Operational Visibility
                    </span>
                    <p className="font-mono text-[10px] text-neutral-500 sm:text-[11px] dark:text-neutral-400">
                      Centralized Workspace Hub
                    </p>
                  </div>
                </div>

                {/* Tactile Mode Switcher Segmented Control */}
                <div
                  role="group"
                  aria-label="Operational Mode Selection"
                  className="border-border/80 bg-background/90 flex w-full items-center gap-1 rounded-2xl border p-1 shadow-2xs backdrop-blur-md min-[420px]:w-auto"
                >
                  <button
                    type="button"
                    aria-pressed={sourceMode === "chaos"}
                    onClick={() => setSourceMode("chaos")}
                    className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors duration-200 focus-visible:outline-hidden min-[420px]:flex-initial sm:px-3 ${
                      sourceMode === "chaos"
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {sourceMode === "chaos" && (
                      <motion.span
                        layoutId="active-source-mode-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 shadow-sm"
                      />
                    )}
                    <Flame
                      className={`relative z-10 h-3.5 w-3.5 shrink-0 ${
                        sourceMode === "chaos" ? "text-amber-200" : "text-rose-500"
                      }`}
                    />
                    <span className="relative z-10 truncate">
                      <span className="min-[380px]:hidden">Chaos</span>
                      <span className="hidden min-[380px]:inline">Fragmented Tools</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={sourceMode === "flowpilot"}
                    onClick={() => setSourceMode("flowpilot")}
                    className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors duration-200 focus-visible:outline-hidden min-[420px]:flex-initial sm:px-3 ${
                      sourceMode === "flowpilot"
                        ? "text-white dark:text-neutral-950"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {sourceMode === "flowpilot" && (
                      <motion.span
                        layoutId="active-source-mode-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-neutral-950 shadow-sm dark:bg-white"
                      />
                    )}
                    <Sparkles
                      className={`relative z-10 h-3.5 w-3.5 shrink-0 ${
                        sourceMode === "flowpilot" ? "text-emerald-400" : "text-emerald-500"
                      }`}
                    />
                    <span className="relative z-10 truncate">
                      <span className="min-[380px]:hidden">Core</span>
                      <span className="hidden min-[380px]:inline">FlowPilot Core</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Bold Metric Header */}
              <div className="mb-2 flex flex-wrap items-baseline gap-2 sm:gap-2.5">
                <span className="font-mono text-xl font-extrabold text-neutral-900 sm:text-2xl md:text-3xl dark:text-white">
                  1 Workspace vs. 14 Tools
                </span>
                <span className="shrink-0 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-blue-600 sm:text-[11px] dark:text-blue-400">
                  Verified Architecture
                </span>
              </div>

              <h3 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-2xl sm:text-xl dark:text-white">
                Single Operational Source of Truth
              </h3>

              <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                Eliminate the confusion of switching between fragmented spreadsheet tabs, messaging
                apps, and disconnected calendar links. In FlowPilot, customer dossiers, booking
                timelines, staff assignments, and invoice balances are unified in one
                organization-scoped workspace.
              </p>

              {/* Comparison Canvas */}
              <div className="relative mt-4 min-h-[220px] overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100/60 p-3.5 shadow-inner backdrop-blur-md sm:mt-6 sm:p-4.5 dark:border-white/10 dark:bg-neutral-950/60">
                <AnimatePresence initial={false} mode="wait">
                  {sourceMode === "chaos" ? (
                    <motion.div
                      key="chaos-view"
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-rose-500/20 pb-2 text-xs font-semibold text-rose-600">
                        <span className="flex min-w-0 items-center gap-1.5 font-bold">
                          <AlertTriangle className="h-4 w-4 shrink-0 animate-bounce text-rose-500" />
                          <span className="truncate">
                            Status Quo: Disconnected Apps &amp; Data Drift
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-600 sm:px-2.5 sm:text-[10.5px]">
                          High Coordination Drag
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                        <div className="group/node relative overflow-hidden rounded-xl border border-rose-500/30 bg-white/80 p-2.5 text-center shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-rose-500/50 hover:shadow-md sm:p-3 dark:border-rose-500/20 dark:bg-neutral-900/80">
                          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 sm:h-8 sm:w-8">
                            <FileSpreadsheet className="h-4 w-4 shrink-0" />
                          </div>
                          <span className="mt-1.5 block truncate text-[11px] font-semibold text-neutral-800 sm:mt-2 sm:text-xs dark:text-neutral-200">
                            14 Sheets Tabs
                          </span>
                          <span className="mt-0.5 inline-block rounded bg-rose-500/15 px-1 py-0.5 font-mono text-[9px] font-bold text-rose-600 sm:text-[9.5px] dark:text-rose-400">
                            #REF! Rate Drift
                          </span>
                        </div>

                        <div className="group/node relative overflow-hidden rounded-xl border border-rose-500/30 bg-white/80 p-2.5 text-center shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-rose-500/50 hover:shadow-md sm:p-3 dark:border-rose-500/20 dark:bg-neutral-900/80">
                          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 sm:h-8 sm:w-8">
                            <Calendar className="h-4 w-4 shrink-0" />
                          </div>
                          <span className="mt-1.5 block truncate text-[11px] font-semibold text-neutral-800 sm:mt-2 sm:text-xs dark:text-neutral-200">
                            Calendly Link
                          </span>
                          <span className="mt-0.5 inline-block rounded bg-amber-500/15 px-1 py-0.5 font-mono text-[9px] font-bold text-amber-600 sm:text-[9.5px] dark:text-amber-400">
                            0m Overlap Risk
                          </span>
                        </div>

                        <div className="group/node relative overflow-hidden rounded-xl border border-rose-500/30 bg-white/80 p-2.5 text-center shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-rose-500/50 hover:shadow-md sm:p-3 dark:border-rose-500/20 dark:bg-neutral-900/80">
                          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 sm:h-8 sm:w-8">
                            <MessageSquare className="h-4 w-4 shrink-0" />
                          </div>
                          <span className="mt-1.5 block truncate text-[11px] font-semibold text-neutral-800 sm:mt-2 sm:text-xs dark:text-neutral-200">
                            Slack DMs
                          </span>
                          <span className="mt-0.5 inline-block rounded bg-rose-500/15 px-1 py-0.5 font-mono text-[9px] font-bold text-rose-600 sm:text-[9.5px] dark:text-rose-400">
                            Lost Scope Notes
                          </span>
                        </div>

                        <div className="group/node relative overflow-hidden rounded-xl border border-rose-500/30 bg-white/80 p-2.5 text-center shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-rose-500/50 hover:shadow-md sm:p-3 dark:border-rose-500/20 dark:bg-neutral-900/80">
                          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 sm:h-8 sm:w-8">
                            <Mail className="h-4 w-4 shrink-0" />
                          </div>
                          <span className="mt-1.5 block truncate text-[11px] font-semibold text-neutral-800 sm:mt-2 sm:text-xs dark:text-neutral-200">
                            PDF Invoices
                          </span>
                          <span className="mt-0.5 inline-block rounded bg-rose-500/15 px-1 py-0.5 font-mono text-[9px] font-bold text-rose-600 sm:text-[9.5px] dark:text-rose-400">
                            42d Unsettled
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-700 sm:flex-row sm:items-center dark:text-rose-300">
                        <span className="flex min-w-0 flex-1 items-center gap-1.5 leading-snug">
                          <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                          <span>42% of customer context is lost during contractor handoffs</span>
                        </span>
                        <span className="shrink-0 self-start font-mono text-[10px] font-bold uppercase sm:self-auto">
                          14 Open Tabs
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="flowpilot-view"
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3.5"
                    >
                      {/* Telemetry Header */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-emerald-500/20 pb-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="flex min-w-0 items-center gap-2 font-bold">
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                          </span>
                          <span className="truncate">FLOWPILOT CENTRAL HUB: 0ms SYNC LATENCY</span>
                        </span>
                        <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 sm:px-2.5 sm:text-[10.5px] dark:text-emerald-400">
                          3 OF 3 NODES SYNCED
                        </span>
                      </div>

                      {/* 3 Connected Interactive Satellites */}
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        <div className="group/pillar relative overflow-hidden rounded-xl border border-emerald-500/30 bg-white/90 p-3 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-md dark:border-emerald-500/20 dark:bg-neutral-900/90">
                          <div className="flex items-center justify-between">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Users className="h-3.5 w-3.5" />
                            </div>
                            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                              Instant Sync
                            </span>
                          </div>
                          <span className="mt-2 block truncate text-xs font-bold text-neutral-900 dark:text-white">
                            Client 360° Dossier
                          </span>
                          <span className="text-muted-foreground mt-0.5 block truncate text-[10.5px]">
                            Acme Corp Scope &amp; Notes
                          </span>
                        </div>

                        <div className="group/pillar relative overflow-hidden rounded-xl border border-emerald-500/30 bg-white/90 p-3 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-md dark:border-emerald-500/20 dark:bg-neutral-900/90">
                          <div className="flex items-center justify-between">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Clock className="h-3.5 w-3.5" />
                            </div>
                            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                              +15m Guard
                            </span>
                          </div>
                          <span className="mt-2 block truncate text-xs font-bold text-neutral-900 dark:text-white">
                            Service Calendar
                          </span>
                          <span className="text-muted-foreground mt-0.5 block truncate text-[10.5px]">
                            10:00 - 11:15 AM Paced
                          </span>
                        </div>

                        <div className="group/pillar relative overflow-hidden rounded-xl border border-blue-500/30 bg-white/90 p-3 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-md dark:border-blue-500/20 dark:bg-neutral-900/90">
                          <div className="flex items-center justify-between">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              <CreditCard className="h-3.5 w-3.5" />
                            </div>
                            <span className="rounded bg-blue-500/15 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-blue-600 dark:text-blue-400">
                              Autopay 2.4d
                            </span>
                          </div>
                          <span className="mt-2 block truncate text-xs font-bold text-neutral-900 dark:text-white">
                            Stripe Connect v2
                          </span>
                          <span className="text-muted-foreground mt-0.5 block truncate text-[10.5px]">
                            $375.00 Instant Draft
                          </span>
                        </div>
                      </div>

                      {/* Central Animated Core Pulse Chip */}
                      <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 px-3 py-2 text-center text-xs font-medium text-emerald-800 sm:flex-nowrap sm:text-left dark:text-emerald-300">
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Cpu className="h-4 w-4 shrink-0 animate-pulse text-emerald-500" />
                          <span className="font-semibold">FlowPilot Core:</span>
                        </div>
                        <span className="font-mono text-[10.5px] text-neutral-600 sm:text-[11px] dark:text-neutral-400">
                          Single source of truth with 0ms sync drift
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Benefit Highlights */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-neutral-200/80 pt-3 text-xs font-medium sm:mt-5 sm:gap-2 sm:pt-3.5 dark:border-white/10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/70 px-2.5 py-0.5 text-[11px] shadow-2xs sm:px-3 sm:py-1 sm:text-xs dark:border-white/10 dark:bg-neutral-800/60">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Zero lost client context
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/70 px-2.5 py-0.5 text-[11px] shadow-2xs sm:px-3 sm:py-1 sm:text-xs dark:border-white/10 dark:bg-neutral-800/60">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Unified customer records
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/70 px-2.5 py-0.5 text-[11px] shadow-2xs sm:px-3 sm:py-1 sm:text-xs dark:border-white/10 dark:bg-neutral-800/60">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Centralized activity
                history
              </span>
            </div>
          </BentoCard>

          {/* ======================================================================= */}
          {/* CARD 2: SYNCHRONIZED TEAM CAPACITY (5 COLS) */}
          {/* ======================================================================= */}
          <BentoCard className="lg:col-span-5" glowColor="emerald">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 shadow-2xs sm:h-11 sm:w-11 dark:text-emerald-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-tight text-neutral-900 dark:text-white">
                      Capacity Balance
                    </span>
                    <p className="font-mono text-[10px] text-neutral-500 sm:text-[11px] dark:text-neutral-400">
                      Burnout Prevention
                    </p>
                  </div>
                </div>

                {/* Tactile Capacity Optimizer Switcher */}
                <div
                  role="group"
                  aria-label="Capacity Mode Selection"
                  className="border-border/80 bg-background/90 flex w-full items-center justify-center gap-1 rounded-2xl border p-1 shadow-2xs backdrop-blur-md min-[360px]:w-auto"
                >
                  <button
                    type="button"
                    aria-pressed={capacityMode === "unprotected"}
                    onClick={() => setCapacityMode("unprotected")}
                    className={`relative flex-1 rounded-xl px-2.5 py-1 text-center text-xs font-bold transition-colors duration-200 focus-visible:outline-hidden min-[360px]:flex-initial ${
                      capacityMode === "unprotected"
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {capacityMode === "unprotected" && (
                      <motion.span
                        layoutId="active-capacity-mode-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 shadow-sm"
                      />
                    )}
                    <span className="relative z-10 text-[10.5px] sm:text-[11px]">Unprotected</span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={capacityMode === "optimal"}
                    onClick={() => setCapacityMode("optimal")}
                    className={`relative flex-1 rounded-xl px-2.5 py-1 text-center text-xs font-bold transition-colors duration-200 focus-visible:outline-hidden min-[360px]:flex-initial ${
                      capacityMode === "optimal"
                        ? "text-white dark:text-neutral-950"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {capacityMode === "optimal" && (
                      <motion.span
                        layoutId="active-capacity-mode-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-neutral-950 shadow-sm dark:bg-white"
                      />
                    )}
                    <span className="relative z-10 text-[10.5px] sm:text-[11px]">Buffer Guard</span>
                  </button>
                </div>
              </div>

              {/* Bold Metric Header */}
              <div className="mb-2 flex flex-wrap items-baseline gap-2 sm:gap-2.5">
                <span className="font-mono text-xl font-extrabold text-neutral-900 sm:text-2xl md:text-3xl dark:text-white">
                  +15m Protected Buffer
                </span>
                <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 sm:text-[11px] dark:text-emerald-400">
                  Zero Overlaps
                </span>
              </div>

              <h3 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-2xl sm:text-xl dark:text-white">
                Synchronized Team Capacity
              </h3>

              <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                Clear visibility into team availability and appointment durations prevents
                accidental double-booking. Built-in buffer intervals protect team recovery time and
                ensure high-quality client deliverables.
              </p>

              {/* Weekly Schedule Strip */}
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100/60 p-3.5 shadow-inner backdrop-blur-md sm:mt-6 sm:p-4.5 dark:border-white/10 dark:bg-neutral-950/60">
                {/* Consultant Selector */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-neutral-200/80 pb-2.5 text-xs dark:border-white/10">
                  <span className="text-[11px] font-semibold text-neutral-800 sm:text-xs dark:text-neutral-200">
                    Consultant Workload:
                  </span>
                  <div className="inline-flex rounded-xl border border-neutral-200/80 bg-white/80 p-0.5 shadow-2xs dark:border-white/10 dark:bg-neutral-900">
                    {(["sarah", "marcus", "elena"] as const).map((member) => (
                      <button
                        key={member}
                        type="button"
                        onClick={() => setSelectedStaff(member)}
                        className={`rounded-lg px-2 py-1 text-[9.5px] font-bold capitalize transition-all duration-150 focus-visible:outline-hidden sm:px-2.5 sm:text-[10px] ${
                          selectedStaff === member
                            ? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {member}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5-Day Visual Schedule Heatmap with Clickable Day Inspector */}
                <div className="mt-3.5 grid grid-cols-5 gap-1 text-center text-[10px] font-medium sm:gap-1.5">
                  {(["Mon", "Tue", "Wed", "Thu", "Fri"] as const).map((day, idx) => {
                    const isProblemDay = idx === 2 || idx === 3;
                    const isSelected = selectedDay === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={`cursor-pointer rounded-lg border p-1 transition-all focus-visible:outline-hidden sm:rounded-xl sm:p-2 ${
                          isSelected ? "shadow-xs ring-2 ring-emerald-500/60" : ""
                        } ${
                          capacityMode === "optimal"
                            ? isProblemDay
                              ? "border-emerald-500/40 bg-emerald-500/15 font-bold text-emerald-700 shadow-2xs dark:text-emerald-300"
                              : "border-neutral-200/80 bg-white/70 text-neutral-800 dark:border-white/5 dark:bg-neutral-900/60 dark:text-neutral-200"
                            : isProblemDay
                              ? "border-rose-500/50 bg-rose-500/20 font-bold text-rose-600 shadow-2xs dark:text-rose-400"
                              : "border-neutral-200/80 bg-white/70 text-neutral-800 dark:border-white/5 dark:bg-neutral-900/60 dark:text-neutral-200"
                        }`}
                      >
                        <span className="block text-[9px] font-bold sm:text-[10px]">{day}</span>
                        <span className="mt-0.5 block font-mono text-[8px] sm:mt-1 sm:text-[9.5px]">
                          {capacityMode === "optimal"
                            ? isProblemDay
                              ? "3 Paced"
                              : "2 Calls"
                            : isProblemDay
                              ? "6 Clashing!"
                              : "4 Calls"}
                        </span>
                        <div className="mt-1 flex items-center justify-center">
                          {capacityMode === "optimal" ? (
                            <span className="rounded bg-emerald-500/20 px-0.5 py-0.5 text-[7.5px] font-bold text-emerald-600 sm:px-1 sm:text-[8.5px] dark:text-emerald-400">
                              <span className="sm:hidden">+15m</span>
                              <span className="hidden sm:inline">+15m Buffer</span>
                            </span>
                          ) : isProblemDay ? (
                            <span className="animate-pulse rounded bg-rose-500/20 px-0.5 py-0.5 text-[7.5px] font-bold text-rose-600 sm:px-1 sm:text-[8.5px] dark:text-rose-400">
                              <span className="sm:hidden">Overlap</span>
                              <span className="hidden sm:inline">0m Overlap</span>
                            </span>
                          ) : (
                            <span className="text-[7.5px] text-neutral-400 sm:text-[8.5px]">
                              <span className="sm:hidden">0m</span>
                              <span className="hidden sm:inline">0m Buffer</span>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Interactive Day Schedule Timeline Strip */}
                <div className="mt-3 rounded-xl border border-neutral-200/80 bg-white/80 p-2 text-xs sm:p-2.5 dark:border-white/10 dark:bg-neutral-900/80">
                  <div className="flex flex-wrap items-center justify-between gap-1 border-b border-neutral-200/60 pb-1.5 text-[10.5px] font-semibold sm:text-[11px] dark:border-white/5">
                    <span className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                      <Clock className="h-3 w-3 shrink-0 text-emerald-500" />
                      <span>{selectedDay}&apos;s Inspection:</span>
                    </span>
                    <span className="font-mono text-[9.5px] font-bold text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                      {capacityMode === "optimal" ? "Paced Timeline" : "Collision Warning"}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-col gap-1.5 text-[10px] sm:text-[10.5px]">
                    <div className="flex items-center justify-between rounded-lg bg-neutral-100/80 px-2 py-1 dark:bg-neutral-800/60">
                      <span className="truncate font-medium text-neutral-700 dark:text-neutral-300">
                        09:30 AM Client Briefing
                      </span>
                      <span className="shrink-0 font-mono text-[9.5px] text-neutral-500 sm:text-[10px]">
                        45 min
                      </span>
                    </div>

                    {capacityMode === "optimal" ? (
                      <div className="flex items-center justify-between gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2 py-1 font-semibold text-emerald-700 dark:text-emerald-300">
                        <span className="flex min-w-0 flex-1 items-center gap-1.5">
                          <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-500" />
                          <span className="truncate">+15m Protected Recovery Buffer</span>
                        </span>
                        <span className="shrink-0 font-mono text-[9px] sm:text-[9.5px]">
                          Zero Collisions
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1 rounded-lg border border-rose-500/40 bg-rose-500/20 px-2 py-1 font-semibold text-rose-600 dark:text-rose-400">
                        <span className="flex min-w-0 flex-1 items-center gap-1.5">
                          <AlertTriangle className="h-3 w-3 shrink-0 animate-pulse text-rose-500" />
                          <span className="truncate">0m Overlap: Calendly Collision</span>
                        </span>
                        <span className="shrink-0 font-mono text-[9px] sm:text-[9.5px]">
                          Double-Booked
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between rounded-lg bg-neutral-100/80 px-2 py-1 dark:bg-neutral-800/60">
                      <span className="truncate font-medium text-neutral-700 dark:text-neutral-300">
                        10:30 AM Architecture Review
                      </span>
                      <span className="shrink-0 font-mono text-[9.5px] text-neutral-500 sm:text-[10px]">
                        60 min
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Capacity Gauge */}
                <div className="mt-3.5 space-y-1.5 border-t border-neutral-200/80 pt-2.5 text-xs dark:border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10.5px] sm:text-[11px]">
                    <span className="truncate font-semibold text-neutral-800 dark:text-neutral-200">
                      {selectedStaff === "sarah"
                        ? "Sarah Chen (Principal Lead)"
                        : selectedStaff === "marcus"
                          ? "Marcus Vance (Solutions Architect)"
                          : "Elena Rostova (Senior Consultant)"}
                    </span>
                    <span
                      className={`shrink-0 font-mono font-bold ${
                        capacityMode === "optimal"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-500"
                      }`}
                    >
                      {capacityMode === "optimal"
                        ? selectedStaff === "sarah"
                          ? "78% [Balanced Flow]"
                          : selectedStaff === "marcus"
                            ? "65% [Capacity Open]"
                            : "72% [Balanced Flow]"
                        : "96% [Critical Overload]"}
                    </span>
                  </div>

                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800">
                    <motion.div
                      className={`h-full rounded-full transition-colors duration-300 ${
                        capacityMode === "optimal"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                          : "bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                      }`}
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : {
                              width:
                                capacityMode === "optimal"
                                  ? selectedStaff === "sarah"
                                    ? "78%"
                                    : selectedStaff === "marcus"
                                      ? "65%"
                                      : "72%"
                                  : "96%",
                            }
                      }
                      style={
                        shouldReduceMotion
                          ? {
                              width:
                                capacityMode === "optimal"
                                  ? selectedStaff === "sarah"
                                    ? "78%"
                                    : selectedStaff === "marcus"
                                      ? "65%"
                                      : "72%"
                                  : "96%",
                            }
                          : undefined
                      }
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1 border-t border-neutral-200/60 pt-2 text-[10px] sm:text-[10.5px] dark:border-white/5">
                  <span className="truncate text-neutral-500 dark:text-neutral-400">
                    {capacityMode === "optimal"
                      ? "✓ Dynamic Buffers Active (Zero Collisions)"
                      : "⚠️ Back-to-Back Rush: Zero Recovery Between Calls"}
                  </span>
                  <span className="shrink-0 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {capacityMode === "optimal" ? "Paced Delivery" : "Burnout Risk"}
                  </span>
                </div>
              </div>
            </div>

            {/* Benefit Highlights */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-neutral-200/80 pt-3 text-xs font-medium sm:mt-5 sm:gap-2 sm:pt-3.5 dark:border-white/10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/70 px-2.5 py-0.5 text-[11px] shadow-2xs sm:px-3 sm:py-1 sm:text-xs dark:border-white/10 dark:bg-neutral-800/60">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Protected staff buffer
                gaps
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/70 px-2.5 py-0.5 text-[11px] shadow-2xs sm:px-3 sm:py-1 sm:text-xs dark:border-white/10 dark:bg-neutral-800/60">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Accurate appointment
                pacing
              </span>
            </div>
          </BentoCard>

          {/* ======================================================================= */}
          {/* CARD 3: ACCELERATED CASH FLOW CYCLE (5 COLS) */}
          {/* ======================================================================= */}
          <BentoCard className="lg:col-span-5" glowColor="amber">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-600 shadow-2xs sm:h-11 sm:w-11 dark:text-amber-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-tight text-neutral-900 dark:text-white">
                      Billing Velocity
                    </span>
                    <p className="font-mono text-[10px] text-neutral-500 sm:text-[11px] dark:text-neutral-400">
                      Accounts Receivable Turnover
                    </p>
                  </div>
                </div>

                {/* Tactile DSO Model Switcher */}
                <div
                  role="group"
                  aria-label="Billing Velocity Selection"
                  className="border-border/80 bg-background/90 flex w-full items-center justify-center gap-1 rounded-2xl border p-1 shadow-2xs backdrop-blur-md min-[360px]:w-auto"
                >
                  <button
                    type="button"
                    aria-pressed={dsoModel === "traditional"}
                    onClick={() => setDsoModel("traditional")}
                    className={`relative flex-1 rounded-xl px-2.5 py-1 text-center text-xs font-bold transition-colors duration-200 focus-visible:outline-hidden min-[360px]:flex-initial ${
                      dsoModel === "traditional"
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {dsoModel === "traditional" && (
                      <motion.span
                        layoutId="active-dso-model-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 shadow-sm"
                      />
                    )}
                    <span className="relative z-10 text-[10.5px] sm:text-[11px]">
                      Traditional (38d)
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={dsoModel === "flowpilot"}
                    onClick={() => setDsoModel("flowpilot")}
                    className={`relative flex-1 rounded-xl px-2.5 py-1 text-center text-xs font-bold transition-colors duration-200 focus-visible:outline-hidden min-[360px]:flex-initial ${
                      dsoModel === "flowpilot"
                        ? "text-white dark:text-neutral-950"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {dsoModel === "flowpilot" && (
                      <motion.span
                        layoutId="active-dso-model-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-neutral-950 shadow-sm dark:bg-white"
                      />
                    )}
                    <span className="relative z-10 text-[10.5px] sm:text-[11px]">
                      FlowPilot (2.4d)
                    </span>
                  </button>
                </div>
              </div>

              {/* Bold Metric Header */}
              <div className="mb-2 flex flex-wrap items-baseline gap-2 sm:gap-2.5">
                <span className="font-mono text-xl font-extrabold text-neutral-900 sm:text-2xl md:text-3xl dark:text-white">
                  38 Days → 2.4 Days DSO
                </span>
                <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-600 sm:text-[11px] dark:text-amber-400">
                  15.8x Cash Velocity
                </span>
              </div>

              <h3 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-2xl sm:text-xl dark:text-white">
                Accelerated Cash Flow Cycle
              </h3>

              <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                When completed appointments immediately convert into structured invoices, billing
                delays vanish. Clients receive itemized statements reflecting their actual service
                history, significantly reducing payment inquiries.
              </p>

              {/* Settlement Velocity Display */}
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100/60 p-3.5 shadow-inner backdrop-blur-md sm:mt-6 sm:p-4.5 dark:border-white/10 dark:bg-neutral-950/60">
                <div className="flex flex-wrap items-center justify-between gap-1 border-b border-neutral-200/80 pb-2 text-xs font-semibold sm:pb-2.5 dark:border-white/10">
                  <span className="text-neutral-800 dark:text-neutral-200">
                    Capital Settlement Velocity
                  </span>
                  <span className="font-mono text-[10.5px] font-bold text-emerald-600 sm:text-[11px] dark:text-emerald-400">
                    {dsoModel === "flowpilot" ? "⚡ Rapid 48h Turnaround" : "⏳ 38 Days Manual Lag"}
                  </span>
                </div>

                {/* Dual-Track Settlement Velocity Visualizer Runway */}
                <div className="mt-3.5 space-y-2 rounded-xl border border-neutral-200/80 bg-white/80 p-2.5 text-xs sm:p-3 dark:border-white/10 dark:bg-neutral-900/80">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10.5px] font-semibold text-neutral-800 sm:text-[11px] dark:text-neutral-200">
                    <span>Settlement Pipeline Comparison:</span>
                    <span className="font-mono text-[9.5px] text-neutral-500 sm:text-[10px]">
                      {dsoModel === "flowpilot" ? "Real-Time Direct" : "Net-30 Sluggish"}
                    </span>
                  </div>

                  {/* FlowPilot Runway */}
                  <div className="relative rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-[10px]">
                    <div className="flex flex-wrap items-center justify-between gap-1 font-bold text-emerald-700 dark:text-emerald-300">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <Zap className="h-3 w-3 shrink-0 text-emerald-500" />
                        <span className="truncate">FlowPilot Velocity: 2.4 Days</span>
                      </span>
                      <span className="shrink-0 font-mono text-[9px] uppercase">15.8x Faster</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[8.5px] text-neutral-600 sm:text-[9px] dark:text-neutral-400">
                      <span className="rounded bg-white/80 px-1.5 py-0.5 font-medium dark:bg-neutral-800">
                        1. Appointment Ends
                      </span>
                      <ArrowRight className="h-2.5 w-2.5 shrink-0 text-emerald-500" />
                      <span className="rounded bg-white/80 px-1.5 py-0.5 font-medium dark:bg-neutral-800">
                        2. 0.1s Auto-Draft
                      </span>
                      <ArrowRight className="h-2.5 w-2.5 shrink-0 text-emerald-500" />
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-bold text-emerald-700 dark:text-emerald-300">
                        3. Stripe Settled (48h)
                      </span>
                    </div>
                  </div>

                  {/* Traditional Runway */}
                  <div className="relative rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[10px]">
                    <div className="flex flex-wrap items-center justify-between gap-1 font-bold text-amber-800 dark:text-amber-300">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" />
                        <span className="truncate">Traditional Net-30: 38 Days Lag</span>
                      </span>
                      <span className="shrink-0 font-mono text-[9px] text-rose-500 uppercase">
                        Unsettled
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[8.5px] text-neutral-600 sm:text-[9px] dark:text-neutral-400">
                      <span className="rounded bg-white/80 px-1.5 py-0.5 font-medium dark:bg-neutral-800">
                        Spreadsheet Lag (14d)
                      </span>
                      <ArrowRight className="h-2.5 w-2.5 shrink-0 text-amber-500" />
                      <span className="rounded bg-white/80 px-1.5 py-0.5 font-medium dark:bg-neutral-800">
                        Dispute (8d)
                      </span>
                      <ArrowRight className="h-2.5 w-2.5 shrink-0 text-amber-500" />
                      <span className="rounded bg-rose-500/15 px-1.5 py-0.5 font-bold text-rose-600">
                        Check Mailed (16d)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="group/stat relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white/80 p-2.5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-3 dark:border-white/5 dark:bg-neutral-900/80">
                    <span className="text-muted-foreground block truncate text-[9.5px] font-medium tracking-wider uppercase sm:text-[10px]">
                      Days to Settlement
                    </span>
                    <span
                      className={`mt-1 block font-mono text-xl font-black sm:text-2xl ${
                        dsoModel === "flowpilot"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {dsoModel === "flowpilot" ? "2.4 Days" : "38 Days"}
                    </span>
                    <span className="mt-0.5 block truncate text-[9.5px] text-neutral-500 sm:text-[10px]">
                      {dsoModel === "flowpilot" ? "Direct Stripe Autopay" : "Manual Net-30 Delay"}
                    </span>
                  </div>

                  <div className="group/stat relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white/80 p-2.5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-3 dark:border-white/5 dark:bg-neutral-900/80">
                    <span className="text-muted-foreground block truncate text-[9.5px] font-medium tracking-wider uppercase sm:text-[10px]">
                      Billing Inquiries
                    </span>
                    <span className="mt-1 block font-mono text-xl font-black text-neutral-900 sm:text-2xl dark:text-white">
                      {dsoModel === "flowpilot" ? "0 Disputes" : "Frequent"}
                    </span>
                    <span className="mt-0.5 block truncate text-[9.5px] text-neutral-500 sm:text-[10px]">
                      {dsoModel === "flowpilot" ? "Itemized From Calendar" : "Missing Hours Proof"}
                    </span>
                  </div>
                </div>

                {/* Working Capital Indicator */}
                <div className="mt-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs font-medium text-amber-800 sm:p-3 dark:text-amber-300">
                  <span className="flex items-start gap-2 sm:items-center">
                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 sm:mt-0" />
                    <span className="leading-relaxed">
                      {dsoModel === "flowpilot"
                        ? "Completed consultations automatically generate verified invoice drafts with Stripe 1-click checkout"
                        : "Invoices delayed by manual end-of-month spreadsheet consolidation and missing timesheets"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Benefit Highlights */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-neutral-200/80 pt-3 text-xs font-medium sm:mt-5 sm:gap-2 sm:pt-3.5 dark:border-white/10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/70 px-2.5 py-0.5 text-[11px] shadow-2xs sm:px-3 sm:py-1 sm:text-xs dark:border-white/10 dark:bg-neutral-800/60">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Automated invoice
                creation
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/70 px-2.5 py-0.5 text-[11px] shadow-2xs sm:px-3 sm:py-1 sm:text-xs dark:border-white/10 dark:bg-neutral-800/60">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Direct Stripe settlement
              </span>
            </div>
          </BentoCard>

          {/* ======================================================================= */}
          {/* CARD 4: GRANULAR OPERATIONAL GOVERNANCE (HERO 7 COLS) */}
          {/* ======================================================================= */}
          <BentoCard className="lg:col-span-7" glowColor="indigo">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 shadow-2xs sm:h-11 sm:w-11 dark:text-indigo-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-tight text-neutral-900 dark:text-white">
                      Role Governance
                    </span>
                    <p className="font-mono text-[10px] text-neutral-500 sm:text-[11px] dark:text-neutral-400">
                      Internal Margin Protection
                    </p>
                  </div>
                </div>

                {/* Tactile Role Switcher Segmented Control */}
                <div
                  role="group"
                  aria-label="Governance Role Selection"
                  className="border-border/80 bg-background/90 flex w-full items-center gap-1 rounded-2xl border p-1 shadow-2xs backdrop-blur-md min-[440px]:w-auto"
                >
                  <button
                    type="button"
                    aria-pressed={governanceRole === "staff"}
                    onClick={() => setGovernanceRole("staff")}
                    className={`relative flex flex-1 items-center justify-center rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors duration-200 focus-visible:outline-hidden min-[440px]:flex-initial sm:px-3 ${
                      governanceRole === "staff"
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {governanceRole === "staff" && (
                      <motion.span
                        layoutId="active-gov-role-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 shadow-sm"
                      />
                    )}
                    <span className="relative z-10">
                      <span className="min-[480px]:hidden">Staff View</span>
                      <span className="hidden min-[480px]:inline">View as Staff (Masked)</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={governanceRole === "partner"}
                    onClick={() => setGovernanceRole("partner")}
                    className={`relative flex flex-1 items-center justify-center rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors duration-200 focus-visible:outline-hidden min-[440px]:flex-initial sm:px-3 ${
                      governanceRole === "partner"
                        ? "text-white dark:text-neutral-950"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {governanceRole === "partner" && (
                      <motion.span
                        layoutId="active-gov-role-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-neutral-950 shadow-sm dark:bg-white"
                      />
                    )}
                    <span className="relative z-10">
                      <span className="min-[480px]:hidden">Partner View</span>
                      <span className="hidden min-[480px]:inline">View as Partner (Full)</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Bold Metric Header */}
              <div className="mb-2 flex flex-wrap items-baseline gap-2 sm:gap-2.5">
                <span className="font-mono text-xl font-extrabold text-neutral-900 sm:text-2xl md:text-3xl dark:text-white">
                  Role-Enforced Privacy &amp; Margins
                </span>
                <span className="shrink-0 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-indigo-600 sm:text-[11px] dark:text-indigo-400">
                  Granular RBAC
                </span>
              </div>

              <h3 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-2xl sm:text-xl dark:text-white">
                Granular Operational Governance
              </h3>

              <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                Maintain total confidence as your agency scales. Role-based permissions ensure staff
                members only view assigned customer appointments, while owners and finance leads
                retain exclusive control over organizational billing and rates.
              </p>

              {/* Rate Card & Gross Margin Simulator */}
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100/60 p-3.5 shadow-inner backdrop-blur-md sm:mt-6 sm:p-4.5 dark:border-white/10 dark:bg-neutral-950/60">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/80 pb-2 text-xs font-semibold sm:pb-2.5 dark:border-white/10">
                  <span className="text-[11px] text-neutral-800 sm:text-xs dark:text-neutral-200">
                    Interactive Rate Card &amp; Gross Margin Simulator:
                  </span>
                  <span className="font-mono text-[10px] font-bold text-indigo-600 sm:text-[11px] dark:text-indigo-400">
                    {governanceRole === "partner"
                      ? "Partner Scope (Full Visibility)"
                      : "Staff Scope (Margins Masked)"}
                  </span>
                </div>

                {/* Rate Card Slider (Partner Interactive) */}
                <div className="mt-3.5">
                  <div className="flex justify-between text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    <span>Adjust Billable Rate:</span>
                    <span className="font-mono text-xs font-bold text-neutral-900 sm:text-sm dark:text-white">
                      {governanceRole === "partner" ? `$${billableRate}.00 / hr` : "$•••.00 / hr"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="400"
                    step="10"
                    disabled={governanceRole === "staff"}
                    value={billableRate}
                    aria-label="Adjust billable rate"
                    aria-valuemin={150}
                    aria-valuemax={400}
                    aria-valuenow={billableRate}
                    onChange={(e) => setBillableRate(Number(e.target.value))}
                    className="accent-primary bg-muted focus-visible:ring-primary mt-2 h-2.5 w-full cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:outline-hidden disabled:opacity-40"
                  />
                  {governanceRole === "partner" && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-[10px] text-neutral-400">Quick Rates:</span>
                      {[175, 250, 325, 375].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setBillableRate(rate)}
                          className={`rounded-md px-2 py-0.5 font-mono text-[9.5px] font-semibold transition-all sm:text-[10px] ${
                            billableRate === rate
                              ? "bg-neutral-950 text-white shadow-2xs dark:bg-white dark:text-neutral-950"
                              : "border border-neutral-200 bg-white/70 text-neutral-600 hover:text-neutral-900 dark:border-white/10 dark:bg-neutral-900/60 dark:text-neutral-400"
                          }`}
                        >
                          ${rate}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <div className="relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white/80 p-2.5 text-center shadow-2xs sm:p-3 dark:border-white/5 dark:bg-neutral-900/80">
                    <span className="text-muted-foreground block truncate text-[9.5px] font-medium tracking-wider uppercase sm:text-[10px]">
                      Client Billable Rate
                    </span>
                    <span className="mt-1 block font-mono text-sm font-extrabold text-neutral-900 sm:text-base dark:text-white">
                      {governanceRole === "partner" ? `$${billableRate}.00 / hr` : "$•••.00 / hr"}
                    </span>
                  </div>

                  <div className="relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white/80 p-2.5 text-center shadow-2xs sm:p-3 dark:border-white/5 dark:bg-neutral-900/80">
                    <span className="text-muted-foreground block truncate text-[9.5px] font-medium tracking-wider uppercase sm:text-[10px]">
                      Internal Delivery Cost
                    </span>
                    <span className="text-muted-foreground mt-1 block font-mono text-sm font-extrabold sm:text-base">
                      {governanceRole === "partner" ? "$120.00 / hr" : "$•••.00 / hr"}
                    </span>
                  </div>

                  <div className="relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white/80 p-2.5 text-center shadow-2xs sm:p-3 dark:border-white/5 dark:bg-neutral-900/80">
                    <span className="text-muted-foreground block truncate text-[9.5px] font-medium tracking-wider uppercase sm:text-[10px]">
                      Gross Profit Margin
                    </span>
                    <span className="mt-1 block font-mono text-sm font-extrabold text-emerald-600 sm:text-base dark:text-emerald-400">
                      {governanceRole === "partner"
                        ? `$${grossMargin}.00 (${marginPercentage}%)`
                        : "••% Gross Margin"}
                    </span>
                  </div>

                  {/* Cryptographic Privacy Shutter for Staff View */}
                  <AnimatePresence initial={false}>
                    {governanceRole === "staff" && (
                      <motion.div
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-indigo-500/40 bg-white/95 p-3 text-center shadow-xl backdrop-blur-md sm:p-4 dark:border-indigo-400/40 dark:bg-neutral-950/95"
                      >
                        <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 sm:mb-2 sm:h-9 sm:w-9 dark:text-indigo-400">
                          <Lock className="h-4 w-4 animate-pulse" />
                        </div>
                        <span className="font-mono text-[11px] leading-snug font-extrabold text-indigo-600 sm:text-xs dark:text-indigo-400">
                          CONFIDENTIAL: Internal Margins Masked
                        </span>
                        <span className="mt-1 text-[10px] leading-tight text-neutral-500 sm:text-[11px] dark:text-neutral-400">
                          Staff members only see assigned service deliverables. Financial models
                          remain partner-restricted.
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-1 border-t border-neutral-200/80 pt-2.5 text-[10.5px] sm:text-[11px] dark:border-white/10">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Projected Margin (160 hrs/seat):
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {governanceRole === "partner"
                      ? `+$${monthlyProfitPerSeat.toLocaleString()} / seat / mo`
                      : "CONFIDENTIAL / SEAT"}
                  </span>
                </div>
              </div>
            </div>

            {/* Benefit Highlights */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-neutral-200/80 pt-3 text-xs font-medium sm:mt-5 sm:gap-2 sm:pt-3.5 dark:border-white/10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/70 px-2.5 py-0.5 text-[11px] shadow-2xs sm:px-3 sm:py-1 sm:text-xs dark:border-white/10 dark:bg-neutral-800/60">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Confidential rate
                structures
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/70 px-2.5 py-0.5 text-[11px] shadow-2xs sm:px-3 sm:py-1 sm:text-xs dark:border-white/10 dark:bg-neutral-800/60">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Role-scoped permissions
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white/70 px-2.5 py-0.5 text-[11px] shadow-2xs sm:px-3 sm:py-1 sm:text-xs dark:border-white/10 dark:bg-neutral-800/60">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Zero rate leakage across
                tiers
              </span>
            </div>
          </BentoCard>
        </div>

        {/* ========================================================================= */}
        {/* ILLUSTRATIVE CAPACITY & ADMINISTRATIVE TIME MODELER (COCKPIT) */}
        {/* ========================================================================= */}
        <div className="relative mt-10 overflow-hidden rounded-3xl border border-neutral-200/90 bg-gradient-to-br from-white/82 via-neutral-50/78 to-neutral-100/60 p-4.5 shadow-[0_10px_40px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl sm:mt-14 sm:p-6 md:p-8 lg:p-10 dark:border-white/10 dark:from-neutral-900/80 dark:via-neutral-900/65 dark:to-neutral-950/80 dark:shadow-[0_15px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] dark:backdrop-blur-2xl">
          {/* Specular Top Rim */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent dark:via-white/25" />

          {/* Top Bar with View Selector and Currency Selector */}
          <div className="mb-6 flex flex-col gap-4 border-b border-neutral-200/80 pb-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-5 dark:border-white/10">
            <div className="flex items-start gap-3 sm:items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 shadow-2xs dark:text-emerald-400">
                <Calculator className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="block font-mono text-xs font-bold tracking-wider text-neutral-900 uppercase sm:inline dark:text-white">
                  Illustrative Capacity &amp; Time Modeler
                </span>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Estimate administrative hours and billable capacity recovered for your team size.
                </p>
              </div>
            </div>

            {/* View Selector & Currency Selector Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <div
                role="group"
                aria-label="Cockpit Display View"
                className="border-border/80 bg-background/90 inline-flex items-center gap-1 rounded-2xl border p-1 shadow-2xs backdrop-blur-md"
              >
                <button
                  type="button"
                  aria-pressed={cockpitView === "metrics"}
                  onClick={() => setCockpitView("metrics")}
                  className={`rounded-xl px-2 py-1 text-[11px] font-bold transition-all focus-visible:outline-hidden sm:px-2.5 sm:text-xs ${
                    cockpitView === "metrics"
                      ? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Live Telemetry
                </button>
                <button
                  type="button"
                  aria-pressed={cockpitView === "breakdown"}
                  onClick={() => setCockpitView("breakdown")}
                  className={`rounded-xl px-2 py-1 text-[11px] font-bold transition-all focus-visible:outline-hidden sm:px-2.5 sm:text-xs ${
                    cockpitView === "breakdown"
                      ? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Drag Breakdown
                </button>
              </div>

              {/* Currency Selector Pills */}
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10.5px] font-semibold text-neutral-500 sm:text-xs">
                  Currency:
                </span>
                <div className="inline-flex rounded-2xl border border-neutral-200/80 bg-white/90 p-1 shadow-2xs backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/90">
                  {(["USD", "EUR", "GBP", "BDT"] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={`rounded-xl px-2 py-1 font-mono text-[11px] font-bold transition-all focus-visible:outline-hidden sm:px-2.5 sm:text-xs ${
                        currency === curr
                          ? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 sm:gap-8 lg:flex-row lg:items-center">
            {/* Left Header & Slider */}
            <div className="max-w-xl">
              <h3 className="text-xl leading-tight font-extrabold tracking-tight text-neutral-900 sm:text-2xl md:text-3xl dark:text-white">
                Estimate Reclaimed Time Across Your Organization
              </h3>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                Adjust the team slider to view an illustrative model of reduced administrative drag
                and recovered consulting potential.
              </p>

              {/* Slider Controller */}
              <div className="mt-5 space-y-3 sm:mt-6">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-neutral-800 dark:text-neutral-200">Team Size:</span>
                  <span className="font-mono text-lg font-black text-neutral-900 sm:text-xl dark:text-white">
                    {teamSize} Consultants
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="25"
                  step="1"
                  value={teamSize}
                  aria-label="Adjust team size"
                  aria-valuemin={1}
                  aria-valuemax={25}
                  aria-valuenow={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="accent-primary bg-muted focus-visible:ring-primary h-2.5 w-full cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:outline-hidden"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs sm:gap-2 sm:pt-2">
                  <span className="text-muted-foreground text-[11px] font-medium sm:text-xs">
                    Quick Presets:
                  </span>
                  {[
                    { count: 3, label: "3 Solo" },
                    { count: 6, label: "6 Growth" },
                    { count: 12, label: "12 Mid-Market" },
                    { count: 20, label: "20+ Enterprise" },
                  ].map((preset) => (
                    <button
                      key={preset.count}
                      type="button"
                      onClick={() => setTeamSize(preset.count)}
                      className={`rounded-xl px-2.5 py-1 font-mono text-[10px] font-semibold transition-all focus-visible:outline-hidden sm:px-3 sm:text-[11px] ${
                        teamSize === preset.count
                          ? "bg-neutral-950 text-white shadow-2xs dark:bg-white dark:text-neutral-950"
                          : "border border-neutral-200/80 bg-white/70 text-neutral-600 hover:text-neutral-900 dark:border-white/10 dark:bg-neutral-800/50 dark:text-neutral-400"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Live Output Area: Metrics or Drag Breakdown */}
            <div className="lg:w-1/2">
              <AnimatePresence initial={false} mode="wait">
                {cockpitView === "metrics" ? (
                  <motion.div
                    key="cockpit-metrics"
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
                  >
                    <div className="group/pod relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/90 p-3.5 text-center shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-md sm:p-4 dark:border-white/10 dark:bg-neutral-900/90">
                      <span className="text-muted-foreground block truncate font-mono text-[10px] font-bold tracking-wider uppercase sm:text-[11px]">
                        Est. Hours Saved / Mo
                      </span>
                      <span className="mt-1.5 block font-mono text-2xl font-black text-neutral-900 sm:mt-2 sm:text-3xl lg:text-4xl dark:text-white">
                        {hoursSavedMonthly} hrs
                      </span>
                      <span className="mt-0.5 block truncate text-[10.5px] text-neutral-500 sm:mt-1 sm:text-[11px]">
                        ~18.5 hrs / consultant
                      </span>
                    </div>

                    <div className="group/pod relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/90 p-3.5 text-center shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-md sm:p-4 dark:border-white/10 dark:bg-neutral-900/90">
                      <span className="text-muted-foreground block truncate font-mono text-[10px] font-bold tracking-wider uppercase sm:text-[11px]">
                        Est. Capacity Value
                      </span>
                      <span className="mt-1.5 block font-mono text-2xl font-black text-emerald-600 sm:mt-2 sm:text-3xl lg:text-4xl dark:text-emerald-400">
                        <AnimatedAmount
                          amountUsd={valueRecoveredMonthly}
                          currency={currency}
                          decimals={0}
                        />
                      </span>
                      <span className="mt-0.5 block truncate text-[10.5px] text-neutral-500 sm:mt-1 sm:text-[11px]">
                        Reclaimed consulting
                      </span>
                    </div>

                    <div className="group/pod relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/90 p-3.5 text-center shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-md sm:p-4 dark:border-white/10 dark:bg-neutral-900/90">
                      <span className="text-muted-foreground block truncate font-mono text-[10px] font-bold tracking-wider uppercase sm:text-[11px]">
                        Overlap Incidents
                      </span>
                      <span className="mt-1.5 block font-mono text-2xl font-black text-neutral-900 sm:mt-2 sm:text-3xl lg:text-4xl dark:text-white">
                        0 Overlaps
                      </span>
                      <span className="mt-0.5 block truncate text-[10.5px] font-bold text-emerald-600 sm:mt-1 sm:text-[11px] dark:text-emerald-400">
                        Protected Buffer SLA
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="cockpit-breakdown"
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 rounded-2xl border border-neutral-200/90 bg-white/90 p-3.5 shadow-xs sm:p-4.5 dark:border-white/10 dark:bg-neutral-900/90"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 border-b border-neutral-200/80 pb-2 text-xs font-semibold dark:border-white/10">
                      <span className="text-[11px] font-bold text-neutral-900 sm:text-xs dark:text-white">
                        Monthly Drag Reduction Breakdown:
                      </span>
                      <span className="font-mono text-[10.5px] font-bold text-emerald-600 sm:text-[11px] dark:text-emerald-400">
                        {hoursSavedMonthly} hrs saved total
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-[10.5px] font-medium text-neutral-700 sm:text-[11px] dark:text-neutral-300">
                          <span className="truncate">1. Automated Scheduling &amp; Buffers</span>
                          <span className="shrink-0 font-mono font-bold text-emerald-600">
                            45% ({Math.round(hoursSavedMonthly * 0.45)} hrs)
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-200/70 dark:bg-neutral-800">
                          <div className="h-full w-[45%] rounded-full bg-emerald-500 shadow-2xs" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10.5px] font-medium text-neutral-700 sm:text-[11px] dark:text-neutral-300">
                          <span className="truncate">2. Auto Invoicing &amp; Stripe</span>
                          <span className="shrink-0 font-mono font-bold text-blue-600 dark:text-blue-400">
                            35% ({Math.round(hoursSavedMonthly * 0.35)} hrs)
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-200/70 dark:bg-neutral-800">
                          <div className="h-full w-[35%] rounded-full bg-blue-500 shadow-2xs" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10.5px] font-medium text-neutral-700 sm:text-[11px] dark:text-neutral-300">
                          <span className="truncate">3. Client 360° Dossier &amp; Notes</span>
                          <span className="shrink-0 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            20% ({Math.round(hoursSavedMonthly * 0.2)} hrs)
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-200/70 dark:bg-neutral-800">
                          <div className="h-full w-[20%] rounded-full bg-indigo-500 shadow-2xs" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Operational Benchmark Strip */}
          <div className="mt-6 rounded-2xl border border-neutral-200/80 bg-neutral-100/70 p-3.5 sm:mt-8 sm:p-4.5 dark:border-white/10 dark:bg-neutral-950/70">
            <div className="flex flex-col gap-1.5 text-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="font-bold text-neutral-900 dark:text-white">
                  Where Operational Drag Is Reduced:
                </span>
              </div>
              <span className="self-start rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 sm:self-auto sm:text-[11px] dark:text-emerald-400">
                Illustrative Benchmark Model
              </span>
            </div>

            <div className="mt-3.5 grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-200/80 bg-white/80 p-2.5 shadow-2xs sm:p-3 dark:border-white/5 dark:bg-neutral-900/80">
                <span className="text-muted-foreground block text-[10.5px] sm:text-[11px]">
                  Eliminated Tool Subscriptions:
                </span>
                <span className="mt-1 block font-mono text-xs font-bold text-neutral-900 sm:text-sm dark:text-white">
                  1 workspace replaces 14 point tools
                </span>
              </div>
              <div className="rounded-xl border border-neutral-200/80 bg-white/80 p-2.5 shadow-2xs sm:p-3 dark:border-white/5 dark:bg-neutral-900/80">
                <span className="text-muted-foreground block text-[10.5px] sm:text-[11px]">
                  Paced Meeting Schedules:
                </span>
                <span className="mt-1 block font-mono text-xs font-bold text-emerald-600 sm:text-sm dark:text-emerald-400">
                  +15m automatic buffer intervals
                </span>
              </div>
              <div className="rounded-xl border border-neutral-200/80 bg-white/80 p-2.5 shadow-2xs sm:p-3 dark:border-white/5 dark:bg-neutral-900/80">
                <span className="text-muted-foreground block text-[10.5px] sm:text-[11px]">
                  Accelerated Invoicing:
                </span>
                <span className="mt-1 block font-mono text-xs font-bold text-emerald-600 sm:text-sm dark:text-emerald-400">
                  Direct Stripe Connect settlement
                </span>
              </div>
            </div>
          </div>

          {/* Transparent Operational Estimation Footnote */}
          <p className="mt-4 border-t border-neutral-200/60 pt-3.5 text-center text-[10.5px] leading-relaxed text-neutral-500 sm:text-[11px] dark:border-white/5 dark:text-neutral-400">
            * Illustrative estimation based on ~18.5 hrs/consultant of manual scheduling, notes
            consolidation, and billing follow-up. Actual results depend on individual business
            workflows and service delivery models.
          </p>
        </div>
      </Container>
    </section>
  );
};
