"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Building2,
  Calendar,
  Users,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Zap,
  Lock,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Server,
  CheckCheck,
  Activity,
  Terminal,
} from "lucide-react";
import { Container } from "@/components/layout/container";

/**
 * Modern 3D Stage Card with Gyroscopic Tilt, Cursor Spotlight & Z-Depth Layering
 */
interface StageCardProps {
  id: number;
  idx: number;
  isActive: boolean;
  isPlaying: boolean;
  isConsoleHovered: boolean;
  step: WorkflowStep;
  onSelect: (idx: number) => void;
  onKeyDown: (e: React.KeyboardEvent, idx: number) => void;
}

const StageCard: React.FC<StageCardProps> = ({
  id,
  idx,
  isActive,
  isPlaying,
  isConsoleHovered,
  step,
  onSelect,
  onKeyDown,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number } | null>(null);
  const [tilt, setTilt] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const cardRef = React.useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Restrained 3D tilt: max +/- 2.2 deg
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -2.2;
    const rotateY = ((x - centerX) / centerX) * 2.2;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setTilt({ x: 0, y: 0 });
  };

  const StepIcon = step.icon;

  const stageAccentColors = [
    {
      glow: "rgba(37, 99, 235, 0.15)",
      border: "border-blue-500/50 dark:border-blue-400/50",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      glow: "rgba(16, 185, 129, 0.15)",
      border: "border-emerald-500/50 dark:border-emerald-400/50",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      glow: "rgba(245, 158, 11, 0.15)",
      border: "border-amber-500/50 dark:border-amber-400/50",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      glow: "rgba(6, 182, 212, 0.15)",
      border: "border-cyan-500/50 dark:border-cyan-400/50",
      badge: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    },
  ];

  const currentAccent = stageAccentColors[idx % stageAccentColors.length];

  return (
    <motion.button
      ref={cardRef}
      id={`workflow-step-tab-${idx}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`workflow-step-panel-${idx}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onSelect(idx)}
      onKeyDown={(e) => onKeyDown(e, idx)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      style={{
        transform: shouldReduceMotion
          ? "none"
          : `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.16s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`group focus-visible:ring-primary relative z-10 w-full cursor-pointer overflow-hidden rounded-2xl border p-3.5 sm:p-4.5 text-left select-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden ${
        isActive
          ? `ring-primary/25 bg-white shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 dark:bg-gradient-to-b dark:from-[#0d172e] dark:to-[#070d1a] dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] ${currentAccent.border}`
          : "border-neutral-200/80 bg-white/70 hover:border-neutral-300 hover:bg-white/95 dark:border-white/10 dark:bg-neutral-900/60 dark:hover:border-white/20 dark:hover:bg-neutral-900/90"
      }`}
    >
      {/* Dynamic Cursor Spotlight */}
      {mousePos && !shouldReduceMotion && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, ${currentAccent.glow}, transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Top Specular Hairline Rim Light */}
      <div className="via-primary/30 pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent dark:via-white/25" />

      <div
        className="relative z-10 flex items-start gap-3.5"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Step Numeric Node with 3D Z-Depth Layering */}
        <div
          className="relative shrink-0"
          style={{ transform: shouldReduceMotion ? "none" : "translateZ(20px)" }}
        >
          <div
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl font-mono text-xs font-bold transition-all duration-200 ${
              isActive
                ? "bg-primary text-white shadow-[0_0_14px_rgba(37,99,235,0.6)]"
                : "border border-neutral-200/80 bg-neutral-100/80 text-neutral-500 group-hover:border-neutral-300 group-hover:text-neutral-900 dark:border-white/10 dark:bg-neutral-800/80 dark:text-neutral-400 dark:group-hover:text-white"
            }`}
          >
            <StepIcon className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="flex items-center justify-between gap-2"
            style={{ transform: shouldReduceMotion ? "none" : "translateZ(14px)" }}
          >
            <span className="min-w-0 truncate font-mono text-[10px] font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
              Stage {step.stepNumber} &bull; {step.badge}
            </span>
            {isActive && (
              <span className="border-primary/30 bg-primary/10 text-primary flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                </span>
                Active
              </span>
            )}
          </div>

          <h3
            style={{ transform: shouldReduceMotion ? "none" : "translateZ(16px)" }}
            className={`mt-1 text-sm font-bold transition-colors sm:text-base ${
              isActive
                ? "font-extrabold text-neutral-900 dark:text-white"
                : "text-neutral-700 group-hover:text-neutral-900 dark:text-neutral-300 dark:group-hover:text-white"
            }`}
          >
            {step.title}
          </h3>

          <p
            style={{ transform: shouldReduceMotion ? "none" : "translateZ(10px)" }}
            className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400"
          >
            {step.description}
          </p>

          <div
            style={{ transform: shouldReduceMotion ? "none" : "translateZ(12px)" }}
            className="mt-2.5 flex items-start gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="leading-tight">{step.highlight}</span>
          </div>
        </div>
      </div>

      {/* Active Step Progress Timer Bar */}
      {isActive && isPlaying && !shouldReduceMotion && (
        <div className="absolute right-0 bottom-0 left-0 h-1 overflow-hidden bg-neutral-200/60 dark:bg-neutral-800">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: isConsoleHovered ? undefined : "100%" }}
            transition={{ duration: 4.5, ease: "linear" }}
            key={`timer-${id}-${isPlaying}-${isConsoleHovered}`}
            className="bg-primary h-full shadow-[0_0_8px_rgba(37,99,235,0.8)]"
          />
        </div>
      )}
    </motion.button>
  );
};

/**
 * Aerospace & Obsidian-Grade Mission Control Console with 3D Parallax & Gyroscopic Tilt
 */
interface PipelineConsoleProps {
  children: React.ReactNode;
  className?: string;
  activeStep: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const PipelineConsole: React.FC<PipelineConsoleProps> = ({
  children,
  className = "",
  activeStep,
  onMouseEnter,
  onMouseLeave,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number } | null>(null);
  const [tilt, setTilt] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const consoleRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !consoleRef.current) return;
    const rect = consoleRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Restrained, luxury console tilt: max +/- 1.8deg
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -1.8;
    const rotateY = ((x - centerX) / centerX) * 1.8;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setTilt({ x: 0, y: 0 });
  };

  const stageSpotlights = [
    "rgba(37, 99, 235, 0.12)",
    "rgba(16, 185, 129, 0.12)",
    "rgba(245, 158, 11, 0.12)",
    "rgba(6, 182, 212, 0.12)",
  ];

  const currentGlow = stageSpotlights[activeStep % stageSpotlights.length];

  return (
    <motion.div
      ref={consoleRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        handleMouseLeave();
        onMouseLeave?.();
      }}
      onMouseEnter={onMouseEnter}
      style={{
        transform: shouldReduceMotion
          ? "none"
          : `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 ${className} border-neutral-200/90 bg-white/95 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-white/12 dark:bg-gradient-to-b dark:from-[#0b1222]/98 dark:to-[#050811]/98 dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)]`}
    >
      {/* Dynamic Cursor Spotlight */}
      {mousePos && !shouldReduceMotion && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, ${currentGlow}, transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Blueprint Dot Matrix Mask */}
      <div
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_65%,transparent_100%)] opacity-20 dark:opacity-15"
        style={{
          backgroundImage: "radial-gradient(rgba(148, 163, 184, 0.4) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden="true"
      />

      {/* Specular Top Rim Light */}
      <div
        className="via-primary/35 pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent dark:via-white/25"
        aria-hidden="true"
      />

      {/* Content with Preserved 3D */}
      <div
        className="relative z-10 flex h-full flex-col justify-between"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </div>
    </motion.div>
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
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 0,
    stepNumber: "01",
    badge: "Workspace Provisioning",
    title: "Establish Your Business Workspace",
    description:
      "Initialize your multi-tenant organization profile with your operating currency, timezone, and business details.",
    highlight: "Organization-scoped access ensures complete tenant data boundary.",
    icon: Building2,
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
  },
];

const currencyRates: Record<
  "USD" | "EUR" | "GBP" | "BDT",
  {
    symbol: string;
    services: [string, string, string];
    line1: string;
    line2: string;
    total: string;
  }
> = {
  USD: {
    symbol: "$",
    services: ["$250", "$400", "$150"],
    line1: "$3,125.00",
    line2: "$400.00",
    total: "$3,525.00",
  },
  EUR: {
    symbol: "€",
    services: ["€230", "€368", "€138"],
    line1: "€2,875.00",
    line2: "€368.00",
    total: "€3,243.00",
  },
  GBP: {
    symbol: "£",
    services: ["£195", "£315", "£120"],
    line1: "£2,468.75",
    line2: "£316.00",
    total: "£2,784.75",
  },
  BDT: {
    symbol: "৳",
    services: ["৳29,875", "৳47,800", "৳17,925"],
    line1: "৳3,73,437.50",
    line2: "৳47,800.00",
    total: "৳4,21,237.50",
  },
};

export const WorkflowSection: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [isConsoleHovered, setIsConsoleHovered] = React.useState(false);
  const [isTabVisible, setIsTabVisible] = React.useState(true);
  const [selectedCurrency, setSelectedCurrency] = React.useState<"USD" | "EUR" | "GBP" | "BDT">(
    "USD"
  );
  const [activeServiceChip, setActiveServiceChip] = React.useState(0);
  const [isSettledStage4, setIsSettledStage4] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  const activeCurrencyConfig = currencyRates[selectedCurrency];

  // Document visibility listener to pause timer when tab is hidden
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Auto-advancing orchestration timeline (4.5s per step, reset cleanly on activeStep change)
  React.useEffect(() => {
    if (!isPlaying || isConsoleHovered || !isTabVisible || shouldReduceMotion) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPlaying, isConsoleHovered, isTabVisible, shouldReduceMotion, activeStep]);

  const currentStep = workflowSteps[activeStep];

  const handleNextStep = () => {
    setActiveStep((prev) => (prev + 1) % workflowSteps.length);
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => (prev - 1 + workflowSteps.length) % workflowSteps.length);
  };

  const handleStepSelect = (idx: number) => {
    setActiveStep(idx);
  };

  // Keyboard navigation for step tablist
  const handleStepKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let nextIndex = idx;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (idx + 1) % workflowSteps.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (idx - 1 + workflowSteps.length) % workflowSteps.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = workflowSteps.length - 1;
    } else {
      return;
    }

    setActiveStep(nextIndex);
    const targetTab = document.getElementById(`workflow-step-tab-${nextIndex}`);
    targetTab?.focus();
  };

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 overflow-hidden border-t border-neutral-200/70 bg-neutral-50/40 py-20 md:py-28 dark:border-white/10 dark:bg-black/30"
    >
      {/* Background Dot Blueprint Grid with Vignette */}
      <div
        className="bg-dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 dark:opacity-15"
        aria-hidden="true"
      />

      {/* Contained Ambient Radial Flares (No horizontal overflow) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute top-1/3 -left-48 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/15"
          aria-hidden="true"
        />
        <div
          className="absolute -right-48 bottom-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/15"
          aria-hidden="true"
        />
      </div>

      <Container>
        {/* ========================================================================= */}
        {/* MASTER SECTION EDITORIAL HEADER                                           */}
        {/* ========================================================================= */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Aerospace Hardware-Grade Eyebrow Badge */}
          <div className="flex items-center justify-center">
            <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-neutral-200/90 bg-white/90 px-3 py-1 sm:px-4 sm:py-1.5 text-xs font-semibold text-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md dark:border-white/15 dark:bg-neutral-900/90 dark:text-neutral-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.5)]">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="bg-primary relative inline-flex h-2 w-2 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.9)]" />
              </span>
              <span className="tracking-wide">How FlowPilot Works</span>
              <span className="text-neutral-300 dark:text-neutral-600">•</span>
              <span className="font-mono text-[11px] text-blue-600 dark:text-cyan-400">
                4-Stage Pipeline
              </span>
              <span className="hidden text-neutral-300 sm:inline dark:text-neutral-600">•</span>
              <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 sm:inline dark:text-emerald-400">
                Automated Engine
              </span>
            </div>
          </div>

          {/* Master Radiant Heading */}
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-5xl">
            <span className="text-neutral-900 drop-shadow-xs dark:bg-gradient-to-b dark:from-white dark:via-neutral-100 dark:to-neutral-300 dark:bg-clip-text dark:text-transparent">
              A Straightforward Workflow from
            </span>{" "}
            <span className="mt-1 block bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300">
              Setup to Scale
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-300">
            FlowPilot transforms everyday service operations into a predictable, connected sequence.
            Explore the live operational progression below.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* MAIN PIPELINE CONSOLE: 12-COL ASYMMETRIC GRID                             */}
        {/* ========================================================================= */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-7 xl:gap-8">
          {/* ======================================================================= */}
          {/* LEFT COLUMN: CONNECTED PROGRESSIVE TIMELINE (5 COLS)                     */}
          {/* ======================================================================= */}
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label="Workflow stages"
            className="relative flex flex-col justify-between space-y-3.5 lg:col-span-5"
          >
            {/* Glowing Laser Circuit Spine Track (Desktop only) */}
            <div
              className="absolute top-8 bottom-8 left-[31px] -z-0 hidden w-[2px] overflow-hidden rounded-full border-neutral-200/80 bg-neutral-200/60 lg:block dark:border-white/10 dark:bg-white/10"
              aria-hidden="true"
            >
              <div
                className="bg-primary w-full shadow-[0_0_8px_rgba(37,99,235,0.7)] transition-all duration-300"
                style={{
                  height: `${(activeStep / (workflowSteps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {workflowSteps.map((step, idx) => (
              <StageCard
                key={step.id}
                id={step.id}
                idx={idx}
                isActive={activeStep === idx}
                isPlaying={isPlaying}
                isConsoleHovered={isConsoleHovered}
                step={step}
                onSelect={handleStepSelect}
                onKeyDown={handleStepKeyDown}
              />
            ))}
          </div>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN: REFINED PIPELINE CONSOLE (7 COLS)                         */}
          {/* ======================================================================= */}
          <div className="lg:col-span-7">
            <PipelineConsole
              activeStep={activeStep}
              onMouseEnter={() => setIsConsoleHovered(true)}
              onMouseLeave={() => setIsConsoleHovered(false)}
            >
              {/* Hardware Console Window Header Bar with 3D Z-Depth */}
              <div
                style={{ transform: shouldReduceMotion ? "none" : "translateZ(24px)" }}
                className="flex items-center justify-between border-b border-neutral-200/80 bg-neutral-100/70 px-3 py-2 sm:px-5 sm:py-3 dark:border-white/10 dark:bg-neutral-900/80"
              >
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  {/* Mac Gloss Traffic Dots */}
                  <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56] shadow-[0_0_6px_rgba(255,95,86,0.6),inset_0_0.5px_0.5px_rgba(255,255,255,0.6)]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e] shadow-[0_0_6px_rgba(255,189,46,0.6),inset_0_0.5px_0.5px_rgba(255,255,255,0.6)]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f] shadow-[0_0_6px_rgba(39,201,63,0.6),inset_0_0.5px_0.5px_rgba(255,255,255,0.6)]" />
                  </div>
                  <span className="shrink-0 text-neutral-400 dark:text-neutral-600">|</span>
                  <span className="flex min-w-0 items-center gap-1.5 font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                    <Terminal className="text-primary h-3 w-3 shrink-0" />
                    <span className="hidden truncate sm:inline">
                      flowpilot-orchestrator // stage-0{activeStep + 1}
                    </span>
                    <span className="truncate sm:hidden">stage-0{activeStep + 1}</span>
                  </span>
                </div>

                {/* Stage Controls: Prev / Next / Play-Pause */}
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    aria-label="Previous Stage"
                    title="Previous Stage"
                    className="focus-visible:ring-primary flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-neutral-200/80 bg-white/80 text-neutral-600 transition-colors hover:bg-white hover:text-neutral-900 focus-visible:ring-2 focus-visible:outline-hidden active:scale-95 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    aria-label="Next Stage"
                    title="Next Stage"
                    className="focus-visible:ring-primary flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-neutral-200/80 bg-white/80 text-neutral-600 transition-colors hover:bg-white hover:text-neutral-900 focus-visible:ring-2 focus-visible:outline-hidden active:scale-95 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    aria-label={
                      isPlaying ? "Pause automated workflow" : "Resume automated workflow"
                    }
                    title={isPlaying ? "Pause automated workflow" : "Resume automated workflow"}
                    className="focus-visible:ring-primary flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-neutral-200/80 bg-white/80 text-neutral-600 transition-colors hover:bg-white hover:text-neutral-900 focus-visible:ring-2 focus-visible:outline-hidden active:scale-95 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white"
                  >
                    {isPlaying ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <span className="hidden items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 sm:inline-flex dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                    Live Pipeline
                  </span>
                </div>
              </div>

              {/* Stage Viewport with 3D Depth */}
              <div
                role="tabpanel"
                id={`workflow-step-panel-${activeStep}`}
                aria-labelledby={`workflow-step-tab-${activeStep}`}
                style={{ transform: shouldReduceMotion ? "none" : "translateZ(16px)" }}
                className="relative min-h-[400px] p-4 sm:p-6 md:p-7"
              >
                <AnimatePresence mode="wait">
                  {/* =============================================================== */}
                  {/* SCREEN 01: WORKSPACE & TENANT BOUNDARY                          */}
                  {/* =============================================================== */}
                  {activeStep === 0 && (
                    <motion.div
                      key="step-0"
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="space-y-4 motion-reduce:!transform-none motion-reduce:!opacity-100"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/80 pb-3 dark:border-white/10">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/15 text-blue-600 shadow-xs dark:text-blue-400">
                            <Server className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-extrabold text-neutral-900 dark:text-white">
                              Isolated Multi-Tenant Workspace
                            </h4>
                            <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                              Scoped organization boundary (org_demo_apex)
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          Workspace Active
                        </span>
                      </div>

                      {/* Interactive Ledger Currency Selector */}
                      <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-4 shadow-inner dark:border-white/10 dark:bg-black/40">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="font-bold text-neutral-900 dark:text-white">
                              Operating Ledger Currency:
                            </span>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                              All invoicing, payout ledgers, and reporting normalize here
                            </p>
                          </div>
                          <div
                            role="radiogroup"
                            aria-label="Operating ledger currency"
                            className="flex items-center rounded-lg border border-neutral-200/90 bg-neutral-100/80 p-1 dark:border-white/10 dark:bg-neutral-800/80"
                          >
                            {(["USD", "EUR", "GBP", "BDT"] as const).map((curr) => (
                              <button
                                key={curr}
                                type="button"
                                role="radio"
                                aria-checked={selectedCurrency === curr}
                                onClick={() => setSelectedCurrency(curr)}
                                className={`focus-visible:ring-primary cursor-pointer rounded-md px-2.5 py-0.5 font-mono text-xs font-bold transition-all focus-visible:ring-2 focus-visible:outline-hidden ${
                                  selectedCurrency === curr
                                    ? "bg-primary text-white shadow-xs"
                                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                                }`}
                              >
                                {curr}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Live Telemetry Metrics */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="relative overflow-hidden rounded-xl border border-neutral-200/90 bg-white/95 p-3 shadow-xs dark:border-white/10 dark:bg-neutral-900/90">
                          <span className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                            Tenant Isolation
                          </span>
                          <span className="mt-1 flex items-center gap-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden truncate sm:inline">Organization Scoped</span>
                            <span className="truncate sm:hidden">Org Scoped</span>
                          </span>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-neutral-200/90 bg-white/95 p-3 shadow-xs dark:border-white/10 dark:bg-neutral-900/90">
                          <span className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                            Workspace Routing
                          </span>
                          <span className="mt-1 flex items-center gap-1 font-mono text-xs font-bold text-neutral-900 dark:text-white">
                            <Activity className="h-3.5 w-3.5 shrink-0 text-blue-500" /> Operational
                          </span>
                        </div>
                        <div className="relative col-span-2 overflow-hidden rounded-xl border border-neutral-200/90 bg-white/95 p-3 shadow-xs sm:col-span-1 dark:border-white/10 dark:bg-neutral-900/90">
                          <span className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                            Data Boundary
                          </span>
                          <span className="mt-1 block font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            Strict Boundary
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span className="leading-snug">
                            Workspace online. Ready for automated scheduling &amp; billing hand-off.
                          </span>
                        </div>
                        <span className="shrink-0 font-mono text-[10px]">Zero Config</span>
                      </div>
                    </motion.div>
                  )}

                  {/* =============================================================== */}
                  {/* SCREEN 02: SERVICES & CAPACITY COLLISION ENGINE                 */}
                  {/* =============================================================== */}
                  {activeStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="space-y-4 motion-reduce:!transform-none motion-reduce:!opacity-100"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/80 pb-3 dark:border-white/10">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/15 text-emerald-600 shadow-xs dark:text-emerald-400">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-extrabold text-neutral-900 dark:text-white">
                              Service Matrix &amp; Buffer Control
                            </h4>
                            <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                              Zero scheduling collision engine with automated rest gaps
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          Buffer: +15m Auto
                        </span>
                      </div>

                      {/* Interactive Service Chips */}
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {[
                          {
                            title: "Strategy Call",
                            duration: "60 mins",
                            price: activeCurrencyConfig.services[0],
                          },
                          {
                            title: "Arch Review",
                            duration: "90 mins",
                            price: activeCurrencyConfig.services[1],
                          },
                          {
                            title: "Advisory Sprint",
                            duration: "30 mins",
                            price: activeCurrencyConfig.services[2],
                          },
                        ].map((srv, i) => (
                          <button
                            key={srv.title}
                            type="button"
                            onClick={() => setActiveServiceChip(i)}
                            className={`focus-visible:ring-primary cursor-pointer rounded-xl border p-3 text-left transition-all focus-visible:ring-2 focus-visible:outline-hidden ${
                              activeServiceChip === i
                                ? "border-emerald-500/70 bg-emerald-500/10 shadow-xs"
                                : "border-neutral-200/80 bg-white/80 hover:border-neutral-300 dark:border-white/10 dark:bg-neutral-900/80"
                            }`}
                          >
                            <span className="block text-xs font-bold text-neutral-900 dark:text-white">
                              {srv.title}
                            </span>
                            <span className="block text-[10px] text-neutral-500 dark:text-neutral-400">
                              {srv.duration}
                            </span>
                            <span className="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                              {srv.price}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Visual Timeline Buffer Shield Demonstration */}
                      <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-4 shadow-inner dark:border-white/10 dark:bg-black/40">
                        <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs font-bold">
                          <span className="text-neutral-900 dark:text-white">
                            Live Timeline Protection Demonstration
                          </span>
                          <span className="shrink-0 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                            Active Collision Guard
                          </span>
                        </div>

                        {/* Meeting Slot ➔ Buffer Wall ➔ Next Available Slot */}
                        <div className="mt-3 flex flex-col items-center gap-2 text-xs sm:grid sm:grid-cols-12">
                          <div className="w-full rounded-xl border border-neutral-200/80 bg-white/95 p-2.5 text-center shadow-xs sm:col-span-5 dark:border-white/10 dark:bg-neutral-900/90">
                            <span className="block font-bold text-neutral-900 dark:text-white">
                              09:00 - 10:00 AM
                            </span>
                            <span className="block text-[10px] text-neutral-500 dark:text-neutral-400">
                              Client Strategy Call
                            </span>
                          </div>

                          <div className="w-full rounded-xl border border-dashed border-emerald-500/50 bg-emerald-500/15 p-2 text-center text-emerald-700 sm:col-span-3 dark:text-emerald-300">
                            <span className="flex items-center justify-center gap-1 font-mono text-[11px] font-black">
                              <Clock className="h-3 w-3 shrink-0" /> +15m
                            </span>
                            <span className="block truncate text-[9px] font-bold">Protected Buffer</span>
                          </div>

                          <div className="w-full rounded-xl border border-neutral-200/80 bg-white/95 p-2.5 text-center shadow-xs sm:col-span-4 dark:border-white/10 dark:bg-neutral-900/90">
                            <span className="block font-bold text-neutral-900 dark:text-white">
                              10:15 AM
                            </span>
                            <span className="block text-[10px] text-neutral-500 dark:text-neutral-400">
                              Next Open Slot
                            </span>
                          </div>
                        </div>

                        {/* Capacity Load Monitor */}
                        <div className="mt-3.5 space-y-2 border-t border-neutral-200/60 pt-2.5 text-[11px] dark:border-white/10">
                          <div className="flex justify-between">
                            <span className="text-neutral-500 dark:text-neutral-400">
                              Sarah Chen (Principal Lead)
                            </span>
                            <span className="font-mono font-bold text-neutral-900 dark:text-white">
                              75% Capacity [Balanced]
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800">
                            <div className="h-full w-3/4 rounded-full bg-emerald-500" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* =============================================================== */}
                  {/* SCREEN 03: COORDINATE APPOINTMENTS & CLIENT DELIVERY            */}
                  {/* =============================================================== */}
                  {activeStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="space-y-4 motion-reduce:!transform-none motion-reduce:!opacity-100"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/80 pb-3 dark:border-white/10">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/15 text-amber-600 shadow-xs dark:text-amber-400">
                            <Users className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-extrabold text-neutral-900 dark:text-white">
                              Live Client Delivery &amp; Context Sync
                            </h4>
                            <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                              Booking automatically merged into customer history &amp; RBAC scope
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          Stream Synced
                        </span>
                      </div>

                      {/* Live Booking Dispatch Card */}
                      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-4 sm:p-4.5 shadow-inner dark:border-white/10 dark:bg-black/40">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/80 pb-3 dark:border-white/10">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 font-mono text-xs font-bold text-amber-600 shadow-2xs">
                              02:00
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-neutral-900 dark:text-white">
                                Enterprise Infrastructure Review
                              </p>
                              <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                                Apex Solutions &bull; Sarah Chen &bull; Marcus Vance
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-blue-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                            60m Video Synced
                          </span>
                        </div>

                        {/* Automatic Briefing Memo */}
                        <div className="relative mt-3 overflow-hidden rounded-xl border border-neutral-200/80 bg-white/95 p-3 text-xs shadow-xs dark:border-white/10 dark:bg-neutral-900/90">
                          <span className="block text-[10px] font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                            Auto-Attached Context Memo:
                          </span>
                          <p className="mt-1 text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                            &quot;Client requested architectural assessment of multi-tenant database
                            migration under organization org_demo_apex.&quot;
                          </p>
                        </div>

                        {/* RBAC Boundary Security Pill */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200/60 pt-2.5 text-[10px] text-neutral-500 dark:border-white/10 dark:text-neutral-400">
                          <span className="flex min-w-0 flex-1 items-center gap-1.5">
                            <Lock className="h-3 w-3 shrink-0 text-amber-500" />
                            <span className="truncate">Billing scope masked for non-finance team members</span>
                          </span>
                          <span className="shrink-0 font-semibold text-emerald-600 dark:text-emerald-400">
                            RBAC Verified
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* =============================================================== */}
                  {/* SCREEN 04: ISSUE INVOICES & RECONCILE CASH FLOW                 */}
                  {/* =============================================================== */}
                  {activeStep === 3 && (
                    <motion.div
                      key="step-3"
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="space-y-4 motion-reduce:!transform-none motion-reduce:!opacity-100"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/80 pb-3 dark:border-white/10">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/15 text-cyan-600 shadow-xs dark:text-cyan-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-extrabold text-neutral-900 dark:text-white">
                              One-Click Invoice &amp; Stripe Settlement
                            </h4>
                            <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                              Delivered appointment hours converted into instant payouts
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 font-mono text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                          Stripe Connected
                        </span>
                      </div>

                      {/* Invoice Summary Card */}
                      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-4 sm:p-4.5 shadow-inner dark:border-white/10 dark:bg-black/40">
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/80 pb-3 text-xs dark:border-white/10">
                          <div className="min-w-0">
                            <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                              #INV-2026-904
                            </span>
                            <p className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">
                              Client: Apex Solutions Inc.
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              Auto-Reconciled
                            </span>
                          </div>
                        </div>

                        {/* Line Item Breakdown */}
                        <div className="relative mt-3 space-y-2 overflow-hidden rounded-xl border border-neutral-200/80 bg-white/95 p-3.5 text-xs shadow-xs dark:border-white/10 dark:bg-neutral-900/90">
                          <div className="flex items-center justify-between gap-2">
                            <span className="min-w-0 flex-1 truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                              Strategic Advisory (12.5 hrs)
                            </span>
                            <span className="shrink-0 font-mono font-bold text-neutral-900 dark:text-white">
                              {activeCurrencyConfig.line1}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="min-w-0 flex-1 truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                              Architecture Review (1 Session)
                            </span>
                            <span className="shrink-0 font-mono font-bold text-neutral-900 dark:text-white">
                              {activeCurrencyConfig.line2}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 border-t border-neutral-200/80 pt-2 font-bold dark:border-white/10">
                            <span className="min-w-0 flex-1 truncate text-neutral-900 dark:text-white">
                              Total Disbursed:
                            </span>
                            <span className="shrink-0 font-mono text-emerald-600 dark:text-emerald-400">
                              {activeCurrencyConfig.total}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Instant Settlement Action */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                              Direct Bank Payout:
                            </span>
                            {isSettledStage4 && (
                              <button
                                type="button"
                                onClick={() => setIsSettledStage4(false)}
                                className="focus-visible:ring-primary cursor-pointer text-[10px] font-semibold text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:outline-hidden dark:text-neutral-400 dark:hover:text-white"
                              >
                                Reset Simulation
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsSettledStage4((prev) => !prev)}
                            className={`focus-visible:ring-primary relative inline-flex w-full sm:w-auto justify-center cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold shadow-xs transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-[0.98] ${
                              isSettledStage4
                                ? "bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700"
                                : "bg-primary hover:bg-primary-hover shadow-primary/25 text-white"
                            }`}
                          >
                            {isSettledStage4 ? (
                              <>
                                <CheckCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                                <span>Reconciled via Stripe</span>
                              </>
                            ) : (
                              <>
                                <Zap className="h-3.5 w-3.5" />
                                <span>Simulate Instant Payout</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Disbursed Badge Overlay */}
                        <AnimatePresence>
                          {isSettledStage4 && (
                            <motion.div
                              initial={shouldReduceMotion ? false : { scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.95, opacity: 0 }}
                              transition={{ duration: shouldReduceMotion ? 0 : 0.12 }}
                              className="pointer-events-none absolute top-2 right-2 sm:top-3 sm:right-3 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 sm:px-3 sm:py-1 shadow-sm backdrop-blur-md motion-reduce:!transform-none motion-reduce:!opacity-100"
                            >
                              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <CheckCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                                <span className="font-mono text-[10px] sm:text-xs font-bold tracking-wider uppercase">
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
              <div
                style={{ transform: shouldReduceMotion ? "none" : "translateZ(14px)" }}
                className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-t border-neutral-200/80 bg-neutral-100/60 px-3.5 py-2.5 sm:px-5 sm:py-3 text-xs font-medium dark:border-white/10 dark:bg-neutral-900/60"
              >
                <span className="flex min-w-0 flex-1 items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span className="truncate">Integrated Operations Pipeline Engine</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 font-semibold text-neutral-900 dark:text-white">
                  <span>Stage {currentStep.stepNumber} of 04</span>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                </span>
              </div>
            </PipelineConsole>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM INTEGRATED TELEMETRY STRIP (4 INDEPENDENT 3D FLOATING HARDWARE CARDS) */}
        {/* ========================================================================= */}
        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 md:gap-5">
          {[
            {
              metric: "Instant",
              label: "Multi-Tenant Workspace Provisioning",
              color: "text-neutral-900 dark:text-white",
              badge: "Auto Scoped",
            },
            {
              metric: "0%",
              label: "Calendar Collisions & Overlaps",
              color: "text-emerald-600 dark:text-emerald-400",
              badge: "Buffer Guard",
            },
            {
              metric: "1-Click",
              label: "Delivered Session to Invoice Conversion",
              color: "text-neutral-900 dark:text-white",
              badge: "Instant Liquidity",
            },
            {
              metric: "100%",
              label: "Multi-Tenant Scoped Isolation",
              color: "text-neutral-900 dark:text-white",
              badge: "Zero Cross-Leak",
            },
          ].map((item) => (
            <motion.div
              key={item.label}
              whileHover={shouldReduceMotion ? undefined : { y: -3 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/90 p-3.5 text-center shadow-xs backdrop-blur-md transition-all hover:border-neutral-300 hover:shadow-md sm:p-5 dark:border-white/10 dark:bg-[#0a0f1d]/90 dark:shadow-[0_15px_35px_rgba(0,0,0,0.6)] dark:hover:border-white/20"
            >
              {/* Top Specular Glint */}
              <div className="via-primary/25 pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent dark:via-white/20" />

              <span className={`block font-mono text-xl font-extrabold sm:text-2xl md:text-3xl ${item.color}`}>
                {item.metric}
              </span>
              <span className="mt-1 block text-[11px] font-medium leading-tight text-neutral-600 sm:text-xs dark:text-neutral-400">
                {item.label}
              </span>
              <div className="mt-2.5 flex items-center justify-center">
                <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100/80 px-2 py-0.5 font-mono text-[9.5px] font-semibold text-neutral-500 dark:border-white/10 dark:bg-neutral-800/80 dark:text-neutral-400">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  {item.badge}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};
