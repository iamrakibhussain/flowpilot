"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Users,
  Calendar,
  ArrowRight,
  Clock,
  Laptop,
  Sparkles,
  ShieldCheck,
  Check,
  Video,
  Lock,
  CreditCard,
  Building2,
  Play,
  Pause,
  AlertTriangle,
  Terminal,
  Minus,
  Maximize2,
  X,
  Flame,
  Coffee,
  RotateCcw,
  FileSpreadsheet,
  AlertCircle,
  Mail,
  ShieldAlert,
  Zap,
  Database,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PreviewTab = "scheduling" | "crm" | "invoicing" | "security";
type RealityMode = "calm" | "chaos";
type CurrencyCode = "USD" | "EUR" | "GBP" | "BDT";

interface DayTimePoint {
  time: string;
  tab: PreviewTab;
  title: string;
  tag: string;
  calmSummary: string;
  chaosSummary: string;
}

const DAY_TIMELINE: DayTimePoint[] = [
  {
    time: "09:00 AM",
    tab: "scheduling",
    title: "Morning Calibration",
    tag: "Buffer Engine",
    calmSummary:
      "Dynamic +15m buffer prevents double-booking. Meeting start times automatically adjust to protect prep.",
    chaosSummary:
      "Two client calls booked at 10:00 & 10:15 AM across separate calendar links. Overlapping Zoom rush.",
  },
  {
    time: "11:30 AM",
    tab: "crm",
    title: "Client Dossier Review",
    tag: "360° Dossier",
    calmSummary:
      "Apex Solutions dossier auto-aggregates with 98% Health Radar, retainer metrics, and verified notes.",
    chaosSummary:
      "Scrambling across 14 tabs and Google Sheets to find client notes, deliverables, and latest contract terms.",
  },
  {
    time: "02:15 PM",
    tab: "security",
    title: "Tenant Boundary Defense",
    tag: "Scoped Access",
    calmSummary:
      "Frontend simulation: Organization-scoped access boundaries strictly isolate multi-tenant workspace data.",
    chaosSummary:
      "Public spreadsheet link leaked. Private billing margins and client proposals exposed across accounts.",
  },
  {
    time: "05:00 PM",
    tab: "invoicing",
    title: "Treasury Day-Close",
    tag: "Stripe Connect",
    calmSummary:
      "1-Click settlement simulation dispatches multi-currency invoice into Stripe Connect with auto-reconciliation.",
    chaosSummary:
      "Invoice overdue 42 days. Sending 4th manual email reminder with zero payment reconciliation.",
  },
];

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

export const ProductPreviewSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [realityMode, setRealityMode] = React.useState<RealityMode>("calm");
  const [activeTab, setActiveTab] = React.useState<PreviewTab>("scheduling");
  const [activeTimelineIndex, setActiveTimelineIndex] = React.useState(0);
  const [bufferMinutes, setBufferMinutes] = React.useState<0 | 15 | 30>(15);
  const [selectedClient, setSelectedClient] = React.useState<"apex" | "meridian" | "kinetic">(
    "apex"
  );
  const [invoiceSettled, setInvoiceSettled] = React.useState(false);
  const [breachTested, setBreachTested] = React.useState(false);
  const [isSimulatingBreach, setIsSimulatingBreach] = React.useState(false);
  const [currency, setCurrency] = React.useState<CurrencyCode>("USD");
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(false);

  // Day Flight Scrubber Auto-Player
  React.useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveTimelineIndex((prev) => {
        const nextIdx = (prev + 1) % DAY_TIMELINE.length;
        const nextTimePoint = DAY_TIMELINE[nextIdx];
        if (nextTimePoint) {
          setActiveTab(nextTimePoint.tab);
        }
        if (nextIdx === 0) setBufferMinutes(15);
        if (nextIdx === 1) setSelectedClient("apex");
        if (nextIdx === 2) setBreachTested(true);
        if (nextIdx === 3) setInvoiceSettled(true);
        return nextIdx;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleSelectTimelineNode = (idx: number) => {
    setActiveTimelineIndex(idx);
    const tp = DAY_TIMELINE[idx];
    if (tp) {
      setActiveTab(tp.tab);
    }
    setIsAutoPlaying(false);
  };

  const handleTriggerBreach = () => {
    setIsSimulatingBreach(true);
    setBreachTested(false);
    setTimeout(() => {
      setIsSimulatingBreach(false);
      setBreachTested(true);
    }, 550);
  };

  const handleResetDemo = () => {
    setRealityMode("calm");
    setActiveTab("scheduling");
    setActiveTimelineIndex(0);
    setBufferMinutes(15);
    setSelectedClient("apex");
    setInvoiceSettled(false);
    setBreachTested(false);
    setIsSimulatingBreach(false);
    setCurrency("USD");
    setIsAutoPlaying(false);
  };

  // Keyboard navigation for tablist
  const tabKeys: PreviewTab[] = ["scheduling", "crm", "invoicing", "security"];
  const handleTabKeyDown = (e: React.KeyboardEvent, currentTab: PreviewTab) => {
    const currentIndex = tabKeys.indexOf(currentTab);
    let nextIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabKeys.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabKeys.length) % tabKeys.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = tabKeys.length - 1;
    }
    if (nextIndex !== -1) {
      const targetTab = tabKeys[nextIndex];
      if (targetTab) {
        setActiveTab(targetTab);
        const targetBtn = document.getElementById(`preview-tab-${targetTab}`);
        targetBtn?.focus();
      }
    }
  };

  const activeDayPoint = DAY_TIMELINE[activeTimelineIndex] || DAY_TIMELINE[0]!;

  return (
    <section
      id="preview"
      className="border-border/70 bg-surface/30 relative scroll-mt-20 overflow-hidden border-t py-16 md:py-24"
    >
      {/* Secondary anchor for features navigation */}
      <span id="features" className="absolute -top-24" aria-hidden="true" />

      {/* Contained Ambient Background Glow & Micro-Dot Matrix (zero horizontal overflow guaranteed) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className={`absolute top-1/2 left-1/2 h-[650px] w-[850px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] transition-all duration-700 ${
            realityMode === "chaos"
              ? "bg-rose-500/15 opacity-80"
              : "bg-blue-500/15 opacity-80 dark:bg-blue-400/15"
          }`}
        />
        <div
          className={`absolute top-1/4 -right-24 h-[450px] w-[450px] rounded-full blur-[120px] transition-all duration-700 ${
            realityMode === "chaos"
              ? "bg-amber-500/10 opacity-60"
              : "bg-emerald-500/10 opacity-60 dark:bg-emerald-400/10"
          }`}
        />
        {/* Subtle high-tech grid micro-texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-35 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] dark:opacity-30" />
      </div>

      <Container>
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div>
            <div className="border-border/80 bg-background/80 text-foreground inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs backdrop-blur-md sm:gap-2 sm:px-4 sm:py-1.5">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
              </span>
              <span>
                Interactive Product Sandbox{" "}
                <span className="hidden min-[380px]:inline">&bull; Simulated Environment</span>
              </span>
            </div>
          </div>

          <h2 className="text-foreground mt-4 text-3xl font-extrabold tracking-tight drop-shadow-xs sm:text-4xl md:text-5xl lg:text-6xl">
            Experience the Calm Operational Shift
          </h2>

          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
            Compare the daily friction of 14 fragmented browser tabs against FlowPilot&apos;s
            autonomous, buffer-protected operating system in an interactive live sandbox.
          </p>
        </div>

        {/* 1. SIGNATURE CONTROL: DUAL-REALITY VISIONOS SWITCHER & COMPARISON */}
        <div className="mt-9 flex flex-col items-center justify-center gap-4">
          <div className="relative inline-flex w-full items-center justify-center sm:w-auto">
            {/* Ambient Backlight under the Switcher */}
            <div
              className={`pointer-events-none absolute -inset-1.5 rounded-2xl opacity-60 blur-lg transition-all duration-500 ${
                realityMode === "calm"
                  ? "bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-cyan-500/25"
                  : "bg-gradient-to-r from-rose-500/35 via-amber-500/25 to-red-500/35"
              }`}
              aria-hidden="true"
            />

            <div
              role="group"
              aria-label="Reality Mode Selection"
              className="relative mx-auto flex w-full flex-col items-center gap-2 rounded-2xl border border-neutral-300/80 bg-white/95 p-1.5 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl sm:inline-flex sm:w-auto sm:max-w-none sm:flex-row dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)_inset]"
            >
              {/* Option 1: Fragmented Chaos */}
              <button
                type="button"
                aria-pressed={realityMode === "chaos"}
                onClick={() => {
                  setRealityMode("chaos");
                  setBufferMinutes(0);
                }}
                className={`relative z-10 flex w-full items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-300 ease-out focus-visible:outline-hidden sm:flex-1 sm:justify-center sm:px-5 sm:py-3 sm:text-sm ${
                  realityMode === "chaos"
                    ? "text-white"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                {realityMode === "chaos" && (
                  <motion.div
                    layoutId="reality-switch-indicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 shadow-[0_4px_25px_rgba(244,63,94,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] ring-1 ring-white/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
                  />
                )}
                <span className="relative z-10 flex min-w-0 items-center gap-2">
                  <Flame
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                      realityMode === "chaos"
                        ? "scale-110 animate-pulse text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                        : "text-rose-500/80 group-hover:scale-105"
                    }`}
                  />
                  <span className="truncate">
                    <span className="lg:hidden">Chaos (14 Tabs)</span>
                    <span className="hidden lg:inline">
                      Fragmented Chaos (14 Tabs &amp; Collisions)
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap transition-all duration-300 sm:px-2.5 ${
                      realityMode === "chaos"
                        ? "border-amber-300/40 bg-black/30 text-amber-200 shadow-xs"
                        : "border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}
                  >
                    <span className="lg:hidden">14 Tabs</span>
                    <span className="hidden lg:inline">14 Tabs Scrambled</span>
                  </span>
                </span>
              </button>

              {/* Option 2: FlowPilot Calm OS */}
              <button
                type="button"
                aria-pressed={realityMode === "calm"}
                onClick={() => {
                  setRealityMode("calm");
                  setBufferMinutes(15);
                }}
                className={`relative z-10 flex w-full items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-300 ease-out focus-visible:outline-hidden sm:flex-1 sm:justify-center sm:px-5 sm:py-3 sm:text-sm ${
                  realityMode === "calm"
                    ? "text-white dark:text-neutral-950"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                {realityMode === "calm" && (
                  <motion.div
                    layoutId="reality-switch-indicator"
                    className="absolute inset-0 rounded-xl bg-neutral-950 shadow-[0_4px_30px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-emerald-500/50 dark:bg-white dark:ring-neutral-200"
                    transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
                  />
                )}
                <span className="relative z-10 flex min-w-0 items-center gap-2">
                  <Sparkles
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                      realityMode === "calm"
                        ? "scale-110 animate-spin text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] dark:text-emerald-600"
                        : "text-emerald-500 group-hover:scale-105"
                    }`}
                    style={{ animationDuration: "6s" }}
                  />
                  <span className="truncate">
                    <span className="lg:hidden">Calm OS (Unified)</span>
                    <span className="hidden lg:inline">FlowPilot Calm OS (Unified System)</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap transition-all duration-300 sm:px-2.5 ${
                      realityMode === "calm"
                        ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 dark:border-emerald-600/40 dark:bg-emerald-500/20 dark:text-emerald-700"
                        : "border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}
                  >
                    Calm Flow
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Operational Friction & Simulation Disclaimer */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <div className="border-border/80 bg-background/90 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border px-3 py-1 shadow-2xs backdrop-blur-md sm:px-4 sm:py-1.5">
              <span className="text-muted-foreground hidden font-medium min-[380px]:inline">
                Operational Friction:
              </span>
              <span
                className={`flex items-center gap-1.5 font-mono font-bold ${
                  realityMode === "calm"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    realityMode === "calm"
                      ? "animate-pulse bg-emerald-500"
                      : "animate-ping bg-rose-500"
                  }`}
                />
                {realityMode === "calm"
                  ? "Low Friction [Optimal Flow]"
                  : "High Friction [Critical Overload]"}
              </span>
              <span className="bg-border/60 hidden h-3 w-px sm:inline" />
              <span className="text-muted-foreground hidden sm:inline">
                {realityMode === "calm" ? "Zero overlap risk" : "High double-booking hazard"}
              </span>
            </div>

            <Badge
              variant="outline"
              className="border-border/60 bg-muted/40 text-muted-foreground px-2.5 py-0.5 text-[10px]"
            >
              Simulated Demo Data
            </Badge>
          </div>
        </div>

        {/* 2. DAY FLIGHT SCRUBBER TIMELINE */}
        <div className="relative mt-8 overflow-hidden rounded-2xl border border-neutral-200/90 bg-neutral-100/70 p-3 shadow-sm backdrop-blur-xl sm:p-4 dark:border-white/10 dark:bg-neutral-900/70">
          {/* Connected Laser Track background line */}
          <div className="via-primary/30 pointer-events-none absolute top-[34px] right-8 left-8 hidden h-[2px] -translate-y-1/2 bg-gradient-to-r from-transparent to-transparent sm:block" />

          <div className="relative flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
            {/* Timeline Nodes */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-muted-foreground flex shrink-0 items-center gap-1.5 pr-1 font-mono text-[11px] font-bold tracking-wider uppercase">
                <Clock className="text-primary h-3.5 w-3.5" />
                <span>Day Flight:</span>
              </span>
              {DAY_TIMELINE.map((item, idx) => {
                const isSelected = activeTimelineIndex === idx;
                return (
                  <button
                    key={item.time}
                    type="button"
                    onClick={() => handleSelectTimelineNode(idx)}
                    className={`relative inline-flex items-center gap-2 rounded-xl px-2.5 py-1 text-xs font-semibold transition-colors duration-200 focus-visible:outline-hidden sm:px-3 sm:py-1.5 ${
                      isSelected
                        ? "font-bold text-white dark:text-neutral-950"
                        : "text-muted-foreground hover:text-foreground hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="flight-timeline-indicator"
                        className="absolute inset-0 rounded-xl bg-neutral-900 shadow-md dark:bg-white"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5 font-mono text-[11px]">
                      {isSelected && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                      )}
                      {item.time}
                    </span>
                    <span className="relative z-10 hidden md:inline">&bull; {item.tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Play/Pause Day Simulator & Reset Control */}
            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
              <button
                type="button"
                onClick={() => setIsAutoPlaying((prev) => !prev)}
                className={`focus-visible:ring-primary inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-xs transition-all focus-visible:ring-2 focus-visible:outline-hidden sm:px-3.5 ${
                  isAutoPlaying
                    ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/30 dark:text-emerald-400"
                    : "border-border/80 bg-background text-foreground hover:bg-muted/70 hover:border-primary/40"
                }`}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
                    <span>Pause Flight</span>
                  </>
                ) : (
                  <>
                    <Play className="text-primary fill-primary/20 h-3.5 w-3.5" />
                    <span>Play 4D Flight</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetDemo}
                title="Reset simulation to initial state"
                className="border-border/80 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:border-primary/40 focus-visible:ring-primary inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium shadow-xs transition-all focus-visible:ring-2 focus-visible:outline-hidden"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Current Story Context Banner */}
          <div className="border-border/70 mt-3 flex flex-col justify-between gap-2 border-t pt-2.5 text-xs sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <span className="text-foreground shrink-0 font-bold">{activeDayPoint.title}:</span>
              <span className="text-muted-foreground line-clamp-2 min-w-0 flex-1 sm:line-clamp-none">
                {realityMode === "calm" ? activeDayPoint.calmSummary : activeDayPoint.chaosSummary}
              </span>
            </div>
            <span
              className={`shrink-0 self-start rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase sm:self-auto ${
                realityMode === "calm"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {realityMode === "calm" ? "Calm Flow" : "Friction Alert"}
            </span>
          </div>
        </div>

        {/* 3. REFINED MODERN CLASSIC BROWSER CHASSIS & COMMAND CONSOLE */}
        <div className="relative mx-auto mt-8 w-full max-w-5xl 2xl:max-w-6xl">
          {/* Subtle Ambient Glow behind Studio Window */}
          <div
            className={`pointer-events-none absolute -inset-1.5 rounded-[32px] opacity-40 blur-xl transition-all duration-500 ${
              realityMode === "calm"
                ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/20"
                : "bg-gradient-to-r from-rose-500/25 via-amber-500/20 to-orange-500/25"
            }`}
            aria-hidden="true"
          />

          {/* Main Studio Window Container */}
          <div
            className={`group/studio relative overflow-hidden rounded-3xl border transition-all duration-300 hover:border-neutral-400/90 dark:hover:border-white/20 ${
              realityMode === "chaos"
                ? "border-rose-500/40 bg-white/95 shadow-[0_25px_80px_-15px_rgba(244,63,94,0.15)] ring-2 ring-rose-500/30 hover:shadow-[0_35px_100px_-15px_rgba(244,63,94,0.25)] dark:border-rose-500/30 dark:bg-[#0c1220]/95 dark:shadow-[0_35px_100px_-20px_rgba(244,63,94,0.25)] dark:hover:shadow-[0_45px_120px_-20px_rgba(244,63,94,0.4)]"
                : "border-neutral-300/80 bg-white/95 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.9)_inset] hover:shadow-[0_35px_100px_-15px_rgba(0,0,0,0.14),0_0_0_1px_rgba(255,255,255,1)_inset] dark:border-white/10 dark:bg-[#0c1220]/95 dark:shadow-[0_35px_100px_-20px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)_inset] dark:hover:shadow-[0_45px_120px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.1)_inset]"
            }`}
          >
            {/* Top Specular Rim */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent dark:via-white/25" />

            {/* Desktop Modern Classic Titlebar / Omnibar Chrome */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-neutral-200/80 bg-neutral-100/80 px-3.5 py-2.5 backdrop-blur-xl sm:gap-3 sm:px-5 sm:py-3 dark:border-white/10 dark:bg-neutral-900/80">
              {/* Genuine Mac Traffic Light Controls with Specular Rims & Hover Glyphs */}
              <div className="flex shrink-0 items-center gap-2" aria-hidden="true">
                <span className="group flex h-3 w-3 items-center justify-center rounded-full border border-[#e0443e] bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.6)]">
                  <X className="h-2 w-2 text-black/70 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="group flex h-3 w-3 items-center justify-center rounded-full border border-[#dea123] bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.6)]">
                  <Minus className="h-2 w-2 text-black/70 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="group flex h-3 w-3 items-center justify-center rounded-full border border-[#1aab29] bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.6)]">
                  <Maximize2 className="h-2 w-2 text-black/70 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="ml-2 hidden text-[11px] font-semibold tracking-wider text-neutral-400 uppercase sm:inline dark:text-neutral-500">
                  FlowPilot OS Studio
                </span>
              </div>

              {/* Secure App Omnibar / URL Capsule */}
              <div className="order-3 flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300/80 bg-white/90 px-3 py-1 text-xs shadow-inner sm:order-2 sm:w-auto sm:max-w-md sm:flex-1 sm:px-4 sm:py-1.5 dark:border-white/10 dark:bg-neutral-950/90">
                {realityMode === "calm" ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Lock className="h-3 w-3 shrink-0" />
                    <span className="hidden font-mono text-[10px] font-semibold uppercase sm:inline">
                      TLS 1.3
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 animate-pulse drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                    <span className="hidden font-mono text-[10px] font-semibold uppercase sm:inline">
                      UNSECURED
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 truncate font-mono text-[11px] sm:text-xs">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    flowpilot.cloud
                  </span>
                  <span className="text-neutral-400 dark:text-neutral-600">/sandbox/</span>
                  <span
                    className={`font-semibold ${
                      realityMode === "calm"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    #{activeTab}
                  </span>
                </div>
                <kbd className="ml-1.5 hidden rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[9px] font-medium text-neutral-500 sm:inline dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                  ⌘K
                </kbd>
              </div>

              {/* Status Pod with Live Latency Indicator */}
              <div className="order-2 flex shrink-0 items-center gap-2 sm:order-3">
                <div
                  className={`group/pod flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-2xs transition-all duration-300 hover:scale-[1.03] sm:px-3 ${
                    realityMode === "calm"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] dark:text-emerald-300"
                      : "border-rose-500/40 bg-rose-500/15 text-rose-700 hover:border-rose-500/60 hover:shadow-[0_0_18px_rgba(244,63,94,0.3)] dark:text-rose-300"
                  }`}
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span
                      className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        realityMode === "calm"
                          ? "animate-ping bg-emerald-400"
                          : "animate-ping bg-rose-400"
                      }`}
                    />
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${
                        realityMode === "calm" ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                  </span>
                  <span className="font-mono font-semibold">
                    <span className="sm:hidden">
                      {realityMode === "calm" ? "Sandboxed" : "4 Conflicts"}
                    </span>
                    <span className="hidden sm:inline">
                      {realityMode === "calm"
                        ? "Connected • Sandboxed"
                        : "4 Sync Conflicts • 14 Tabs"}
                    </span>
                  </span>
                  <span className="hidden text-neutral-400 sm:inline dark:text-neutral-600">|</span>
                  <span className="hidden font-mono text-[10px] text-neutral-500 sm:inline dark:text-neutral-400">
                    {realityMode === "calm" ? "8ms (P99)" : "42.8d DSO"}
                  </span>
                </div>
              </div>
            </div>

            {/* Window Interior: Left Nav Rail + Center Reality Stage */}
            <div className="flex flex-col md:flex-row">
              {/* Left Navigation Rail */}
              <aside
                className="border-border/70 bg-muted/20 flex shrink-0 border-b p-2 md:w-60 md:flex-col md:justify-between md:border-r md:border-b-0 md:p-3.5"
                role="tablist"
                aria-label="FlowPilot Interactive Modules"
              >
                <div className="flex w-full flex-row gap-1.5 md:flex-col">
                  {/* Scheduling Tab */}
                  <button
                    type="button"
                    role="tab"
                    id="preview-tab-scheduling"
                    aria-controls="preview-panel-scheduling"
                    aria-selected={activeTab === "scheduling"}
                    tabIndex={activeTab === "scheduling" ? 0 : -1}
                    onKeyDown={(e) => handleTabKeyDown(e, "scheduling")}
                    onClick={() => {
                      setActiveTab("scheduling");
                      setActiveTimelineIndex(0);
                      setIsAutoPlaying(false);
                    }}
                    className={`focus-visible:ring-primary relative flex flex-1 items-center justify-center gap-3 rounded-xl px-2 py-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:outline-hidden md:flex-none md:justify-start md:px-3 md:py-2.5 ${
                      activeTab === "scheduling"
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                    }`}
                  >
                    {activeTab === "scheduling" && (
                      <motion.div
                        layoutId="studio-rail-pill"
                        className="absolute inset-0 rounded-xl border border-neutral-300/80 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:border-white/15 dark:bg-neutral-800/90 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/25 bg-blue-500/10 text-blue-600 shadow-2xs dark:text-blue-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="relative z-10 hidden text-left md:block">
                      <p className="leading-tight font-semibold">Schedule &amp; Buffers</p>
                      <p className="text-muted-foreground font-mono text-[10px]">
                        {realityMode === "calm" ? "0 Collisions" : "Collision Hazard"}
                      </p>
                    </div>
                  </button>

                  {/* CRM Tab */}
                  <button
                    type="button"
                    role="tab"
                    id="preview-tab-crm"
                    aria-controls="preview-panel-crm"
                    aria-selected={activeTab === "crm"}
                    tabIndex={activeTab === "crm" ? 0 : -1}
                    onKeyDown={(e) => handleTabKeyDown(e, "crm")}
                    onClick={() => {
                      setActiveTab("crm");
                      setActiveTimelineIndex(1);
                      setIsAutoPlaying(false);
                    }}
                    className={`focus-visible:ring-primary relative flex flex-1 items-center justify-center gap-3 rounded-xl px-2 py-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:outline-hidden md:flex-none md:justify-start md:px-3 md:py-2.5 ${
                      activeTab === "crm"
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                    }`}
                  >
                    {activeTab === "crm" && (
                      <motion.div
                        layoutId="studio-rail-pill"
                        className="absolute inset-0 rounded-xl border border-neutral-300/80 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:border-white/15 dark:bg-neutral-800/90 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 shadow-2xs dark:text-emerald-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="relative z-10 hidden text-left md:block">
                      <p className="leading-tight font-semibold">Client 360° Dossier</p>
                      <p className="text-muted-foreground font-mono text-[10px]">
                        {realityMode === "calm" ? "98% Health Radar" : "Scattered Sheets"}
                      </p>
                    </div>
                  </button>

                  {/* Invoicing Tab */}
                  <button
                    type="button"
                    role="tab"
                    id="preview-tab-invoicing"
                    aria-controls="preview-panel-invoicing"
                    aria-selected={activeTab === "invoicing"}
                    tabIndex={activeTab === "invoicing" ? 0 : -1}
                    onKeyDown={(e) => handleTabKeyDown(e, "invoicing")}
                    onClick={() => {
                      setActiveTab("invoicing");
                      setActiveTimelineIndex(3);
                      setIsAutoPlaying(false);
                    }}
                    className={`focus-visible:ring-primary relative flex flex-1 items-center justify-center gap-3 rounded-xl px-2 py-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:outline-hidden md:flex-none md:justify-start md:px-3 md:py-2.5 ${
                      activeTab === "invoicing"
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                    }`}
                  >
                    {activeTab === "invoicing" && (
                      <motion.div
                        layoutId="studio-rail-pill"
                        className="absolute inset-0 rounded-xl border border-neutral-300/80 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:border-white/15 dark:bg-neutral-800/90 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-600 shadow-2xs dark:text-amber-400">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="relative z-10 hidden text-left md:block">
                      <p className="leading-tight font-semibold">Treasury &amp; Invoices</p>
                      <p className="text-muted-foreground font-mono text-[10px]">
                        {realityMode === "calm" ? "Stripe 1-Click" : "42 Days Overdue"}
                      </p>
                    </div>
                  </button>

                  {/* Security Tab */}
                  <button
                    type="button"
                    role="tab"
                    id="preview-tab-security"
                    aria-controls="preview-panel-security"
                    aria-selected={activeTab === "security"}
                    tabIndex={activeTab === "security" ? 0 : -1}
                    onKeyDown={(e) => handleTabKeyDown(e, "security")}
                    onClick={() => {
                      setActiveTab("security");
                      setActiveTimelineIndex(2);
                      setIsAutoPlaying(false);
                    }}
                    className={`focus-visible:ring-primary relative flex flex-1 items-center justify-center gap-3 rounded-xl px-2 py-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:outline-hidden md:flex-none md:justify-start md:px-3 md:py-2.5 ${
                      activeTab === "security"
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                    }`}
                  >
                    {activeTab === "security" && (
                      <motion.div
                        layoutId="studio-rail-pill"
                        className="absolute inset-0 rounded-xl border border-neutral-300/80 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:border-white/15 dark:bg-neutral-800/90 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/25 bg-purple-500/10 text-purple-600 shadow-2xs dark:text-purple-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div className="relative z-10 hidden text-left md:block">
                      <p className="leading-tight font-semibold">Tenant Boundary</p>
                      <p className="text-muted-foreground font-mono text-[10px]">
                        {realityMode === "calm" ? "Org Scoped Guard" : "Unsecured Link"}
                      </p>
                    </div>
                  </button>
                </div>

                {/* Sidebar Bottom Telemetry Widget */}
                <div className="border-border/70 hidden border-t pt-3.5 md:block">
                  <div className="border-border/70 bg-background/90 rounded-xl border p-3 text-[11px] shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                        <span className="relative flex h-2 w-2">
                          <span
                            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              realityMode === "calm"
                                ? "animate-ping bg-emerald-400"
                                : "animate-ping bg-rose-400"
                            }`}
                          />
                          <span
                            className={`relative inline-flex h-2 w-2 rounded-full ${
                              realityMode === "calm" ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                        </span>
                        <span>State Engine:</span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          realityMode === "calm"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {realityMode === "calm" ? "CALM_SYNCED" : "CHAOS_OVERLOAD"}
                      </span>
                    </div>
                    <div className="text-muted-foreground border-border/50 mt-2 flex items-center justify-between border-t pt-2">
                      <span>DSO Velocity:</span>
                      <span className="text-foreground font-mono font-bold">
                        {realityMode === "calm" ? "Instant (0d)" : "42.8 Days"}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Center Reality Stage */}
              <div
                role="tabpanel"
                id={`preview-panel-${activeTab}`}
                aria-labelledby={`preview-tab-${activeTab}`}
                tabIndex={0}
                className="min-h-[540px] flex-1 border-t border-neutral-200/70 bg-neutral-50/70 p-4 focus-visible:outline-hidden sm:p-6 md:border-t-0 md:border-l dark:border-white/5 dark:bg-[#070b14]/70"
              >
                <AnimatePresence mode="wait">
                  {/* TAB 1: SCHEDULING (CALM VS CHAOS) */}
                  {activeTab === "scheduling" && (
                    <motion.div
                      key={`scheduling-${realityMode}`}
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      {realityMode === "calm" ? (
                        <>
                          {/* Top Bar with Buffer Controls */}
                          <div className="border-border/70 flex flex-col gap-3 border-b pb-3.5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-extrabold sm:text-lg">
                                  Dynamic Buffer Timeline &amp; Capacity Engine
                                </h3>
                                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  0 Collisions Guaranteed
                                </span>
                              </div>
                              <p className="text-muted-foreground text-xs">
                                Adjust the buffer below. FlowPilot automatically shifts downstream
                                meetings to prevent double-booking.
                              </p>
                            </div>

                            {/* Dynamic Buffer Interval Switcher */}
                            <div className="border-border/70 bg-muted/60 flex items-center gap-2 rounded-xl border p-1 shadow-2xs">
                              <span className="text-muted-foreground pl-1 text-[11px] font-semibold">
                                Buffer Gap:
                              </span>
                              <div className="relative inline-flex rounded-lg bg-neutral-200/80 p-0.5 shadow-inner dark:bg-neutral-800/80">
                                {([0, 15, 30] as const).map((mins) => {
                                  const isSel = bufferMinutes === mins;
                                  return (
                                    <button
                                      key={mins}
                                      type="button"
                                      onClick={() => setBufferMinutes(mins)}
                                      className={`relative z-10 rounded-md px-3 py-1 text-xs font-semibold transition-colors duration-150 focus-visible:outline-hidden ${
                                        isSel
                                          ? mins === 0
                                            ? "font-bold text-white"
                                            : "font-bold text-white dark:text-neutral-950"
                                          : "text-muted-foreground hover:text-foreground"
                                      }`}
                                    >
                                      {isSel && (
                                        <motion.div
                                          layoutId="buffer-gap-indicator"
                                          className={`absolute inset-0 rounded-md shadow-xs ${
                                            mins === 0
                                              ? "bg-rose-500"
                                              : "bg-neutral-900 dark:bg-white"
                                          }`}
                                          transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 35,
                                          }}
                                        />
                                      )}
                                      <span className="relative z-10">{mins}m</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Meeting Card 1 */}
                          <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-gradient-to-br from-white via-neutral-50/90 to-neutral-100/60 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.008] hover:border-blue-500/40 hover:shadow-[0_16px_40px_rgba(37,99,235,0.12)] sm:p-4.5 dark:border-white/10 dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950/90 dark:shadow-[0_4px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-blue-500/40">
                            {/* Specular Top Rim */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
                                <div className="text-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-300/80 bg-gradient-to-br from-neutral-100 to-neutral-200 font-mono text-xs font-bold shadow-xs sm:h-11 sm:w-11 dark:border-white/10 dark:from-neutral-800 dark:to-neutral-900">
                                  09:00
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <h4 className="truncate text-sm font-bold tracking-tight">
                                      Enterprise Strategic Briefing
                                    </h4>
                                    <span className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                      Confirmed
                                    </span>
                                  </div>
                                  <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                                    <span className="truncate">
                                      Client:{" "}
                                      <strong className="text-foreground font-semibold">
                                        Apex Solutions Inc.
                                      </strong>
                                    </span>
                                    <span>&bull;</span>
                                    <span>Lead: Sarah Chen</span>
                                    <span>&bull;</span>
                                    <div className="inline-flex -space-x-1.5 overflow-hidden">
                                      <span className="ring-background inline-block h-4 w-4 rounded-full bg-emerald-500 text-center text-[9px] leading-4 font-bold text-white ring-1">
                                        SC
                                      </span>
                                      <span className="ring-background inline-block h-4 w-4 rounded-full bg-blue-500 text-center text-[9px] leading-4 font-bold text-white ring-1">
                                        AV
                                      </span>
                                      <span className="ring-background inline-block h-4 w-4 rounded-full bg-indigo-500 text-center text-[9px] leading-4 font-bold text-white ring-1">
                                        MV
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-2 self-start rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-blue-600 shadow-2xs sm:self-center dark:text-blue-400">
                                <Video className="h-3.5 w-3.5" />
                                <span>09:00 AM – 10:00 AM</span>
                              </div>
                            </div>
                          </div>

                          {/* DYNAMIC BUFFER GAP SHIELD */}
                          <motion.div
                            layout={!shouldReduceMotion}
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                            className={`relative flex flex-col justify-between gap-2.5 rounded-2xl border p-3 shadow-md transition-all duration-300 hover:scale-[1.008] sm:flex-row sm:items-center sm:px-4.5 sm:py-3 ${
                              bufferMinutes === 0
                                ? "border-rose-500/50 bg-gradient-to-r from-rose-500/15 via-red-500/10 to-rose-500/15 text-rose-700 shadow-[0_0_20px_rgba(244,63,94,0.18)] ring-1 ring-rose-500/30 dark:text-rose-300"
                                : bufferMinutes === 15
                                  ? "border-emerald-500/50 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 text-emerald-800 shadow-[0_0_20px_rgba(16,185,129,0.18)] ring-1 ring-emerald-500/30 dark:text-emerald-300"
                                  : "border-blue-500/50 bg-gradient-to-r from-blue-500/15 via-cyan-500/10 to-blue-500/15 text-blue-800 shadow-[0_0_20px_rgba(59,130,246,0.18)] ring-1 ring-blue-500/30 dark:text-blue-300"
                            }`}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-2.5 text-xs font-semibold sm:gap-3">
                              {bufferMinutes === 0 ? (
                                <AlertTriangle className="h-4 w-4 shrink-0 animate-bounce text-rose-500" />
                              ) : (
                                <Coffee className="h-4 w-4 shrink-0 text-emerald-500" />
                              )}
                              <span className="leading-snug">
                                {bufferMinutes === 0 &&
                                  "Hazard Alert: 0m Buffer (Back-to-back overlap risk. No note synthesis window)."}
                                {bufferMinutes === 15 &&
                                  "Protected Buffer (+15m): Automatic rest, note capture & coffee break."}
                                {bufferMinutes === 30 &&
                                  "Extended Buffer (+30m): Deep prep & strategic focus transition window."}
                              </span>
                            </div>
                            <span className="bg-background/90 text-foreground border-border/80 shrink-0 self-start rounded-xl border px-2.5 py-1 font-mono text-[10.5px] font-bold shadow-xs sm:self-auto sm:px-3">
                              {bufferMinutes === 0
                                ? "0m Gap"
                                : bufferMinutes === 15
                                  ? "10:00 – 10:15 AM (+15m)"
                                  : "10:00 – 10:30 AM (+30m)"}
                            </span>
                          </motion.div>

                          {/* Meeting Card 2 (Dynamically shifts start time based on buffer) */}
                          <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-gradient-to-br from-white via-neutral-50/90 to-neutral-100/60 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.008] hover:border-emerald-500/40 hover:shadow-[0_16px_40px_rgba(16,185,129,0.12)] sm:p-4.5 dark:border-white/10 dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950/90 dark:shadow-[0_4px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-emerald-500/40">
                            {/* Specular Top Rim */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
                                <div className="text-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-300/80 bg-gradient-to-br from-neutral-100 to-neutral-200 font-mono text-xs font-bold shadow-xs sm:h-11 sm:w-11 dark:border-white/10 dark:from-neutral-800 dark:to-neutral-900">
                                  {bufferMinutes === 0
                                    ? "10:00"
                                    : bufferMinutes === 15
                                      ? "10:15"
                                      : "10:30"}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <h4 className="truncate text-sm font-bold tracking-tight">
                                      Milestone Architecture Delivery
                                    </h4>
                                    <span className="border-border/80 bg-muted/80 text-muted-foreground shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold">
                                      Protected in Queue
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground mt-1 truncate text-xs">
                                    Client:{" "}
                                    <strong className="text-foreground font-semibold">
                                      Meridian Health Group
                                    </strong>{" "}
                                    &bull; Lead: Marcus Vance &bull; Duration: 45 min
                                  </p>
                                </div>
                              </div>

                              <div className="border-border/80 bg-muted/60 text-muted-foreground flex shrink-0 items-center gap-2 self-start rounded-lg border px-2.5 py-1 font-mono text-xs font-medium shadow-2xs sm:self-center">
                                <Clock className="text-foreground h-3.5 w-3.5" />
                                <span className="text-foreground font-semibold">
                                  {bufferMinutes === 0 && "10:00 AM – 10:45 AM"}
                                  {bufferMinutes === 15 && "10:15 AM – 11:00 AM"}
                                  {bufferMinutes === 30 && "10:30 AM – 11:15 AM"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* SCHEDULING CHAOS VIEW */
                        <div className="space-y-4">
                          {/* Disconnected Tool Strip */}
                          <div className="flex w-full max-w-full scrollbar-none items-center gap-2 overflow-x-auto rounded-xl border border-rose-500/30 bg-rose-500/[0.04] p-1.5 backdrop-blur-md">
                            <div className="flex shrink-0 items-center gap-1.5 text-xs font-semibold">
                              <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/50 bg-white/95 px-3 py-1.5 text-xs font-bold text-rose-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-900 dark:text-rose-400">
                                <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-rose-500" />
                                <span>Calendly (Overlap Error)</span>
                              </div>
                              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-white/40 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:text-neutral-900 dark:border-white/5 dark:bg-neutral-800/40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
                                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                                <span>Google Calendar Direct</span>
                              </div>
                              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-white/40 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:text-neutral-900 dark:border-white/5 dark:bg-neutral-800/40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
                                <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                <span>Personal iCal</span>
                              </div>
                              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-white/40 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:text-neutral-900 dark:border-white/5 dark:bg-neutral-800/40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
                                <Mail className="h-3.5 w-3.5 text-neutral-400" />
                                <span>Slack DMs (#conflicts)</span>
                              </div>
                            </div>
                          </div>

                          {/* Failure Alert Card */}
                          <div className="group relative overflow-hidden rounded-2xl border border-rose-500/50 bg-gradient-to-br from-white via-rose-50/40 to-neutral-100/70 p-3.5 shadow-[0_4px_25px_rgba(244,63,94,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.008] hover:border-rose-500/70 hover:shadow-[0_20px_45px_rgba(244,63,94,0.22)] sm:p-4.5 dark:border-rose-500/40 dark:from-neutral-900/90 dark:via-rose-950/30 dark:to-neutral-950/90 dark:shadow-[0_4px_30px_rgba(244,63,94,0.15),inset_0_1px_0_rgba(255,255,255,0.08)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-3.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.25)] dark:text-rose-400">
                                  <AlertTriangle className="h-5 w-5 animate-bounce" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <h4 className="truncate text-sm font-extrabold text-neutral-900 sm:text-base dark:text-white">
                                      Scheduling Stack Failure: 0m Buffer Collision
                                    </h4>
                                    <span className="shrink-0 rounded-md border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                      45m Overlap
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                                    External Calendly allowed an unbuffered client booking directly
                                    during Sarah&apos;s review. Both clients were sent active Zoom
                                    links for overlapping times.
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 self-start sm:self-center">
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-bold text-rose-600 sm:px-3 dark:text-rose-400">
                                  <Flame className="h-3.5 w-3.5" />
                                  -$1,400 / mo Leakage
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Meeting Card 1 */}
                          <div className="group relative overflow-hidden rounded-2xl border border-rose-500/35 bg-gradient-to-br from-white via-neutral-50/90 to-rose-50/30 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.008] hover:border-rose-500/60 hover:shadow-[0_16px_40px_rgba(244,63,94,0.18)] sm:p-4.5 dark:border-rose-500/30 dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950/90 dark:shadow-[0_4px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 shadow-2xs sm:h-11 sm:w-11 dark:text-rose-400">
                                  <Calendar className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <h4 className="truncate text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
                                      Apex Solutions &bull; Strategic Briefing
                                    </h4>
                                    <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                      Booked via Calendly
                                    </span>
                                  </div>
                                  <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                                    Lead: Sarah Chen &bull; Booked via Calendly URL &bull; 45 min
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-center">
                                <span className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                                  10:00 AM – 10:45 AM
                                </span>
                                <span className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                  <span className="h-2 w-2 animate-ping rounded-full bg-amber-500" />
                                  Waiting in Empty Zoom
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Collision Warning Ribbon */}
                          <div className="group relative overflow-hidden rounded-xl border border-rose-500/80 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 p-3 text-xs font-bold text-white shadow-[0_6px_25px_rgba(244,63,94,0.35)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_10px_35px_rgba(244,63,94,0.45)] sm:p-3.5">
                            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                            <div className="relative z-10 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                              <div className="flex min-w-0 flex-1 items-center gap-2">
                                <Flame className="h-4 w-4 shrink-0 animate-pulse text-amber-200" />
                                <span className="leading-tight">
                                  COLLISION: Meeting 2 was scheduled at 10:15 AM (0m Buffer Overlap)
                                </span>
                              </div>
                              <span className="shrink-0 self-start rounded-md border border-white/30 bg-black/30 px-2.5 py-0.5 font-mono text-[10.5px] font-extrabold tracking-wider text-amber-200 uppercase backdrop-blur-xs sm:self-auto">
                                45 min Overlap
                              </span>
                            </div>
                          </div>

                          {/* Meeting Card 2 */}
                          <div className="group relative overflow-hidden rounded-2xl border border-rose-500/40 bg-gradient-to-br from-white via-neutral-50/90 to-rose-50/30 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.008] hover:border-rose-500/60 hover:shadow-[0_16px_40px_rgba(244,63,94,0.18)] sm:p-4.5 dark:border-rose-500/30 dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950/90 dark:shadow-[0_4px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 shadow-2xs sm:h-11 sm:w-11 dark:text-rose-400">
                                  <Calendar className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <h4 className="truncate text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
                                      Meridian Health &bull; Architecture Milestone Review
                                    </h4>
                                    <span className="shrink-0 rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                                      Google Calendar Direct
                                    </span>
                                  </div>
                                  <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                                    Lead: Sarah Chen &bull; Google Calendar Direct Invite &bull; 45
                                    min
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-center">
                                <span className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                                  10:15 AM – 11:00 AM
                                </span>
                                <span className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/15 px-2 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                                  <AlertCircle className="h-3.5 w-3.5 animate-pulse text-rose-500" />
                                  Double-Booked Overlap
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 2: CRM DOSSIER (CALM VS CHAOS) */}
                  {activeTab === "crm" && (
                    <motion.div
                      key={`crm-${realityMode}`}
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      {realityMode === "calm" ? (
                        <>
                          <div className="border-border/70 flex flex-col gap-3 border-b pb-3.5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-extrabold sm:text-lg">
                                  Client Relationship Dossier &amp; Health Intelligence
                                </h3>
                                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  Active Dossier
                                </span>
                              </div>
                              <p className="text-muted-foreground text-xs">
                                Unified account memory: LTV metrics, health radar, and verified
                                engagement timelines.
                              </p>
                            </div>

                            {/* Client Selector Segmented Pills */}
                            <div className="border-border/80 bg-muted/60 relative inline-flex max-w-full scrollbar-none overflow-x-auto rounded-xl border p-1 shadow-2xs">
                              {(["apex", "meridian", "kinetic"] as const).map((key) => {
                                const labels = {
                                  apex: "Apex Solutions",
                                  meridian: "Meridian Health",
                                  kinetic: "Kinetic Labs",
                                };
                                const isSel = selectedClient === key;
                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSelectedClient(key)}
                                    className={`relative z-10 shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors duration-150 focus-visible:outline-hidden sm:px-3 ${
                                      isSel
                                        ? "font-bold text-white dark:text-neutral-950"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    {isSel && (
                                      <motion.div
                                        layoutId="crm-client-indicator"
                                        className="absolute inset-0 rounded-lg bg-neutral-900 shadow-xs dark:bg-white"
                                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                                      />
                                    )}
                                    <span className="relative z-10">{labels[key]}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Dossier Grid */}
                          <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-3">
                            {/* Circular Health Dial */}
                            <div className="group relative flex flex-col items-center justify-between overflow-hidden rounded-2xl border border-neutral-200/90 bg-gradient-to-br from-white via-neutral-50/90 to-neutral-100/60 p-3.5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] hover:border-emerald-500/40 hover:shadow-[0_16px_40px_rgba(16,185,129,0.14)] sm:p-4.5 dark:border-white/10 dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950/90 dark:shadow-[0_4px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-emerald-500/40">
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

                              <p className="text-muted-foreground font-mono text-[10.5px] font-bold tracking-wider uppercase">
                                Relationship Health Radar
                              </p>

                              <div className="relative my-2.5 flex items-center justify-center">
                                <svg
                                  className="h-28 w-28 -rotate-90 transform drop-shadow-[0_0_8px_rgba(16,185,129,0.25)]"
                                  viewBox="0 0 100 100"
                                >
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    className="stroke-muted/50"
                                    strokeWidth="7"
                                    fill="transparent"
                                  />
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    className="stroke-emerald-500 transition-all duration-500"
                                    strokeWidth="7"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={
                                      selectedClient === "apex"
                                        ? "5"
                                        : selectedClient === "meridian"
                                          ? "15"
                                          : "3"
                                    }
                                    strokeLinecap="round"
                                    fill="transparent"
                                  />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                  <span className="text-2xl font-extrabold tracking-tight">
                                    {selectedClient === "apex"
                                      ? "98%"
                                      : selectedClient === "meridian"
                                        ? "94%"
                                        : "99%"}
                                  </span>
                                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2 py-0.5 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                    Exceptional
                                  </span>
                                </div>
                              </div>

                              <div className="border-border/70 bg-muted/40 text-muted-foreground rounded-xl border px-3 py-1 text-xs font-medium">
                                Avg Response: <strong className="text-foreground">12 min</strong>{" "}
                                &bull; 0 Escalations
                              </div>
                            </div>

                            {/* 6-Month Retainer Growth */}
                            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/90 bg-gradient-to-br from-white via-neutral-50/90 to-neutral-100/60 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] hover:border-blue-500/40 hover:shadow-[0_16px_40px_rgba(37,99,235,0.14)] sm:p-4.5 dark:border-white/10 dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950/90 dark:shadow-[0_4px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-blue-500/40">
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

                              <div>
                                <p className="text-muted-foreground font-mono text-[10.5px] font-bold tracking-wider uppercase">
                                  6-Month Retainer Growth
                                </p>
                                <div className="mt-1 flex items-baseline gap-2">
                                  <span className="text-foreground font-mono text-xl font-extrabold tracking-tight">
                                    <AnimatedAmount
                                      amountUsd={
                                        selectedClient === "apex"
                                          ? 34850
                                          : selectedClient === "meridian"
                                            ? 52400
                                            : 14200
                                      }
                                      currency={currency}
                                    />
                                  </span>
                                  <span className="rounded-full border border-emerald-500/25 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    +22.4% YoY
                                  </span>
                                </div>
                              </div>

                              <div className="my-2 h-16 w-full">
                                <svg
                                  className="h-full w-full overflow-visible"
                                  viewBox="0 0 200 60"
                                  preserveAspectRatio="none"
                                >
                                  <defs>
                                    <linearGradient
                                      id="sparklineGradCrm"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop offset="0%" stopColor="#315fe8" stopOpacity="0.4" />
                                      <stop offset="100%" stopColor="#315fe8" stopOpacity="0.0" />
                                    </linearGradient>
                                  </defs>
                                  <path
                                    d="M0,50 Q40,40 70,32 T140,20 T200,8 L200,60 L0,60 Z"
                                    fill="url(#sparklineGradCrm)"
                                  />
                                  <path
                                    d="M0,50 Q40,40 70,32 T140,20 T200,8"
                                    fill="none"
                                    stroke="#315fe8"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                  />
                                  <circle
                                    cx="200"
                                    cy="8"
                                    r="4.5"
                                    fill="#315fe8"
                                    className="animate-pulse shadow-sm"
                                  />
                                </svg>
                              </div>

                              <div className="border-border/60 text-muted-foreground flex justify-between border-t pt-2 font-mono text-[10.5px]">
                                <span>Apr: 20 hrs</span>
                                <span>Sep: 45 hrs (Peak)</span>
                              </div>
                            </div>

                            {/* Contract Tier & Governance */}
                            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/90 bg-gradient-to-br from-white via-neutral-50/90 to-neutral-100/60 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] hover:border-purple-500/40 hover:shadow-[0_16px_40px_rgba(168,85,247,0.14)] sm:p-4.5 dark:border-white/10 dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950/90 dark:shadow-[0_4px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-purple-500/40">
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

                              <div>
                                <div className="flex items-center justify-between">
                                  <p className="text-muted-foreground font-mono text-[10.5px] font-bold tracking-wider uppercase">
                                    Contract Tier
                                  </p>
                                  <span className="border-border/70 bg-muted/80 text-foreground rounded-lg border px-2.5 py-0.5 text-[10px] font-bold">
                                    Retainer Tier 1
                                  </span>
                                </div>

                                <div className="mt-3 space-y-2 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Primary Contact:</span>
                                    <span className="text-foreground font-semibold">
                                      Alex Vance (COO)
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Account Lead:</span>
                                    <span className="text-foreground font-bold">
                                      {selectedClient === "apex"
                                        ? "Sarah Chen"
                                        : selectedClient === "meridian"
                                          ? "Marcus Vance"
                                          : "Elena Rostova"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Renewal Date:</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                      Auto-renews Q4
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="border-border/60 mt-3 flex gap-2 border-t pt-2.5">
                                <button
                                  type="button"
                                  className="w-full cursor-pointer rounded-xl bg-neutral-900 py-2 text-xs font-bold text-white shadow-xs transition-all hover:scale-[1.02] hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
                                >
                                  Book Session
                                </button>
                                <button
                                  type="button"
                                  className="border-border/80 bg-muted/60 hover:bg-muted text-foreground w-full cursor-pointer rounded-xl border py-2 text-xs font-semibold transition-all hover:scale-[1.02]"
                                >
                                  View Ledger
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* CRM CHAOS VIEW */
                        <div className="space-y-4">
                          {/* Disconnected Tool Strip */}
                          <div className="flex w-full max-w-full scrollbar-none items-center gap-2 overflow-x-auto rounded-xl border border-rose-500/30 bg-rose-500/[0.04] p-1.5 backdrop-blur-md">
                            <div className="flex shrink-0 items-center gap-1.5 text-xs font-semibold">
                              <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/50 bg-white/95 px-3 py-1.5 text-xs font-bold text-rose-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-900 dark:text-rose-400">
                                <FileSpreadsheet className="h-3.5 w-3.5 animate-pulse text-rose-500" />
                                <span>Google Sheets (v4_FINAL_notes.xlsx)</span>
                              </div>
                              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-white/40 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:text-neutral-900 dark:border-white/5 dark:bg-neutral-800/40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
                                <Users className="h-3.5 w-3.5 text-neutral-400" />
                                <span>Notion Client Portal</span>
                              </div>
                              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-white/40 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:text-neutral-900 dark:border-white/5 dark:bg-neutral-800/40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
                                <Database className="h-3.5 w-3.5 text-neutral-400" />
                                <span>Dropbox Contract.pdf</span>
                              </div>
                              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-white/40 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:text-neutral-900 dark:border-white/5 dark:bg-neutral-800/40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
                                <Mail className="h-3.5 w-3.5 text-neutral-400" />
                                <span>Gmail Thread (24 Unread)</span>
                              </div>
                            </div>
                          </div>

                          {/* Failure Alert Card */}
                          <div className="group relative overflow-hidden rounded-2xl border border-rose-500/50 bg-gradient-to-br from-white via-rose-50/40 to-neutral-100/70 p-3.5 shadow-[0_4px_25px_rgba(244,63,94,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.008] hover:border-rose-500/70 hover:shadow-[0_20px_45px_rgba(244,63,94,0.22)] sm:p-4.5 dark:border-rose-500/40 dark:from-neutral-900/90 dark:via-rose-950/30 dark:to-neutral-950/90 dark:shadow-[0_4px_30px_rgba(244,63,94,0.15),inset_0_1px_0_rgba(255,255,255,0.08)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-3.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.25)] dark:text-rose-400">
                                  <FileSpreadsheet className="h-5 w-5 animate-bounce" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <h4 className="truncate text-sm font-extrabold text-neutral-900 sm:text-base dark:text-white">
                                      Fragmented Client Memory: Scattered Across 4 Tools
                                    </h4>
                                    <span className="shrink-0 rounded-md border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                      Zero Sync
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                                    Account leads cannot find the signed scope of work or latest
                                    hourly rate. Client notes live in personal Apple Notes, while
                                    billing deliverables remain untracked.
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 self-start sm:self-center">
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-bold text-rose-600 sm:px-3 dark:text-rose-400">
                                  <AlertCircle className="h-3.5 w-3.5" />3 Untracked SOWs
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 2 Diagnostic Risk Cards */}
                          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                            <div className="group relative overflow-hidden rounded-2xl border border-rose-500/35 bg-gradient-to-br from-white via-neutral-50/90 to-rose-50/30 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] hover:border-rose-500/60 hover:shadow-[0_16px_40px_rgba(244,63,94,0.18)] sm:p-4.5 dark:border-rose-500/30 dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950/90 dark:shadow-[0_4px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
                              <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  <span className="truncate font-bold text-neutral-900 dark:text-white">
                                    Spreadsheet Billing Error
                                  </span>
                                  <span className="shrink-0 rounded-full border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                    #REF!
                                  </span>
                                </div>
                                <span className="shrink-0 font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                                  -$1,000 Loss
                                </span>
                              </div>
                              <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                                Cell C14 shows{" "}
                                <code className="rounded bg-rose-500/10 px-1 py-0.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                                  #REF!
                                </code>{" "}
                                for Apex Solutions hourly billing. Invoice was generated at an
                                outdated $125/hr instead of the agreed $175/hr.
                              </p>
                              <div className="mt-3.5 flex items-center justify-between border-t border-rose-500/20 pt-2 text-[11px]">
                                <span className="font-mono text-neutral-400">Formula Broken</span>
                                <span className="font-semibold text-rose-600 dark:text-rose-400">
                                  Requires Manual Audit
                                </span>
                              </div>
                            </div>

                            <div className="group relative overflow-hidden rounded-2xl border border-rose-500/35 bg-gradient-to-br from-white via-neutral-50/90 to-rose-50/30 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] hover:border-rose-500/60 hover:shadow-[0_16px_40px_rgba(244,63,94,0.18)] sm:p-4.5 dark:border-rose-500/30 dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950/90 dark:shadow-[0_4px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                              <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  <span className="truncate font-bold text-neutral-900 dark:text-white">
                                    Lost Meeting Context
                                  </span>
                                  <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                    Missing Notes
                                  </span>
                                </div>
                                <span className="shrink-0 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                                  Blind Call
                                </span>
                              </div>
                              <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                                Sarah Chen joins consultation with zero briefing history. Alex Vance
                                mentions previous email commitments that nobody on the team has
                                logged.
                              </p>
                              <div className="mt-3.5 flex items-center justify-between border-t border-amber-500/20 pt-2 text-[11px]">
                                <span className="font-mono text-neutral-400">
                                  Client Memory Zero
                                </span>
                                <span className="font-semibold text-amber-600 dark:text-amber-400">
                                  Trust At Risk
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 3: INVOICING & TREASURY (CALM VS CHAOS) */}
                  {activeTab === "invoicing" && (
                    <motion.div
                      key={`invoicing-${realityMode}`}
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      {realityMode === "calm" ? (
                        <>
                          {/* Top Bar with Currency Selector */}
                          <div className="border-border/70 flex flex-col gap-3 border-b pb-3.5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-extrabold sm:text-lg">
                                  Treasury Ledger &amp; Virtual Stripe POS Terminal
                                </h3>
                                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  Stripe Connect v2
                                </span>
                              </div>
                              <p className="text-muted-foreground text-xs">
                                Direct 1-click settlement from completed consultation hours into
                                Stripe Connect.
                              </p>
                            </div>

                            {/* 4-Currency Selector */}
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground font-mono text-xs font-semibold">
                                Currency:
                              </span>
                              <div className="border-border/80 bg-muted/60 relative inline-flex rounded-xl border p-1 shadow-2xs">
                                {(["USD", "EUR", "GBP", "BDT"] as const).map((curr) => {
                                  const isSel = currency === curr;
                                  return (
                                    <button
                                      key={curr}
                                      type="button"
                                      onClick={() => setCurrency(curr)}
                                      className={`relative z-10 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors duration-150 focus-visible:outline-hidden ${
                                        isSel
                                          ? "font-bold text-white dark:text-neutral-950"
                                          : "text-muted-foreground hover:text-foreground"
                                      }`}
                                    >
                                      {isSel && (
                                        <motion.div
                                          layoutId="currency-selector-indicator"
                                          className="absolute inset-0 rounded-lg bg-neutral-900 shadow-xs dark:bg-white"
                                          transition={{
                                            type: "spring",
                                            stiffness: 450,
                                            damping: 32,
                                          }}
                                        />
                                      )}
                                      <span className="relative z-10">{curr}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Invoice Statement */}
                          <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-gradient-to-br from-white via-neutral-50/90 to-neutral-100/60 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.008] hover:border-amber-500/40 hover:shadow-[0_16px_40px_rgba(245,158,11,0.12)] sm:p-5 dark:border-white/10 dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950/90 dark:shadow-[0_4px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-amber-500/40">
                            {/* Specular Top Rim */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

                            <div className="border-border/60 flex flex-wrap items-start justify-between gap-3 border-b pb-3.5">
                              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 font-mono text-xs font-bold text-white shadow-xs dark:bg-white dark:text-neutral-950">
                                  FP
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="truncate text-sm font-bold tracking-tight">
                                    FlowPilot Statement #FP-10892
                                  </h4>
                                  <p className="text-muted-foreground truncate text-xs">
                                    Billed to:{" "}
                                    <strong className="text-foreground font-semibold">
                                      Apex Solutions Inc.
                                    </strong>{" "}
                                    &bull; Due Upon Receipt
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 text-left sm:text-right">
                                <p className="text-muted-foreground font-mono text-[10px] font-bold tracking-wider uppercase">
                                  Settlement Method
                                </p>
                                <p className="text-foreground flex items-center justify-start gap-1 font-mono text-xs font-bold sm:justify-end">
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                  {currency} Stripe Connect
                                </p>
                              </div>
                            </div>

                            {/* Table */}
                            <div className="mt-3.5 space-y-2 text-xs">
                              <div className="border-border/40 text-muted-foreground flex justify-between border-b py-1.5 font-mono text-[11px] font-bold uppercase">
                                <span>Description</span>
                                <span className="hidden sm:inline">Hours &amp; Rate</span>
                                <span>Total</span>
                              </div>
                              <div className="flex items-center justify-between gap-2 py-1.5">
                                <div className="min-w-0 flex-1 pr-2">
                                  <p className="text-foreground truncate font-medium">
                                    Monthly Strategic Advisory Retainer
                                  </p>
                                  <p className="text-muted-foreground font-mono text-[10px] sm:hidden">
                                    20 hrs @{" "}
                                    <AnimatedAmount
                                      amountUsd={175}
                                      currency={currency}
                                      decimals={0}
                                    />
                                    /hr
                                  </p>
                                </div>
                                <span className="text-muted-foreground hidden shrink-0 font-mono sm:inline">
                                  20 hrs @{" "}
                                  <AnimatedAmount
                                    amountUsd={175}
                                    currency={currency}
                                    decimals={0}
                                  />
                                  /hr
                                </span>
                                <span className="text-foreground shrink-0 font-mono font-bold">
                                  <AnimatedAmount
                                    amountUsd={3500}
                                    currency={currency}
                                    decimals={0}
                                  />
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 py-1.5">
                                <div className="min-w-0 flex-1 pr-2">
                                  <p className="text-foreground truncate font-medium">
                                    Dynamic Buffer Engine Protocol Module
                                  </p>
                                  <p className="text-muted-foreground font-mono text-[10px] sm:hidden">
                                    1 Workspace License
                                  </p>
                                </div>
                                <span className="text-muted-foreground hidden shrink-0 font-mono sm:inline">
                                  1 Workspace License
                                </span>
                                <span className="text-foreground shrink-0 font-mono font-bold">
                                  <AnimatedAmount
                                    amountUsd={280}
                                    currency={currency}
                                    decimals={0}
                                  />
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 py-1.5">
                                <div className="min-w-0 flex-1 pr-2">
                                  <p className="text-foreground truncate font-medium">
                                    Multi-Tenant Scoped Workspace Governance
                                  </p>
                                  <p className="font-mono text-[10px] font-semibold text-emerald-600 sm:hidden dark:text-emerald-400">
                                    Included (Free)
                                  </p>
                                </div>
                                <span className="hidden shrink-0 font-mono font-semibold text-emerald-600 sm:inline dark:text-emerald-400">
                                  Included (Free)
                                </span>
                                <span className="text-foreground shrink-0 font-mono font-bold">
                                  <AnimatedAmount amountUsd={0} currency={currency} decimals={0} />
                                </span>
                              </div>
                            </div>

                            {/* Total & Action */}
                            <div className="border-border/70 mt-4 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-muted-foreground font-mono text-[11px] font-bold uppercase">
                                  Grand Total Due
                                </p>
                                <p className="text-foreground font-mono text-2xl font-extrabold tracking-tight">
                                  <AnimatedAmount
                                    amountUsd={3780}
                                    currency={currency}
                                    decimals={2}
                                  />{" "}
                                  <span className="text-muted-foreground text-sm font-semibold">
                                    {currency}
                                  </span>
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => setInvoiceSettled((prev) => !prev)}
                                className={`focus-visible:ring-primary relative inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl px-5 py-2.5 text-xs font-bold shadow-md transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-hidden active:scale-[0.98] sm:w-auto ${
                                  invoiceSettled
                                    ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400"
                                    : "ring-primary/30 bg-neutral-900 text-white ring-1 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
                                }`}
                              >
                                <CreditCard className="h-4 w-4" />
                                <span>
                                  {invoiceSettled
                                    ? "Settled via Stripe Connect"
                                    : "Simulate 1-Click Settlement"}
                                </span>
                              </button>
                            </div>

                            {/* Holographic Paid Stamp */}
                            {invoiceSettled && (
                              <motion.div
                                initial={{ scale: 1.15, opacity: 0, rotate: -6 }}
                                animate={{ scale: 1, opacity: 1, rotate: -2 }}
                                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                                className="pointer-events-none absolute top-4 right-3 rounded-2xl border-2 border-emerald-500/60 bg-emerald-500/20 px-3 py-1.5 shadow-[0_0_25px_rgba(16,185,129,0.25)] backdrop-blur-md sm:top-1/3 sm:right-8 sm:px-5 sm:py-2.5"
                              >
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                  <Check className="h-5 w-5 stroke-[3] sm:h-6 sm:w-6" />
                                  <div>
                                    <p className="font-mono text-[10px] font-black tracking-widest uppercase sm:text-xs">
                                      PAID &amp; RECONCILED
                                    </p>
                                    <p className="font-mono text-[9px] font-bold text-emerald-600/90 sm:text-[10px] dark:text-emerald-400/90">
                                      STRIPE CONNECT #TX-892401
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </>
                      ) : (
                        /* INVOICING CHAOS VIEW */
                        <div className="space-y-4">
                          {/* Disconnected Tool Strip */}
                          <div className="flex w-full max-w-full scrollbar-none items-center gap-2 overflow-x-auto rounded-xl border border-rose-500/30 bg-rose-500/[0.04] p-1.5 backdrop-blur-md">
                            <div className="flex shrink-0 items-center gap-1.5 text-xs font-semibold">
                              <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/50 bg-white/95 px-3 py-1.5 text-xs font-bold text-rose-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-900 dark:text-rose-400">
                                <AlertCircle className="h-3.5 w-3.5 animate-pulse text-rose-500" />
                                <span>Unpaid PDF #089 (42d Overdue)</span>
                              </div>
                              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-white/40 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:text-neutral-900 dark:border-white/5 dark:bg-neutral-800/40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
                                <CreditCard className="h-3.5 w-3.5 text-neutral-400" />
                                <span>Bank Wire Portal</span>
                              </div>
                              <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-white/40 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:text-neutral-900 dark:border-white/5 dark:bg-neutral-800/40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
                                <Database className="h-3.5 w-3.5 text-neutral-400" />
                                <span>QuickBooks Sync Error</span>
                              </div>
                            </div>
                          </div>

                          {/* Failure Alert Card */}
                          <div className="group relative overflow-hidden rounded-2xl border border-rose-500/50 bg-gradient-to-br from-white via-rose-50/40 to-neutral-100/70 p-3.5 shadow-[0_4px_25px_rgba(244,63,94,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.008] hover:border-rose-500/70 hover:shadow-[0_20px_45px_rgba(244,63,94,0.22)] sm:p-4.5 dark:border-rose-500/40 dark:from-neutral-900/90 dark:via-rose-950/30 dark:to-neutral-950/90 dark:shadow-[0_4px_30px_rgba(244,63,94,0.15),inset_0_1px_0_rgba(255,255,255,0.08)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-3.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.25)] dark:text-rose-400">
                                  <AlertCircle className="h-5 w-5 animate-bounce" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <h4 className="truncate text-sm font-extrabold text-neutral-900 sm:text-base dark:text-white">
                                      Cash Velocity Collapse: 42.8 Days DSO
                                    </h4>
                                    <span className="shrink-0 rounded-md border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                      Uncollected
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                                    Invoices sent manually via PDF attachments languish in client
                                    inboxes. Zero automated card-on-file or payment links mean
                                    endless follow-up cycles.
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 self-start sm:self-center">
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-bold text-rose-600 sm:px-3 dark:text-rose-400">
                                  <CreditCard className="h-3.5 w-3.5" />
                                  $4,250 Past Due
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Overdue Invoice Card */}
                          <div className="group relative overflow-hidden rounded-2xl border border-rose-500/35 bg-gradient-to-br from-white via-neutral-50/90 to-rose-50/30 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.008] hover:border-rose-500/60 hover:shadow-[0_16px_40px_rgba(244,63,94,0.18)] sm:p-4.5 dark:border-rose-500/30 dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950/90 dark:shadow-[0_4px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 shadow-2xs sm:h-11 sm:w-11 dark:text-rose-400">
                                  <FileSpreadsheet className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <span className="truncate font-mono text-sm font-bold text-neutral-900 dark:text-white">
                                      Invoice #INV-2024-089
                                    </span>
                                    <span className="shrink-0 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                      42 DAYS OVERDUE
                                    </span>
                                  </div>
                                  <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                                    Billed to: Acme Horizon Corp &bull; Due: September 30, 2024
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-wrap items-center gap-3 self-start sm:self-center">
                                <div className="text-left sm:text-right">
                                  <span className="font-mono text-base font-extrabold text-rose-600 sm:text-lg dark:text-rose-400">
                                    $4,250.00 USD
                                  </span>
                                  <p className="font-mono text-[10px] text-neutral-500">
                                    Awaiting manual transfer
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col justify-between gap-2 border-t border-rose-500/20 pt-3 text-xs sm:flex-row sm:items-center">
                              <div className="flex min-w-0 flex-1 items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                <Mail className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                                <span className="truncate">
                                  Subject: 4th Follow-up on Overdue Retainer
                                </span>
                              </div>
                              <span className="shrink-0 self-start rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-rose-600 sm:self-auto dark:text-rose-400">
                                Unanswered for 14 Days
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 4: SECURITY & TENANT BOUNDARY (CALM VS CHAOS) */}
                  {/* TRUTHFUL COPY: FRONTEND SIMULATION OF ORGANIZATION SCOPING */}
                  {activeTab === "security" && (
                    <motion.div
                      key={`security-${realityMode}`}
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      {realityMode === "calm" ? (
                        <>
                          <div className="border-border/70 flex flex-col gap-3 border-b pb-3.5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-extrabold sm:text-lg">
                                  Organization-Scoped Access Boundary
                                </h3>
                                <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                                  Frontend Demo Simulation
                                </span>
                              </div>
                              <p className="text-muted-foreground mt-0.5 text-xs">
                                Demonstrating how application-level organization scoping prevents
                                cross-tenant data access.
                              </p>
                            </div>

                            {/* Attack Simulation Trigger */}
                            <button
                              type="button"
                              onClick={handleTriggerBreach}
                              disabled={isSimulatingBreach}
                              className={`focus-visible:ring-primary inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold shadow-xs transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-hidden active:scale-[0.98] sm:w-auto ${
                                isSimulatingBreach
                                  ? "animate-pulse border-amber-500/60 bg-amber-500/15 text-amber-600"
                                  : breachTested
                                    ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.2)] dark:text-emerald-400"
                                    : "border-border/80 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
                              }`}
                            >
                              <ShieldCheck className="h-4 w-4 shrink-0" />
                              <span className="truncate">
                                {isSimulatingBreach
                                  ? "Testing Scoped Boundary..."
                                  : breachTested
                                    ? "Boundary Verified (403)"
                                    : "Simulate Cross-Tenant Query"}
                              </span>
                            </button>
                          </div>

                          {/* Node Topology */}
                          <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-gradient-to-br from-white via-neutral-50/90 to-neutral-100/60 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.008] hover:border-purple-500/40 hover:shadow-[0_16px_40px_rgba(168,85,247,0.12)] sm:p-5 dark:border-white/10 dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950/90 dark:shadow-[0_4px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-purple-500/40">
                            {/* Specular Top Rim */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

                            {/* Core */}
                            <div className="flex flex-col items-center text-center">
                              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-neutral-950 text-white shadow-md sm:h-12 sm:w-12 dark:bg-white dark:text-neutral-950">
                                <Lock className="h-5 w-5" />
                                <span className="ring-background absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-emerald-500 ring-2" />
                              </div>
                              <h4 className="mt-2 text-sm font-bold tracking-tight">
                                FlowPilot Multi-Tenant Architecture
                              </h4>
                              <p className="text-muted-foreground font-mono text-[10px] leading-relaxed sm:text-[11px]">
                                Organization Scoping &bull; Role-Based Access &bull; Strict Tenant
                                Filtering
                              </p>
                            </div>

                            {/* Nodes */}
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-3">
                              <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/15 via-emerald-500/10 to-transparent p-3 text-center shadow-[0_0_20px_rgba(16,185,129,0.18)] transition-all duration-200 hover:scale-[1.02] sm:p-3.5">
                                <div className="mb-1 flex justify-center text-emerald-600 dark:text-emerald-400">
                                  <Building2 className="h-4 w-4" />
                                </div>
                                <p className="text-foreground truncate text-xs font-bold">
                                  Acme Agency Workspace
                                </p>
                                <p className="text-muted-foreground mt-0.5 truncate font-mono text-[10px]">
                                  org_id: acme_01 (Active)
                                </p>
                                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                  Session Scoped
                                </span>
                              </div>

                              <div className="border-border/80 bg-muted/40 rounded-xl border p-3 text-center transition-all duration-200 hover:scale-[1.02] hover:border-neutral-400 sm:p-3.5">
                                <div className="text-muted-foreground mb-1 flex justify-center">
                                  <Building2 className="h-4 w-4" />
                                </div>
                                <p className="text-foreground truncate text-xs font-semibold">
                                  Horizon Media Workspace
                                </p>
                                <p className="text-muted-foreground mt-0.5 truncate font-mono text-[10px]">
                                  org_id: horizon_02
                                </p>
                                <span className="bg-muted border-border/80 text-muted-foreground mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-[9.5px] font-semibold">
                                  Boundary Isolated
                                </span>
                              </div>

                              <div className="border-border/80 bg-muted/40 rounded-xl border p-3 text-center transition-all duration-200 hover:scale-[1.02] hover:border-neutral-400 sm:p-3.5">
                                <div className="text-muted-foreground mb-1 flex justify-center">
                                  <Building2 className="h-4 w-4" />
                                </div>
                                <p className="text-foreground truncate text-xs font-semibold">
                                  Meridian Health Workspace
                                </p>
                                <p className="text-muted-foreground mt-0.5 truncate font-mono text-[10px]">
                                  org_id: meridian_03
                                </p>
                                <span className="bg-muted border-border/80 text-muted-foreground mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-[9.5px] font-semibold">
                                  Boundary Isolated
                                </span>
                              </div>
                            </div>

                            {/* Simulated Terminal Output Stream */}
                            {breachTested && (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 max-w-full overflow-x-auto rounded-xl border border-emerald-500/40 bg-neutral-950 p-3 font-mono text-xs text-emerald-400 shadow-xl sm:p-3.5"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <Terminal className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                                    <span className="truncate text-[10px] text-neutral-300 sm:text-[11px]">
                                      simulated_tenant_guard.log
                                    </span>
                                  </div>
                                  <span className="shrink-0 rounded-md border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 text-[9.5px] font-bold text-rose-400 sm:text-[10px]">
                                    HTTP 403 FORBIDDEN
                                  </span>
                                </div>
                                <div className="mt-2.5 space-y-1.5 text-[10px] break-words sm:text-[11px]">
                                  <p className="text-neutral-400">
                                    &gt; REQUEST: GET /api/v1/invoices?organizationId=meridian_03
                                  </p>
                                  <p className="text-rose-400">
                                    &gt; [SCOPING GUARD] Active session belongs to organization
                                    &apos;acme_01&apos;. Cross-tenant query blocked.
                                  </p>
                                  <p className="font-semibold text-emerald-400">
                                    &gt; [VERDICT] Access Denied. Zero cross-tenant records exposed.
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </>
                      ) : (
                        /* SECURITY CHAOS VIEW */
                        <div className="space-y-4">
                          {/* Disconnected Tool Strip */}
                          <div className="flex max-w-full scrollbar-none items-center gap-2 overflow-x-auto rounded-xl border border-rose-500/30 bg-rose-500/[0.04] p-1.5 backdrop-blur-md">
                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                              <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-500/50 bg-white/95 px-3 py-1.5 text-xs font-bold text-rose-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-900 dark:text-rose-400">
                                <ShieldAlert className="h-3.5 w-3.5 shrink-0 animate-pulse text-rose-500" />
                                <span>Public Drive Link (Public View)</span>
                              </div>
                              <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-white/40 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:text-neutral-900 dark:border-white/5 dark:bg-neutral-800/40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
                                <Users className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                                <span>Shared Notion (All Editors)</span>
                              </div>
                              <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-white/40 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:text-neutral-900 dark:border-white/5 dark:bg-neutral-800/40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
                                <Terminal className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                                <span>Unscoped API Route</span>
                              </div>
                            </div>
                          </div>

                          {/* Failure Alert Card */}
                          <div className="group relative overflow-hidden rounded-2xl border border-rose-500/50 bg-gradient-to-br from-white via-rose-50/40 to-neutral-100/70 p-3.5 shadow-[0_4px_25px_rgba(244,63,94,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.008] hover:border-rose-500/70 hover:shadow-[0_20px_45px_rgba(244,63,94,0.22)] sm:p-4.5 dark:border-rose-500/40 dark:from-neutral-900/90 dark:via-rose-950/30 dark:to-neutral-950/90 dark:shadow-[0_4px_30px_rgba(244,63,94,0.15),inset_0_1px_0_rgba(255,255,255,0.08)]">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-3.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.25)] sm:h-10 sm:w-10 dark:text-rose-400">
                                  <ShieldAlert className="h-4 w-4 animate-bounce sm:h-5 sm:w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-sm leading-snug font-extrabold text-neutral-900 sm:text-base dark:text-white">
                                      Cross-Tenant Exposure Incident: Zero Workspace Isolation
                                    </h4>
                                    <span className="shrink-0 rounded-md border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                      Breach Threat
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                                    Without strict organization scoping, external contractors and
                                    clients can access confidential files, margins, and proprietary
                                    deliverables belonging to other clients.
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 self-start sm:self-center">
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-rose-600 sm:px-3 sm:text-xs dark:text-rose-400">
                                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                                  Unrestricted Link
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 2 Diagnostic Risk Cards */}
                          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                            <div className="group relative overflow-hidden rounded-2xl border border-rose-500/35 bg-gradient-to-br from-white via-neutral-50/90 to-rose-50/30 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] hover:border-rose-500/60 hover:shadow-[0_16px_40px_rgba(244,63,94,0.18)] sm:p-4.5 dark:border-rose-500/30 dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950/90 dark:shadow-[0_4px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
                              <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className="truncate font-bold text-neutral-900 dark:text-white">
                                    Client Margin Leakage
                                  </span>
                                  <span className="shrink-0 rounded-full border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                    CRITICAL RISK
                                  </span>
                                </div>
                                <span className="shrink-0 font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                                  Exposed
                                </span>
                              </div>
                              <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                                Contractor accidentally shared the master pricing model with an
                                external client via an unrestricted Google Sheets view link.
                              </p>
                              <div className="mt-3 flex items-center justify-between border-t border-rose-500/20 pt-2 text-[10.5px] sm:text-[11px]">
                                <span className="font-mono text-neutral-400">Rate Deck Leaked</span>
                                <span className="font-semibold text-rose-600 dark:text-rose-400">
                                  Urgent Access Revocation
                                </span>
                              </div>
                            </div>

                            <div className="group relative overflow-hidden rounded-2xl border border-rose-500/35 bg-gradient-to-br from-white via-neutral-50/90 to-rose-50/30 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] hover:border-rose-500/60 hover:shadow-[0_16px_40px_rgba(244,63,94,0.18)] sm:p-4.5 dark:border-rose-500/30 dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950/90 dark:shadow-[0_4px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                              <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className="truncate font-bold text-neutral-900 dark:text-white">
                                    Accidental Record Deletion
                                  </span>
                                  <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                    DATA LOSS RISK
                                  </span>
                                </div>
                                <span className="shrink-0 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                                  Irreversible
                                </span>
                              </div>
                              <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                                An external freelancer mistakenly wiped 3 months of completed
                                deliverables in a shared Notion workspace with no tenant access
                                boundary.
                              </p>
                              <div className="mt-3 flex items-center justify-between border-t border-amber-500/20 pt-2 text-[10.5px] sm:text-[11px]">
                                <span className="font-mono text-neutral-400">
                                  No Granular Scoping
                                </span>
                                <span className="font-semibold text-amber-600 dark:text-amber-400">
                                  Requires Backup Restore
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* 4. LIVE PRODUCTION COCKPIT GATEWAY (EXPERT MODERN CLASSIC) */}
        <div className="relative mx-auto mt-8 w-full max-w-5xl sm:mt-12 2xl:max-w-6xl">
          {/* Ambient Corner Mesh Glow */}
          <div
            className="pointer-events-none absolute -inset-1 rounded-[32px] bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-teal-500/15 opacity-60 blur-xl"
            aria-hidden="true"
          />

          <div className="relative overflow-hidden rounded-3xl border border-neutral-300/80 bg-gradient-to-b from-white via-neutral-50/95 to-neutral-100/90 p-4.5 shadow-2xl backdrop-blur-2xl transition-all sm:p-6 md:p-8 dark:border-white/10 dark:from-[#0d1527]/95 dark:via-[#090f1d]/95 dark:to-[#060a14]/95 dark:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.85)]">
            {/* Top Specular Laser Shimmer */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent dark:via-emerald-400/40" />

            {/* Main Content Row */}
            <div className="flex flex-col items-start justify-between gap-5 sm:gap-6 lg:flex-row lg:items-center">
              {/* Left Column: Glass Icon Pod + Messaging */}
              <div className="flex min-w-0 items-start gap-3.5 sm:gap-5">
                {/* 3D Glass Hardware Vessel with Live Indicator */}
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/15 shadow-[0_8px_24px_rgba(16,185,129,0.18)] backdrop-blur-md sm:h-14 sm:w-14 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:shadow-[0_8px_30px_rgba(16,185,129,0.25)]">
                  <Laptop className="h-6 w-6 text-emerald-600 sm:h-7 sm:w-7 dark:text-emerald-400" />
                  {/* Floating Live Status Badge */}
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-white bg-emerald-500 dark:border-neutral-900" />
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">
                      <Sparkles className="h-3 w-3 shrink-0" />
                      Production Shift Ready
                    </span>
                    <span className="truncate font-mono text-[11px] text-neutral-400 sm:text-xs dark:text-neutral-500">
                      • Instant Tenant Provisioning
                    </span>
                  </div>

                  <h3 className="text-base leading-snug font-black tracking-tight text-neutral-950 sm:text-xl dark:text-white">
                    Shift from sandbox simulation to your live business cockpit
                  </h3>

                  <p className="max-w-2xl text-xs leading-relaxed text-neutral-600 sm:text-sm dark:text-neutral-400">
                    Launch your dedicated multi-tenant workspace with zero cold start. Isolate
                    client records with PostgreSQL Row-Level Security, schedule buffers with dynamic
                    capacity algorithms, and trigger instant Stripe Connect payouts.
                  </p>
                </div>
              </div>

              {/* Right Column: High-Performance CTA & Reassurance */}
              <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:items-end">
                <Button
                  size="lg"
                  className="group relative h-11 w-full justify-center overflow-hidden rounded-2xl bg-neutral-950 px-6 text-xs font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-200 hover:scale-[1.02] hover:bg-neutral-900 active:scale-[0.98] sm:h-12 sm:w-auto sm:px-7 sm:text-sm dark:bg-white dark:text-neutral-950 dark:shadow-[0_10px_35px_rgba(255,255,255,0.2)] dark:hover:bg-neutral-100"
                  asChild
                >
                  <Link href="/dashboard" className="flex items-center justify-center gap-2.5">
                    {/* Metallic Shimmer Bar */}
                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full dark:via-black/10" />
                    <span>Explore Live Workspace</span>
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </Button>

                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10.5px] text-neutral-500 sm:justify-end sm:text-[11px] dark:text-neutral-400">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>Free Sandbox Access • No Credit Card Required</span>
                </div>
              </div>
            </div>

            {/* Bottom Enterprise Architecture Telemetry Strip */}
            <div className="mt-5 border-t border-neutral-200/80 pt-4 sm:mt-6 sm:pt-5 dark:border-white/10">
              <div className="grid grid-cols-1 gap-2.5 min-[440px]:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2.5 rounded-xl border border-neutral-200/70 bg-white/70 px-3.5 py-2 text-xs shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-emerald-500/40 hover:shadow-md dark:border-white/5 dark:bg-white/[0.04] dark:hover:border-emerald-500/30">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] text-neutral-400 uppercase dark:text-neutral-500">
                      Security
                    </p>
                    <p className="truncate font-semibold text-neutral-800 dark:text-neutral-200">
                      Row-Level Isolation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-neutral-200/70 bg-white/70 px-3.5 py-2 text-xs shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-cyan-500/40 hover:shadow-md dark:border-white/5 dark:bg-white/[0.04] dark:hover:border-cyan-500/30">
                  <Zap className="h-4 w-4 shrink-0 text-cyan-500" />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] text-neutral-400 uppercase dark:text-neutral-500">
                      Latency
                    </p>
                    <p className="truncate font-semibold text-neutral-800 dark:text-neutral-200">
                      &lt;12ms Edge P99
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-neutral-200/70 bg-white/70 px-3.5 py-2 text-xs shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-emerald-500/40 hover:shadow-md dark:border-white/5 dark:bg-white/[0.04] dark:hover:border-emerald-500/30">
                  <CreditCard className="h-4 w-4 shrink-0 text-emerald-500" />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] text-neutral-400 uppercase dark:text-neutral-500">
                      Settlement
                    </p>
                    <p className="truncate font-semibold text-neutral-800 dark:text-neutral-200">
                      Instant Stripe Recon
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-neutral-200/70 bg-white/70 px-3.5 py-2 text-xs shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-purple-500/40 hover:shadow-md dark:border-white/5 dark:bg-white/[0.04] dark:hover:border-purple-500/30">
                  <Database className="h-4 w-4 shrink-0 text-purple-500" />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] text-neutral-400 uppercase dark:text-neutral-500">
                      Database
                    </p>
                    <p className="truncate font-semibold text-neutral-800 dark:text-neutral-200">
                      PostgreSQL ACID
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
