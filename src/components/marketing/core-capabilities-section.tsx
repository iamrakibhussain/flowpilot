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
  Users,
  Calendar,
  ShieldCheck,
  FileText,
  Check,
  Lock,
  Unlock,
  Clock,
  Sparkles,
  CreditCard,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Video,
  Terminal,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";

/**
 * Aerospace & Obsidian-Grade Hardware Bento Card
 * Features:
 * - Gyroscopic 3D perspective tilt with mouse coordinates
 * - Multi-layer Z-depth parallax layering
 * - Mac-style gloss traffic lights & Monospace Module Terminal
 * - Live Engine status beacon with pulsing latency telemetry
 * - Dynamic cursor-following spotlight glow
 * - Specular top rim light and luxury obsidian glass chassis
 */
interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  themeAccent?: "blue" | "violet" | "cyan" | "emerald";
  moduleId: string;
  moduleStatus: string;
}

const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = "",
  themeAccent = "blue",
  moduleId,
  moduleStatus,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const rectRef = React.useRef<DOMRect | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Silky smooth, organic spring physics matching ArchitectureTrustSection
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [3.5, -3.5]), {
    stiffness: 260,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(mouseX, [-260, 260], [-3.5, 3.5]), {
    stiffness: 260,
    damping: 24,
  });

  const handleMouseEnter = () => {
    if (cardRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = rectRef.current || cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Direct CSS variable updates on DOM node (zero React render overhead)
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);

    mouseX.set(x - rect.width / 2);
    mouseY.set(y - rect.height / 2);
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    mouseX.set(0);
    mouseY.set(0);
  };

  const accentSpotlights = {
    blue: "radial-gradient(450px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(37, 99, 235, 0.12), transparent 70%)",
    violet:
      "radial-gradient(450px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(139, 92, 246, 0.12), transparent 70%)",
    cyan: "radial-gradient(450px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(6, 182, 212, 0.12), transparent 70%)",
    emerald:
      "radial-gradient(450px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(16, 185, 129, 0.12), transparent 70%)",
  };

  const accentAmbientGlow = {
    blue: "radial-gradient(circle at 85% 10%, rgba(37, 99, 235, 0.08), transparent 60%)",
    violet: "radial-gradient(circle at 85% 10%, rgba(139, 92, 246, 0.08), transparent 60%)",
    cyan: "radial-gradient(circle at 85% 10%, rgba(6, 182, 212, 0.08), transparent 60%)",
    emerald: "radial-gradient(circle at 85% 10%, rgba(16, 185, 129, 0.08), transparent 60%)",
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1200px" }}
      className={`h-full ${className}`}
    >
      <motion.div
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateX,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="group/bento relative flex h-full min-h-[500px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/80 p-3.5 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl transition-shadow duration-300 hover:border-neutral-300 hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.12)] sm:min-h-[560px] sm:p-5 md:p-6 xl:p-7 dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0b1222]/80 dark:to-[#050811]/85 dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] dark:backdrop-blur-2xl dark:hover:border-white/20"
      >
        {/* Background Ambient Flare */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500 group-hover/bento:opacity-100"
          style={{ background: accentAmbientGlow[themeAccent] }}
          aria-hidden="true"
        />

        {/* Engineering Blueprint Dot Matrix Mask */}
        <div
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_65%,transparent_100%)] opacity-20 dark:opacity-15"
          style={{
            backgroundImage: "radial-gradient(rgba(148, 163, 184, 0.4) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
          aria-hidden="true"
        />

        {/* Dynamic Cursor Spotlight (Hardware CSS Variable Follower) */}
        {!shouldReduceMotion && (
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover/bento:opacity-100"
            style={{
              background: accentSpotlights[themeAccent],
            }}
            aria-hidden="true"
          />
        )}

        {/* Specular Top Rim Light */}
        <div
          className="via-primary/35 pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent dark:via-white/25"
          aria-hidden="true"
        />

        {/* ===================================================================== */}
        {/* AEROSPACE HARDWARE COCKPIT TERMINAL BAR                               */}
        {/* ===================================================================== */}
        <div
          style={{ transform: shouldReduceMotion ? "none" : "translateZ(26px)" }}
          className="-mx-1 -mt-1 mb-4 flex items-center justify-between gap-2 rounded-xl border border-neutral-200/80 bg-neutral-100/70 px-2.5 py-1.5 text-xs backdrop-blur-md sm:px-3 sm:py-2 dark:border-white/10 dark:bg-neutral-900/80"
        >
          {/* Mac Gloss Traffic Dots & Terminal Monospace Identifier */}
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5" aria-hidden="true">
              <div className="h-2 w-2 rounded-full bg-[#ff5f56] shadow-[0_0_6px_rgba(255,95,86,0.6),inset_0_0.5px_0.5px_rgba(255,255,255,0.6)] sm:h-2.5 sm:w-2.5" />
              <div className="h-2 w-2 rounded-full bg-[#ffbd2e] shadow-[0_0_6px_rgba(255,189,46,0.6),inset_0_0.5px_0.5px_rgba(255,255,255,0.6)] sm:h-2.5 sm:w-2.5" />
              <div className="h-2 w-2 rounded-full bg-[#27c93f] shadow-[0_0_6px_rgba(39,201,63,0.6),inset_0_0.5px_0.5px_rgba(255,255,255,0.6)] sm:h-2.5 sm:w-2.5" />
            </div>
            <span className="shrink-0 text-neutral-400 dark:text-neutral-600">|</span>
            <span className="flex min-w-0 items-center gap-1 font-mono text-[9.5px] font-semibold tracking-wider text-neutral-700 uppercase sm:gap-1.5 sm:text-[10.5px] dark:text-neutral-300">
              <Terminal className="text-primary h-3 w-3 shrink-0" />
              <span className="truncate">{moduleId}</span>
            </span>
          </div>

          {/* Live Engine Status Telemetry Beacon */}
          <div className="flex shrink-0 items-center gap-1.5 font-mono text-[9.5px] font-semibold sm:text-[10px]">
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] ring-2 ring-emerald-500/25" />
            </span>
            <span className="hidden text-emerald-600 sm:inline dark:text-emerald-400">
              {moduleStatus}
            </span>
            <span className="text-emerald-600 sm:hidden dark:text-emerald-400">ONLINE</span>
          </div>
        </div>

        {/* Main Content with 3D Preservation */}
        <div
          className="relative z-10 flex h-full flex-col justify-between"
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const CoreCapabilitiesSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // Module 01: Scheduling Buffer Mode (0m vs 15m vs 30m) & Conflict Shield Toggle
  const [schedulingBuffer, setSchedulingBuffer] = React.useState<0 | 15 | 30>(15);
  const [conflictShieldActive, setConflictShieldActive] = React.useState(true);

  // Module 02: RBAC Interactive 3-Tier Role Selector (Owner vs Lead vs Staff)
  const [activeRole, setActiveRole] = React.useState<"owner" | "lead" | "staff">("owner");

  // Module 03: CRM Client Profile Toggle (Apex vs Meridian) & Interactive Dossier Tab
  const [selectedClient, setSelectedClient] = React.useState<"apex" | "meridian">("apex");
  const [activeCrmTab, setActiveCrmTab] = React.useState<"health" | "revenue" | "activity">(
    "health"
  );

  // Module 04: Invoicing Simulation State (Unsettled vs Settled) & Multi-Currency Switcher
  const [isSettled, setIsSettled] = React.useState(false);
  const [currency, setCurrency] = React.useState<"USD" | "EUR" | "GBP" | "BDT">("USD");

  // Real-time calculated currency configurations
  const currencyConfigs = {
    USD: { symbol: "$", rate: 1, amount: 3500, hourly: 175, formatted: "$3,500.00" },
    EUR: { symbol: "€", rate: 0.92, amount: 3220, hourly: 161, formatted: "€3,220.00" },
    GBP: { symbol: "£", rate: 0.79, amount: 2765, hourly: 138, formatted: "£2,765.00" },
    BDT: { symbol: "৳", rate: 119.5, amount: 418250, hourly: 20912, formatted: "৳4,18,250.00" },
  };
  const activeCurrencyConfig = currencyConfigs[currency];

  return (
    <section
      id="features"
      className="relative scroll-mt-20 overflow-hidden py-16 sm:py-20 md:py-28"
    >
      <Container>
        {/* ========================================================================= */}
        {/* MASTER SECTION EDITORIAL HEADER                                           */}
        {/* ========================================================================= */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Aerospace Hardware-Grade Eyebrow Badge */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
            className="flex items-center justify-center motion-reduce:!transform-none motion-reduce:!opacity-100"
          >
            <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-neutral-200/90 bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md sm:gap-2 sm:px-4 sm:py-1.5 dark:border-white/15 dark:bg-neutral-900/90 dark:text-neutral-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.5)]">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="bg-primary relative inline-flex h-2 w-2 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.9)]" />
              </span>
              <span className="tracking-wide">Core Capabilities</span>
              <span className="text-neutral-300 dark:text-neutral-600">•</span>
              <span className="font-mono text-[11px] text-blue-600 dark:text-cyan-400">
                4 Operational Pillars
              </span>
              <span className="hidden text-neutral-300 sm:inline dark:text-neutral-600">•</span>
              <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 sm:inline dark:text-emerald-400">
                Live Interactive Mode
              </span>
            </div>
          </motion.div>

          {/* Master Radiant Heading */}
          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              delay: shouldReduceMotion ? 0 : 0.08,
            }}
            className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-5xl"
          >
            <span className="text-neutral-900 drop-shadow-xs dark:bg-gradient-to-b dark:from-white dark:via-neutral-100 dark:to-neutral-300 dark:bg-clip-text dark:text-transparent">
              Engineered for Every Stage of
            </span>{" "}
            <span className="mt-1 block bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300">
              Service Delivery
            </span>
          </motion.h2>

          {/* Scannable Editorial Subtitle */}
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              delay: shouldReduceMotion ? 0 : 0.14,
            }}
            className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-300"
          >
            FlowPilot replaces fragmented point tools with a calm, integrated operations engine.
            Explore the real architectural mechanics below.
          </motion.p>
        </div>

        {/* ========================================================================= */}
        {/* 4-PILLAR BENTO COCKPIT SHOWCASE GRID                                      */}
        {/* ========================================================================= */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-7 xl:gap-8">
          {/* ======================================================================= */}
          {/* CARD 1: APPOINTMENT SCHEDULING (BENTO HERO - 7 COLS)                    */}
          {/* ======================================================================= */}
          <BentoCard
            className="lg:col-span-7"
            themeAccent="blue"
            moduleId="MODULE-01 // CALENDAR ENGINE"
            moduleStatus="Sync: 2-Way Active (9ms)"
          >
            <div className="flex h-full flex-col justify-between">
              <div>
                {/* Module Category Ribbon & Interactive Controls Header */}
                <div
                  style={{ transform: shouldReduceMotion ? "none" : "translateZ(22px)" }}
                  className="flex flex-wrap items-center justify-between gap-3 pb-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10 text-blue-600 shadow-xs dark:border-blue-400/30 dark:bg-blue-500/15 dark:text-blue-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className="border-blue-500/30 bg-blue-500/5 text-xs font-semibold text-neutral-900 dark:border-blue-400/30 dark:text-neutral-100"
                      >
                        Appointment Scheduling
                      </Badge>
                      <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                        Multi-Lane Service Calendar &amp; Buffer Control
                      </p>
                    </div>
                  </div>

                  {/* Conflict Shield & Buffer Mode Switcher */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Conflict Shield Pill Toggle */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={conflictShieldActive}
                      aria-label="Toggle conflict protection shield"
                      onClick={() => setConflictShieldActive((prev) => !prev)}
                      className={`focus-visible:ring-primary inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden ${
                        conflictShieldActive
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 shadow-2xs dark:border-emerald-400/40 dark:text-emerald-400"
                          : "border-neutral-200 bg-neutral-100 text-neutral-500 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          conflictShieldActive
                            ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                            : "bg-neutral-400"
                        }`}
                      />
                      <span>{conflictShieldActive ? "Shield: Active" : "Shield: Off"}</span>
                    </button>

                    {/* Buffer Mode Switcher */}
                    <div
                      role="radiogroup"
                      aria-label="Calendar buffer interval"
                      className="flex items-center gap-1 rounded-lg border border-neutral-200/90 bg-neutral-100/80 p-1 text-xs dark:border-white/10 dark:bg-neutral-800/80"
                    >
                      <span className="pl-1.5 text-[10px] font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                        Buffer:
                      </span>
                      {([0, 15, 30] as const).map((mins) => {
                        const isSelected = schedulingBuffer === mins;
                        return (
                          <button
                            key={mins}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => setSchedulingBuffer(mins)}
                            className="focus-visible:ring-primary relative cursor-pointer rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
                          >
                            {isSelected && (
                              <motion.span
                                layoutId={shouldReduceMotion ? undefined : "active-buffer-pill"}
                                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                className={`absolute inset-0 rounded-md shadow-2xs ${
                                  mins === 0
                                    ? "bg-rose-500 text-white"
                                    : mins === 15
                                      ? "bg-emerald-600 text-white"
                                      : "bg-blue-600 text-white"
                                }`}
                              />
                            )}
                            <span
                              className={`relative z-10 transition-colors ${
                                isSelected
                                  ? "font-bold text-white"
                                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                              }`}
                            >
                              {mins === 0 ? "0m" : `+${mins}m`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                  Coordinated Service Calendars with Buffer Intelligence
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                  Eliminate scheduling collisions, prevent burnout between back-to-back client
                  calls, and maintain automatic buffer time between meetings.
                </p>

                {/* MULTI-LANE VISUAL CALENDAR CANVAS */}
                <div
                  style={{ transform: shouldReduceMotion ? "none" : "translateZ(16px)" }}
                  className="relative mt-4.5 flex min-h-[290px] flex-col justify-between overflow-hidden rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-3.5 shadow-inner sm:p-4 dark:border-white/10 dark:bg-black/40"
                >
                  <div className="space-y-2.5">
                    {/* Meeting Block 1 */}
                    <div className="group/slot dark:hover:bg-neutral-850/90 relative flex cursor-pointer flex-col justify-between gap-2 overflow-hidden rounded-lg border border-neutral-200/90 bg-white/95 p-2.5 pl-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/60 hover:bg-neutral-50/90 hover:shadow-md sm:flex-row sm:items-center sm:p-3 sm:pl-4 dark:border-white/10 dark:bg-neutral-900/90">
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-600 transition-all duration-200 group-hover/slot:w-1.5" />

                      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                        <div className="flex h-8 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 font-mono text-[10px] leading-tight font-bold text-neutral-800 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200">
                          <span>09:00</span>
                          <span className="text-[8px] font-normal text-neutral-500">AM</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-xs font-semibold text-neutral-900 sm:text-sm dark:text-white">
                              Enterprise Architecture Review
                            </p>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600 dark:text-blue-400">
                              <Video className="h-2.5 w-2.5" /> Video Confirmed
                            </span>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                            <div className="relative flex shrink-0 -space-x-1.5 overflow-hidden">
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-[8px] font-bold text-blue-600 ring-1 ring-white dark:text-blue-400 dark:ring-neutral-900">
                                SC
                              </span>
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/20 text-[8px] font-bold text-indigo-600 ring-1 ring-white dark:text-indigo-400 dark:ring-neutral-900">
                                AV
                              </span>
                            </div>
                            <span className="flex items-center gap-1 truncate">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                              <span className="truncate">Apex Solutions &bull; Sarah Chen</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                        <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          09:00 – 10:00 AM
                        </span>
                        <span className="hidden items-center gap-1 rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[9.5px] font-medium text-neutral-500 sm:inline-flex dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-400">
                          Confirmed
                        </span>
                      </div>
                    </div>

                    {/* Timeline Live Indicator Line */}
                    <div className="relative flex items-center gap-2 py-0.5">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                        <span className="bg-primary relative inline-flex h-2.5 w-2.5 rounded-full shadow-[0_0_6px_rgba(37,99,235,0.8)]" />
                      </span>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/50 via-neutral-300 to-transparent dark:from-blue-500/50 dark:via-neutral-700 dark:to-transparent" />
                      <span className="shrink-0 rounded border border-neutral-200 bg-white/95 px-2 py-0.5 font-mono text-[9px] font-semibold text-neutral-600 shadow-2xs dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300">
                        10:00 AM &bull; Active Cursor
                      </span>
                    </div>

                    {/* The Dynamic Elastic Buffer Row */}
                    <div className="relative w-full">
                      <motion.div
                        layout={!shouldReduceMotion}
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        className={`flex w-full cursor-pointer flex-col items-start justify-between gap-2 overflow-hidden rounded-lg border px-2.5 py-2 transition-all duration-200 hover:scale-[1.01] hover:shadow-xs sm:flex-row sm:items-center sm:px-3 ${
                          schedulingBuffer === 0
                            ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                            : schedulingBuffer === 15
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        <div className="flex w-full min-w-0 flex-1 items-center gap-2 overflow-hidden text-xs font-medium">
                          {schedulingBuffer === 0 ? (
                            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                          ) : schedulingBuffer === 15 ? (
                            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                          ) : (
                            <Sparkles className="h-4 w-4 shrink-0 text-blue-500" />
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-[11px] font-medium sm:text-xs">
                              {schedulingBuffer === 0 ? (
                                <>
                                  <span className="hidden sm:inline">
                                    High Schedule Density: 0m Buffer (Back-to-back risk)
                                  </span>
                                  <span className="sm:hidden">0m Buffer: Collision Risk</span>
                                </>
                              ) : schedulingBuffer === 15 ? (
                                <>
                                  <span className="hidden sm:inline">
                                    Protected Buffer: +15m Transition &amp; Focus Gap
                                  </span>
                                  <span className="sm:hidden">Protected Buffer: +15m Gap</span>
                                </>
                              ) : (
                                <>
                                  <span className="hidden sm:inline">
                                    Extended Buffer: +30m Strategy Debrief &amp; Sync
                                  </span>
                                  <span className="sm:hidden">Extended Buffer: +30m Gap</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 self-start rounded-md border border-neutral-200 bg-white/95 px-2 py-0.5 font-mono text-[10px] font-semibold text-neutral-800 shadow-2xs sm:self-center dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-200">
                          {schedulingBuffer === 0
                            ? "0m Gap"
                            : `10:00 – 10:${schedulingBuffer.toString().padStart(2, "0")} AM`}
                        </span>
                      </motion.div>
                    </div>

                    {/* Meeting Block 2 */}
                    <motion.div
                      layout={!shouldReduceMotion}
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      className="group/slot dark:hover:bg-neutral-850/90 relative flex cursor-pointer flex-col justify-between gap-2 overflow-hidden rounded-lg border border-neutral-200/90 bg-white/95 p-2.5 pl-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/60 hover:bg-neutral-50/90 hover:shadow-md sm:flex-row sm:items-center sm:p-3 sm:pl-4 dark:border-white/10 dark:bg-neutral-900/90"
                    >
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-violet-400 to-purple-600 transition-all duration-200 group-hover/slot:w-1.5" />

                      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                        <div className="flex h-8 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 font-mono text-[10px] leading-tight font-bold text-neutral-800 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-200">
                          <span>
                            {schedulingBuffer === 0
                              ? "10:00"
                              : schedulingBuffer === 15
                                ? "10:15"
                                : "10:30"}
                          </span>
                          <span className="text-[8px] font-normal text-neutral-500">AM</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-xs font-semibold text-neutral-900 sm:text-sm dark:text-white">
                              Q3 Product Velocity Strategy
                            </p>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-violet-600 dark:text-violet-400">
                              <Video className="h-2.5 w-2.5" /> Confirmed
                            </span>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[8px] font-bold text-violet-600 ring-1 ring-white dark:text-violet-400 dark:ring-neutral-900">
                              MV
                            </span>
                            <span className="truncate">
                              <span className="hidden sm:inline">
                                Meridian Health &bull; Lead: Marcus Vance (45m)
                              </span>
                              <span className="sm:hidden">
                                Meridian Health &bull; M. Vance (45m)
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="shrink-0 self-start rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-neutral-600 sm:self-center dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-400">
                        {schedulingBuffer === 0 && "10:00 – 10:45 AM"}
                        {schedulingBuffer === 15 && "10:15 – 11:00 AM"}
                        {schedulingBuffer === 30 && "10:30 – 11:15 AM"}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Bottom Telemetry Feature Chips */}
              <div
                style={{ transform: shouldReduceMotion ? "none" : "translateZ(14px)" }}
                className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-neutral-200/80 pt-3 text-[11px] font-medium sm:gap-2 sm:text-xs dark:border-white/10"
              >
                <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-emerald-600 sm:px-2.5 dark:text-emerald-400">
                  <Check className="h-3.5 w-3.5 shrink-0" /> Automatic Buffer Intervals
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100/80 px-2 py-1 text-neutral-600 sm:px-2.5 dark:border-white/10 dark:bg-neutral-800/80 dark:text-neutral-300">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />{" "}
                  Multi-Calendar 2-Way Sync
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100/80 px-2 py-1 text-neutral-600 sm:px-2.5 dark:border-white/10 dark:bg-neutral-800/80 dark:text-neutral-300">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />{" "}
                  Auto-Timezone Normalization
                </span>
              </div>
            </div>
          </BentoCard>

          {/* ======================================================================= */}
          {/* CARD 2: WORKSPACE & RBAC GOVERNANCE (BENTO PILLAR - 5 COLS)             */}
          {/* ======================================================================= */}
          <BentoCard
            className="lg:col-span-5"
            themeAccent="violet"
            moduleId="MODULE-02 // ACCESS CONTROL"
            moduleStatus="Boundary: Strict Isolation"
          >
            <div className="flex h-full flex-col justify-between">
              <div>
                {/* Module Category Ribbon & Interactive Role Selector */}
                <div
                  style={{ transform: shouldReduceMotion ? "none" : "translateZ(22px)" }}
                  className="flex flex-wrap items-center justify-between gap-3 pb-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10 text-violet-600 shadow-xs dark:border-violet-400/30 dark:bg-violet-500/15 dark:text-violet-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className="border-violet-500/30 bg-violet-500/5 text-xs font-semibold text-neutral-900 dark:border-violet-400/30 dark:text-neutral-100"
                      >
                        Workspace &amp; Team Governance
                      </Badge>
                      <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                        Multi-Tenant Scoping &amp; Role-Based Access
                      </p>
                    </div>
                  </div>

                  {/* 3-Tier Role Switcher */}
                  <div
                    role="radiogroup"
                    aria-label="Role preview level"
                    className="flex items-center rounded-lg border border-neutral-200/90 bg-neutral-100/80 p-1 text-[11px] dark:border-white/10 dark:bg-neutral-800/80"
                  >
                    {(["owner", "lead", "staff"] as const).map((role) => {
                      const isSelected = activeRole === role;
                      const labels = { owner: "Owner", lead: "Lead", staff: "Staff" };
                      return (
                        <button
                          key={role}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setActiveRole(role)}
                          className="focus-visible:ring-primary relative cursor-pointer rounded-md px-2.5 py-0.5 font-medium transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
                        >
                          {isSelected && (
                            <motion.span
                              layoutId={shouldReduceMotion ? undefined : "active-rbac-role-pill"}
                              transition={{ type: "spring", stiffness: 500, damping: 35 }}
                              className="absolute inset-0 rounded-md border border-neutral-200 bg-white text-neutral-900 shadow-xs dark:border-white/10 dark:bg-neutral-700 dark:text-white"
                            />
                          )}
                          <span
                            className={`relative z-10 transition-colors ${
                              isSelected
                                ? "font-semibold text-neutral-900 dark:text-white"
                                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                            }`}
                          >
                            {labels[role]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <h3 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                  Granular Role-Based Access &amp; Workspace Isolation
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                  Test how FlowPilot dynamically scopes confidential payroll, margins, and invoices
                  based on individual team roles.
                </p>

                {/* PERMISSION VAULT CANVAS */}
                <div
                  style={{ transform: shouldReduceMotion ? "none" : "translateZ(16px)" }}
                  className="relative mt-4.5 flex min-h-[290px] flex-col justify-between overflow-hidden rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-3.5 shadow-inner sm:p-4 dark:border-white/10 dark:bg-black/40"
                >
                  <div className="space-y-2.5">
                    {/* Database Scope Telemetry Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-neutral-200/80 pb-2 font-mono text-[10px] dark:border-white/10">
                      <span className="flex min-w-0 items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                        <span className="truncate">Workspace: org_flowpilot_demo</span>
                      </span>
                      <span className="shrink-0 font-semibold text-emerald-600 dark:text-emerald-400">
                        RLS Enforced
                      </span>
                    </div>

                    {/* Scope Item 1: Public CRM Scope */}
                    <div className="dark:hover:bg-neutral-850/90 flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-neutral-200/90 bg-white/95 p-2.5 text-xs shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/50 hover:bg-neutral-50/90 hover:shadow-md dark:border-white/10 dark:bg-neutral-900/90">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 text-emerald-600 dark:border-white/10 dark:bg-neutral-800 dark:text-emerald-400">
                          <Unlock className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate text-[11px] font-semibold text-neutral-900 sm:text-xs dark:text-white">
                            Client Dossiers &amp; Schedules
                          </span>
                          <span className="block truncate text-[10px] text-neutral-500 dark:text-neutral-400">
                            14 Active Clients &bull; 6 Team Schedules
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Full Access
                      </span>
                    </div>

                    {/* Scope Item 2: Confidential Financial Scope with Dynamic Blur Shield */}
                    <div className="dark:hover:bg-neutral-850/90 relative cursor-pointer overflow-hidden rounded-lg border border-neutral-200/90 bg-white/95 p-2.5 text-xs shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/50 hover:bg-neutral-50/90 hover:shadow-md dark:border-white/10 dark:bg-neutral-900/90">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                              activeRole === "owner" || activeRole === "lead"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {activeRole === "owner" || activeRole === "lead" ? (
                              <Unlock className="h-3.5 w-3.5" />
                            ) : (
                              <Lock className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="block truncate text-[11px] font-semibold text-neutral-900 sm:text-xs dark:text-white">
                              Financial Margins &amp; Invoicing
                            </span>
                            <span className="block truncate text-[10px] text-neutral-500 dark:text-neutral-400">
                              Revenue Reports &bull; Contractor Rates
                            </span>
                          </div>
                        </div>

                        {activeRole === "owner" ? (
                          <span className="shrink-0 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            $48,250 MTD <span className="hidden sm:inline">(38.4% Net)</span>
                          </span>
                        ) : activeRole === "lead" ? (
                          <span className="shrink-0 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                            Ops Approved
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-neutral-500 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-400">
                            Restricted
                          </span>
                        )}
                      </div>

                      {/* Hardware Privacy Shield for Staff role */}
                      <AnimatePresence>
                        {activeRole === "staff" && (
                          <motion.div
                            initial={shouldReduceMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                            className="absolute inset-0 flex items-center justify-center border border-neutral-200/90 bg-white/95 px-2 font-mono text-[10.5px] font-semibold backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/95"
                          >
                            <div className="flex items-center gap-1.5 text-center text-neutral-600 dark:text-neutral-300">
                              <Lock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                              <span className="hidden sm:inline">
                                Restricted • Administrator Permission Required
                              </span>
                              <span className="sm:hidden">Restricted • Admin Required</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* 3-Tier Full Permission Matrix Micro-Grid */}
                  <div className="mt-2 space-y-1 rounded-lg border border-neutral-200/80 bg-neutral-100/60 p-2 text-[9.5px] dark:border-white/10 dark:bg-neutral-900/60">
                    <div className="flex items-center justify-between border-b border-neutral-200/60 pb-0.5 font-mono text-neutral-500 dark:border-white/10 dark:text-neutral-400">
                      <span>SCOPE</span>
                      <span>OWNER | LEAD | STAFF</span>
                    </div>
                    <div className="flex cursor-pointer items-center justify-between rounded-sm px-1 py-0.5 text-neutral-600 transition-colors duration-150 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-white/5">
                      <span className="truncate pr-1">Client CRM Comms</span>
                      <span className="flex shrink-0 items-center gap-1 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <span>AUTH &bull; AUTH &bull; AUTH</span>
                      </span>
                    </div>
                    <div className="flex cursor-pointer items-center justify-between rounded-sm px-1 py-0.5 text-neutral-600 transition-colors duration-150 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-white/5">
                      <span className="truncate pr-1">Financial Margins</span>
                      <span className="shrink-0 font-mono font-semibold">
                        <span className="text-emerald-600 dark:text-emerald-400">● FULL</span>{" "}
                        &bull; <span className="text-blue-600 dark:text-blue-400">▲ AGGR</span>{" "}
                        &bull; <span className="text-neutral-400">■ HIDDEN</span>
                      </span>
                    </div>
                    <div className="flex cursor-pointer items-center justify-between rounded-sm px-1 py-0.5 text-neutral-600 transition-colors duration-150 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:bg-white/5">
                      <span className="truncate pr-1">Payout Reconcile</span>
                      <span className="shrink-0 font-mono font-semibold">
                        <span className="text-emerald-600 dark:text-emerald-400">● EXEC</span>{" "}
                        &bull; <span className="text-neutral-400">■ LOCK</span> &bull;{" "}
                        <span className="text-neutral-400">■ LOCK</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Telemetry Feature Chips */}
              <div
                style={{ transform: shouldReduceMotion ? "none" : "translateZ(14px)" }}
                className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-neutral-200/80 pt-3 text-[11px] font-medium sm:gap-2 sm:text-xs dark:border-white/10"
              >
                <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100/80 px-2 py-1 text-neutral-800 sm:px-2.5 dark:border-white/10 dark:bg-neutral-800/80 dark:text-neutral-200">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />{" "}
                  Owner, Admin &amp; Staff Tiers
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100/80 px-2 py-1 text-neutral-600 sm:px-2.5 dark:border-white/10 dark:bg-neutral-800/80 dark:text-neutral-300">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />{" "}
                  Multi-Tenant Scoping
                </span>
              </div>
            </div>
          </BentoCard>

          {/* ======================================================================= */}
          {/* CARD 3: CLIENT RELATIONSHIP MANAGEMENT (BENTO 5 COLS)                   */}
          {/* ======================================================================= */}
          <BentoCard
            className="lg:col-span-5"
            themeAccent="cyan"
            moduleId="MODULE-03 // CLIENT INTELLIGENCE"
            moduleStatus="Records: 14 Active"
          >
            <div className="flex h-full flex-col justify-between">
              <div>
                {/* Module Category Ribbon & Client Selector */}
                <div
                  style={{ transform: shouldReduceMotion ? "none" : "translateZ(22px)" }}
                  className="flex flex-wrap items-center justify-between gap-3 pb-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-600 shadow-xs dark:border-cyan-400/30 dark:bg-cyan-500/15 dark:text-cyan-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className="border-cyan-500/30 bg-cyan-500/5 text-xs font-semibold text-neutral-900 dark:border-cyan-400/30 dark:text-neutral-100"
                      >
                        Client Relationship Management
                      </Badge>
                      <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                        Living Intelligence Dossier 360&deg;
                      </p>
                    </div>
                  </div>

                  {/* Client Profile Selector */}
                  <div
                    role="radiogroup"
                    aria-label="Select demo client profile"
                    className="flex items-center rounded-lg border border-neutral-200/90 bg-neutral-100/80 p-1 text-xs dark:border-white/10 dark:bg-neutral-800/80"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selectedClient === "apex"}
                      onClick={() => setSelectedClient("apex")}
                      className="focus-visible:ring-primary relative cursor-pointer rounded-md px-2.5 py-0.5 font-medium transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
                    >
                      {selectedClient === "apex" && (
                        <motion.span
                          layoutId={shouldReduceMotion ? undefined : "active-crm-client-pill"}
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          className="absolute inset-0 rounded-md border border-neutral-200 bg-white text-neutral-900 shadow-xs dark:border-white/10 dark:bg-neutral-700 dark:text-white"
                        />
                      )}
                      <span
                        className={`relative z-10 transition-colors ${
                          selectedClient === "apex"
                            ? "font-semibold text-neutral-900 dark:text-white"
                            : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                      >
                        Apex
                      </span>
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selectedClient === "meridian"}
                      onClick={() => setSelectedClient("meridian")}
                      className="focus-visible:ring-primary relative cursor-pointer rounded-md px-2.5 py-0.5 font-medium transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
                    >
                      {selectedClient === "meridian" && (
                        <motion.span
                          layoutId={shouldReduceMotion ? undefined : "active-crm-client-pill"}
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          className="absolute inset-0 rounded-md border border-neutral-200 bg-white text-neutral-900 shadow-xs dark:border-white/10 dark:bg-neutral-700 dark:text-white"
                        />
                      )}
                      <span
                        className={`relative z-10 transition-colors ${
                          selectedClient === "meridian"
                            ? "font-semibold text-neutral-900 dark:text-white"
                            : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                      >
                        Meridian
                      </span>
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                  Centralized Client Dossier &amp; Historical Context
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                  Consolidates communication history, service contracts, and lifetime revenue under
                  one tenant-isolated dashboard.
                </p>

                {/* CLIENT DOSSIER CANVAS */}
                <div
                  style={{ transform: shouldReduceMotion ? "none" : "translateZ(16px)" }}
                  className="relative mt-4.5 flex min-h-[290px] flex-col justify-between overflow-hidden rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-3.5 shadow-inner sm:p-4 dark:border-white/10 dark:bg-black/40"
                >
                  <div>
                    {/* 3-Tab Dossier Mode Switcher */}
                    <div
                      role="tablist"
                      aria-label="Client dossier perspectives"
                      className="flex items-center rounded-lg border border-neutral-200/90 bg-neutral-100/80 p-0.5 text-xs sm:p-1 dark:border-white/10 dark:bg-neutral-800/80"
                    >
                      {(
                        [
                          { id: "health", label: "Health Radar" },
                          { id: "revenue", label: "Revenue & LTV" },
                          { id: "activity", label: "Activity Stream" },
                        ] as const
                      ).map((tab) => {
                        const isTabActive = activeCrmTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={isTabActive}
                            onClick={() => setActiveCrmTab(tab.id)}
                            className="focus-visible:ring-primary relative flex-1 cursor-pointer rounded-md px-1.5 py-1 text-center text-[10.5px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-hidden sm:px-2 sm:text-[11px]"
                          >
                            {isTabActive && (
                              <motion.span
                                layoutId={shouldReduceMotion ? undefined : "active-crm-tab-pill"}
                                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                className="absolute inset-0 rounded-md border border-neutral-200 bg-white text-neutral-900 shadow-xs dark:border-white/10 dark:bg-neutral-700 dark:text-white"
                              />
                            )}
                            <span
                              className={`relative z-10 truncate transition-colors ${
                                isTabActive
                                  ? "font-bold text-neutral-900 dark:text-white"
                                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                              }`}
                            >
                              {tab.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${selectedClient}-${activeCrmTab}`}
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
                        className="pt-2.5 motion-reduce:!transform-none motion-reduce:!opacity-100"
                      >
                        {/* Header Strip with Client Avatar */}
                        <div className="flex items-center justify-between gap-2 pb-2">
                          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                            <div className="border-primary/20 bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold shadow-2xs">
                              {selectedClient === "apex" ? "AS" : "MH"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs leading-tight font-semibold text-neutral-900 sm:text-sm dark:text-white">
                                {selectedClient === "apex"
                                  ? "Apex Solutions Inc."
                                  : "Meridian Health Group"}
                              </p>
                              <p className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">
                                Lead:{" "}
                                {selectedClient === "apex"
                                  ? "Sarah Chen (VP Ops)"
                                  : "Marcus Vance (Dir. Medicine)"}
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {selectedClient === "apex" ? "Enterprise" : "VIP Tier"}
                          </span>
                        </div>

                        {/* Tab 1: Health Radar View */}
                        {activeCrmTab === "health" && (
                          <div className="dark:hover:bg-neutral-850/90 cursor-pointer rounded-lg border border-neutral-200/90 bg-white/95 p-2.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:bg-neutral-50/90 hover:shadow-md dark:border-white/10 dark:bg-neutral-900/90">
                            <div className="flex items-center justify-between gap-3">
                              {/* Health Score Ring */}
                              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                                <svg
                                  className="h-14 w-14 -rotate-90"
                                  viewBox="0 0 36 36"
                                  aria-hidden="true"
                                >
                                  <path
                                    className="text-neutral-200 dark:text-neutral-800"
                                    strokeWidth="3.5"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <path
                                    className="text-emerald-500"
                                    strokeDasharray={
                                      selectedClient === "apex" ? "98, 100" : "94, 100"
                                    }
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                </svg>
                                <span className="absolute font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  {selectedClient === "apex" ? "98%" : "94%"}
                                </span>
                              </div>

                              <div className="flex-1 space-y-0.5 text-[10.5px]">
                                <div className="flex items-center justify-between">
                                  <span className="text-neutral-500 dark:text-neutral-400">
                                    Account Health:
                                  </span>
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {selectedClient === "apex" ? "Exceptional" : "Prime Retainer"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-neutral-500 dark:text-neutral-400">
                                    Client NPS:
                                  </span>
                                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                                    {selectedClient === "apex" ? "+78 Promoters" : "+72 Promoters"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-neutral-500 dark:text-neutral-400">
                                    Response SLA:
                                  </span>
                                  <span className="font-mono text-neutral-900 dark:text-neutral-200">
                                    &lt;14 mins
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tab 2: Revenue & LTV View */}
                        {activeCrmTab === "revenue" && (
                          <div className="dark:hover:bg-neutral-850/90 cursor-pointer space-y-1.5 rounded-lg border border-neutral-200/90 bg-white/95 p-2.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:bg-neutral-50/90 hover:shadow-md dark:border-white/10 dark:bg-neutral-900/90">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="block text-[9px] text-neutral-500 dark:text-neutral-400">
                                  Lifetime Value (LTV)
                                </span>
                                <span className="block font-mono text-sm font-bold text-neutral-900 sm:text-base dark:text-white">
                                  {selectedClient === "apex" ? "$34,850.00" : "$52,400.00"}
                                </span>
                              </div>
                              <span className="bg-primary/10 border-primary/20 text-primary rounded-md border px-2 py-0.5 text-[9.5px] font-semibold">
                                Auto-renews Q4
                              </span>
                            </div>
                            <div className="pt-0.5">
                              <span className="block pb-0.5 text-[8.5px] text-neutral-500 dark:text-neutral-400">
                                6-Month Retainer Trajectory
                              </span>
                              <svg
                                className="text-primary h-8 w-full overflow-visible"
                                viewBox="0 0 240 32"
                                aria-hidden="true"
                              >
                                <defs>
                                  <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                                    <stop
                                      offset="100%"
                                      stopColor="currentColor"
                                      stopOpacity="0.0"
                                    />
                                  </linearGradient>
                                </defs>
                                <path
                                  d="M0,28 Q40,24 80,18 T160,10 T240,4 L240,32 L0,32 Z"
                                  fill="url(#sparkline-grad)"
                                />
                                <path
                                  d="M0,28 Q40,24 80,18 T160,10 T240,4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <circle cx="0" cy="28" r="2.5" className="fill-primary" />
                                <circle cx="80" cy="18" r="2.5" className="fill-primary" />
                                <circle cx="160" cy="10" r="2.5" className="fill-primary" />
                                <circle cx="240" cy="4" r="3.5" className="fill-emerald-500" />
                              </svg>
                              <div className="flex items-center justify-between pt-0.5 font-mono text-[8.5px] text-neutral-500 dark:text-neutral-400">
                                <span>Month 1: $12k</span>
                                <span>
                                  Month 6: {selectedClient === "apex" ? "$34.8k" : "$52.4k"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tab 3: Real-Time Activity Stream */}
                        {activeCrmTab === "activity" && (
                          <div className="dark:hover:bg-neutral-850/90 cursor-pointer space-y-1.5 rounded-lg border border-neutral-200/90 bg-white/95 p-2 text-[10.5px] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:bg-neutral-50/90 hover:shadow-md dark:border-white/10 dark:bg-neutral-900/90">
                            <div className="flex items-start gap-2 border-b border-neutral-200/60 pb-1 dark:border-white/10">
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                              <div>
                                <p className="text-[11px] font-medium text-neutral-900 dark:text-white">
                                  Q3 Deliverable Approved
                                </p>
                                <span className="text-[9.5px] text-neutral-500 dark:text-neutral-400">
                                  Today at 09:15 AM &bull; Sarah Chen
                                </span>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                              <div>
                                <p className="text-[11px] font-medium text-neutral-900 dark:text-white">
                                  Invoice #FP-10892 settled
                                </p>
                                <span className="text-[9.5px] text-neutral-500 dark:text-neutral-400">
                                  Yesterday &bull; Stripe Transfer
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1 border-t border-neutral-200/60 pt-1.5 text-[9.5px] text-neutral-500 dark:border-white/10 dark:text-neutral-400">
                    <span className="truncate">5 active communication threads</span>
                    <span className="shrink-0 font-semibold text-emerald-600 dark:text-emerald-400">
                      &bull; Unified Dossier
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Telemetry Feature Chips */}
              <div
                style={{ transform: shouldReduceMotion ? "none" : "translateZ(14px)" }}
                className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-neutral-200/80 pt-3 text-[11px] font-medium sm:gap-2 sm:text-xs dark:border-white/10"
              >
                <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100/80 px-2 py-1 text-neutral-800 sm:px-2.5 dark:border-white/10 dark:bg-neutral-800/80 dark:text-neutral-200">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />{" "}
                  Tenant-Isolated Records
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100/80 px-2 py-1 text-neutral-600 sm:px-2.5 dark:border-white/10 dark:bg-neutral-800/80 dark:text-neutral-300">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />{" "}
                  Direct Booking Conversion
                </span>
              </div>
            </div>
          </BentoCard>

          {/* ======================================================================= */}
          {/* CARD 4: INVOICING & BILLING (BENTO 7 COLS)                              */}
          {/* ======================================================================= */}
          <BentoCard
            className="lg:col-span-7"
            themeAccent="emerald"
            moduleId="MODULE-04 // CASHFLOW ENGINE"
            moduleStatus="Stripe: Connected (Testmode)"
          >
            <div className="flex h-full flex-col justify-between">
              <div>
                {/* Module Category Ribbon & Currency Switcher */}
                <div
                  style={{ transform: shouldReduceMotion ? "none" : "translateZ(22px)" }}
                  className="flex flex-wrap items-center justify-between gap-3 pb-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 shadow-xs dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-500/5 text-xs font-semibold text-neutral-900 dark:border-emerald-400/30 dark:text-neutral-100"
                      >
                        Invoicing &amp; Billing
                      </Badge>
                      <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                        Automated Billing &amp; Instant Reconciliation
                      </p>
                    </div>
                  </div>

                  {/* Multi-Currency Dynamic Switcher */}
                  <div
                    role="radiogroup"
                    aria-label="Select billing currency"
                    className="flex items-center rounded-lg border border-neutral-200/90 bg-neutral-100/80 p-1 text-xs dark:border-white/10 dark:bg-neutral-800/80"
                  >
                    <span className="pr-1 pl-1.5 text-[10px] font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                      Currency:
                    </span>
                    {(["USD", "EUR", "GBP", "BDT"] as const).map((curr) => {
                      const isSelected = currency === curr;
                      return (
                        <button
                          key={curr}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setCurrency(curr)}
                          className="focus-visible:ring-primary relative cursor-pointer rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
                        >
                          {isSelected && (
                            <motion.span
                              layoutId={shouldReduceMotion ? undefined : "active-currency-pill"}
                              transition={{ type: "spring", stiffness: 500, damping: 35 }}
                              className="absolute inset-0 rounded-md border border-neutral-200 bg-white text-neutral-900 shadow-xs dark:border-white/10 dark:bg-neutral-700 dark:text-white"
                            />
                          )}
                          <span
                            className={`relative z-10 transition-colors ${
                              isSelected
                                ? "font-bold text-neutral-900 dark:text-white"
                                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                            }`}
                          >
                            {curr}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <h3 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                  Appointment-Linked Invoicing &amp; Cash Flow Control
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                  Convert completed service hours into itemized, professional invoices and collect
                  payments online with instant reconciliation.
                </p>

                {/* INVOICE SETTLEMENT TERMINAL CANVAS */}
                <div
                  style={{ transform: shouldReduceMotion ? "none" : "translateZ(16px)" }}
                  className="relative mt-4.5 flex min-h-[290px] flex-col justify-between overflow-hidden rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-3.5 shadow-inner sm:p-4 dark:border-white/10 dark:bg-black/40"
                >
                  <div>
                    {/* 4-Step Lifecycle Pipeline Track */}
                    <div className="grid grid-cols-2 gap-2 border-b border-neutral-200/80 pb-3 text-[11px] sm:grid-cols-4 sm:text-xs dark:border-white/10">
                      <div className="flex min-w-0 cursor-default items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1.5 font-semibold text-emerald-600 transition-all duration-200 hover:scale-[1.03] hover:shadow-xs sm:px-2.5 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">1. Delivered</span>
                      </div>

                      <div className="flex min-w-0 cursor-default items-center gap-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-1.5 font-semibold text-blue-600 transition-all duration-200 hover:scale-[1.03] hover:shadow-xs sm:px-2.5 dark:text-blue-400">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">2. 20h Logged</span>
                      </div>

                      <div className="bg-primary/10 border-primary/20 text-primary flex min-w-0 cursor-default items-center gap-1.5 rounded-md border px-2 py-1.5 font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-xs sm:px-2.5">
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">3. #FP-10892</span>
                      </div>

                      <div
                        className={`flex min-w-0 cursor-default items-center gap-1.5 rounded-md px-2 py-1.5 font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-xs sm:px-2.5 ${
                          isSettled
                            ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "border-neutral-200 bg-neutral-100 text-neutral-500 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}
                      >
                        <CreditCard className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {isSettled ? (
                            "4. Deposited"
                          ) : (
                            <>
                              <span className="hidden sm:inline">4. Deposit Ready</span>
                              <span className="sm:hidden">4. Ready</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Line Item Card with High Financial Fidelity */}
                    <motion.div
                      layout={!shouldReduceMotion}
                      className={`dark:hover:bg-neutral-850/90 mt-3 flex cursor-pointer flex-col justify-between gap-2 rounded-lg border p-2.5 text-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:bg-neutral-50/90 hover:shadow-md sm:flex-row sm:items-center sm:p-3 ${
                        isSettled
                          ? "border-emerald-500/40 bg-emerald-500/10 dark:border-emerald-500/40 dark:bg-emerald-500/15"
                          : "border-neutral-200/90 bg-white/95 shadow-xs dark:border-white/10 dark:bg-neutral-900/90"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <p className="truncate font-semibold text-neutral-900 dark:text-white">
                            Monthly Strategic Advisory Retainer
                          </p>
                          {isSettled ? (
                            <span className="shrink-0 rounded-md border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                              Reconciled
                            </span>
                          ) : (
                            <span className="shrink-0 rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[9px] text-neutral-600 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-400">
                              DRAFT
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[10px] text-neutral-500 dark:text-neutral-400">
                          20 verified hours @ {activeCurrencyConfig.symbol}
                          {activeCurrencyConfig.hourly.toLocaleString()}/hr &bull; Apex Solutions
                        </p>
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        <span className="block font-mono text-sm font-bold text-neutral-900 sm:text-base dark:text-white">
                          {activeCurrencyConfig.formatted}
                        </span>
                        <span className="block text-[9.5px] text-neutral-500 dark:text-neutral-400">
                          Net 0% Dispute &bull; Instant Settlement
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Interactive Instant Settlement Button */}
                  <div className="mt-3 flex flex-col justify-between gap-2.5 border-t border-neutral-200/80 pt-2 sm:flex-row sm:items-center dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        One-Click Cash Flow:
                      </span>
                      {isSettled && (
                        <button
                          type="button"
                          onClick={() => setIsSettled(false)}
                          className="focus-visible:ring-primary flex cursor-pointer items-center gap-1 text-[10px] font-medium text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:outline-hidden dark:text-neutral-400 dark:hover:text-white"
                        >
                          <RefreshCw className="h-2.5 w-2.5" />
                          Reset Simulation
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSettled((prev) => !prev)}
                      className={`focus-visible:ring-primary relative inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold shadow-xs transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-[0.98] sm:w-auto ${
                        isSettled
                          ? "bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700"
                          : "bg-primary hover:bg-primary-hover shadow-primary/25 text-white"
                      }`}
                    >
                      {isSettled ? (
                        <>
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>Settled via Stripe Connect</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-3.5 w-3.5" />
                          <span>Simulate 1-Click Settlement</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Stamp Badge on Settlement */}
                  <AnimatePresence>
                    {isSettled && (
                      <motion.div
                        initial={shouldReduceMotion ? false : { scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                        className="pointer-events-none absolute top-3 right-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 shadow-sm backdrop-blur-md motion-reduce:!transform-none motion-reduce:!opacity-100 sm:px-3 sm:py-1.5"
                      >
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3.5 w-3.5 stroke-[2.5] sm:h-4 sm:w-4" />
                          <span className="font-mono text-[10px] font-bold tracking-wider uppercase sm:text-xs">
                            PAID &amp; RECONCILED
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom Telemetry Feature Chips */}
              <div
                style={{ transform: shouldReduceMotion ? "none" : "translateZ(14px)" }}
                className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-neutral-200/80 pt-3 text-[11px] font-medium sm:gap-2 sm:text-xs dark:border-white/10"
              >
                <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100/80 px-2 py-1 text-neutral-800 sm:px-2.5 dark:border-white/10 dark:bg-neutral-800/80 dark:text-neutral-200">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />{" "}
                  1-Click Appointment-to-Invoice
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100/80 px-2 py-1 text-neutral-600 sm:px-2.5 dark:border-white/10 dark:bg-neutral-800/80 dark:text-neutral-300">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />{" "}
                  Itemized Taxes &amp; Line Items
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100/80 px-2 py-1 text-neutral-600 sm:px-2.5 dark:border-white/10 dark:bg-neutral-800/80 dark:text-neutral-300">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />{" "}
                  Multi-Currency Settlement
                </span>
              </div>
            </div>
          </BentoCard>
        </div>
      </Container>
    </section>
  );
};
