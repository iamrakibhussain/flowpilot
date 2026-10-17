"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Eye,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
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
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";

/**
 * 3D Spatial Glass Card Container with Mouse Parallax & Specular Rim Light
 */
interface SpatialGlassCardProps {
  children: React.ReactNode;
  glowColor?: string;
  className?: string;
}

const SpatialGlassCard: React.FC<SpatialGlassCardProps> = ({
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

      {/* 3D Tilting Glass Card */}
      <div
        style={{
          transform:
            shouldReduceMotion || !isHovered
              ? "none"
              : `rotateY(${mousePos.x * 5}deg) rotateX(${-mousePos.y * 5}deg) translateZ(8px)`,
          transition: "transform 0.16s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
        className="group border-border/80 bg-surface/90 hover:border-primary/40 relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md sm:p-8"
      >
        {/* Specular Rim Highlight Light Beam */}
        <div
          className="pointer-events-none absolute inset-x-8 top-0 z-20 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/25 to-transparent transition-opacity duration-300 group-hover:via-white dark:group-hover:via-white/50"
          aria-hidden="true"
        />

        {/* Dynamic Cursor Spotlight Glare */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(400px circle at ${(mousePos.x + 0.5) * 100}% ${(mousePos.y + 0.5) * 100}%, rgba(255, 255, 255, 0.1), transparent 60%)`,
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between">{children}</div>
      </div>
    </div>
  );
};

export const BusinessBenefitsSection: React.FC = () => {
  // Card 1: Single Source of Truth Switcher ("chaos" vs "flowpilot")
  const [sourceMode, setSourceMode] = React.useState<"chaos" | "flowpilot">("flowpilot");

  // Card 2: Team Capacity Optimizer
  const [selectedStaff, setSelectedStaff] = React.useState<"sarah" | "marcus" | "elena">("sarah");
  const [capacityMode, setCapacityMode] = React.useState<"unprotected" | "optimal">("optimal");

  // Card 3: Days Sales Outstanding (DSO) Model
  const [dsoModel, setDsoModel] = React.useState<"traditional" | "flowpilot">("flowpilot");

  // Card 4: Governance Role Lens & Interactive Billable Rate Slider
  const [governanceRole, setGovernanceRole] = React.useState<"staff" | "partner">("partner");
  const [billableRate, setBillableRate] = React.useState<number>(250);

  // Bottom ROI Interactive Calculator State
  const [teamSize, setTeamSize] = React.useState<number>(6);

  // Calculation Math for Card 4
  const staffCost = 120;
  const grossMargin = billableRate - staffCost;
  const marginPercentage = Math.round((grossMargin / billableRate) * 100);
  const monthlyProfitPerSeat = grossMargin * 160;

  // Calculation Math for ROI Calculator
  const hoursSavedMonthly = Math.round(teamSize * 18.5);
  const valueRecoveredMonthly = teamSize * 2750;

  return (
    <section id="benefits" className="relative scroll-mt-20 overflow-hidden py-20 md:py-28">
      {/* Background Holographic Glow Mesh */}
      <div
        className="from-primary/10 pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-[650px] w-full max-w-6xl rounded-full bg-gradient-to-tr via-indigo-500/10 to-emerald-400/10 opacity-70 blur-3xl"
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
            <span>Business Benefits</span>
          </Badge>

          <h2 className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Measurable Clarity for Owners and Operations Leads
          </h2>

          <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
            Translating unified platform capabilities into day-to-day operational advantages.
            Explore the tangible ROI metrics below.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* INVERTED 12-COLUMN 3D BENTO IMPACT GRID */}
        {/* ========================================================================= */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ======================================================================= */}
          {/* CARD 1: SINGLE OPERATIONAL SOURCE OF TRUTH (HERO 7 COLS) */}
          {/* ======================================================================= */}
          <SpatialGlassCard className="lg:col-span-7" glowColor="rgba(49, 95, 232, 0.25)">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary shadow-xs ring-1 ring-primary/20">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 text-primary text-xs font-semibold"
                    >
                      Holistic Clarity
                    </Badge>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Operational Efficiency
                    </p>
                  </div>
                </div>

                {/* Tactile Mode Switcher with Sliding Spring Pill */}
                <div className="border-border/70 bg-background/90 flex items-center rounded-full border p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setSourceMode("chaos")}
                    className="relative rounded-full px-3 py-1 text-xs font-bold transition-colors"
                  >
                    {sourceMode === "chaos" && (
                      <motion.span
                        layoutId="active-source-mode-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-rose-500 shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors ${
                        sourceMode === "chaos"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Fragmented Tools
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSourceMode("flowpilot")}
                    className="relative rounded-full px-3 py-1 text-xs font-bold transition-colors"
                  >
                    {sourceMode === "flowpilot" && (
                      <motion.span
                        layoutId="active-source-mode-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="bg-primary absolute inset-0 rounded-full shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors ${
                        sourceMode === "flowpilot"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      FlowPilot Engine
                    </span>
                  </button>
                </div>
              </div>

              <h3 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Single Operational Source of Truth
              </h3>

              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Eliminate the confusion of switching between fragmented spreadsheet tabs, messaging
                apps, and disconnected calendar links. In FlowPilot, customer dossiers, booking
                timelines, staff assignments, and invoice balances are unified in one coherent
                workspace.
              </p>

              {/* Dynamic Living Orbital Architecture vs Chaos Web Canvas */}
              <div className="border-border/80 bg-background/95 relative mt-6 min-h-[190px] overflow-hidden rounded-2xl border p-4.5 shadow-sm">
                <div
                  className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent"
                  aria-hidden="true"
                />
                <AnimatePresence mode="wait">
                  {sourceMode === "chaos" ? (
                    <motion.div
                      key="chaos-view"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3.5"
                    >
                      <div className="flex items-center justify-between border-b pb-2.5 text-xs font-bold text-rose-600">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 animate-bounce text-rose-500" />
                          <span>Status Quo: Tangled Web of Disconnected Apps</span>
                        </span>
                        <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-rose-600">
                          -18.5 hrs/wk Lost
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-4">
                        <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center">
                          <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-rose-300/40 to-transparent" />
                          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/15 text-rose-500 shadow-2xs">
                            <FileSpreadsheet className="h-4 w-4" />
                          </div>
                          <span className="text-foreground mt-1.5 block text-xs font-bold">
                            14 Sheets Tabs
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            Stale Rate Cards
                          </span>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center">
                          <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-rose-300/40 to-transparent" />
                          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/15 text-rose-500 shadow-2xs">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <span className="text-foreground mt-1.5 block text-xs font-bold">
                            Calendly Overlaps
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            No Buffer Protection
                          </span>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center">
                          <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-rose-300/40 to-transparent" />
                          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/15 text-rose-500 shadow-2xs">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <span className="text-foreground mt-1.5 block text-xs font-bold">
                            Scattered Slack
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            Lost Customer Memos
                          </span>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center">
                          <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-rose-300/40 to-transparent" />
                          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/15 text-rose-500 shadow-2xs">
                            <Mail className="h-4 w-4" />
                          </div>
                          <span className="text-foreground mt-1.5 block text-xs font-bold">
                            Manual Email
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            Unbilled Sessions
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
                        <span>⚠️ High operational overhead and manual reconciliation friction</span>
                        <span className="font-mono text-[10px] font-bold">Data Drift</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="flowpilot-view"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3.5"
                    >
                      <div className="flex items-center justify-between border-b pb-2.5 text-xs font-bold text-emerald-600">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>The FlowPilot Core: Centralized Command Engine</span>
                        </span>
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-emerald-600">
                          +18.5 hrs/wk Reclaimed
                        </span>
                      </div>

                      {/* 3-Spoke Orbital Synchronization Diagram */}
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="border-border/80 bg-surface relative overflow-hidden rounded-xl border p-3 text-center">
                          <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
                          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/25 bg-gradient-to-br from-blue-500/20 to-blue-500/5 text-blue-600 shadow-2xs">
                            <Users className="h-4 w-4" />
                          </div>
                          <span className="text-foreground mt-1.5 block text-xs font-bold">
                            Living CRM Dossier
                          </span>
                          <span className="font-mono text-[10px] font-bold text-emerald-600">
                            100% Retained
                          </span>
                        </div>

                        <div className="border-border/80 bg-surface relative overflow-hidden rounded-xl border p-3 text-center">
                          <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
                          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/25 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-600 shadow-2xs">
                            <Clock className="h-4 w-4" />
                          </div>
                          <span className="text-foreground mt-1.5 block text-xs font-bold">
                            Calm Service Calendars
                          </span>
                          <span className="font-mono text-[10px] font-bold text-emerald-600">
                            +15m Buffer Shield
                          </span>
                        </div>

                        <div className="border-border/80 bg-surface relative overflow-hidden rounded-xl border p-3 text-center">
                          <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
                          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/25 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 text-cyan-600 shadow-2xs">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <span className="text-foreground mt-1.5 block text-xs font-bold">
                            Stripe Connect Ledger
                          </span>
                          <span className="font-mono text-[10px] font-bold text-emerald-600">
                            1-Click Settlement
                          </span>
                        </div>
                      </div>

                      <div className="border-border/60 flex items-center justify-between rounded-xl border bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-emerald-500" />
                          <span>
                            All client interaction, booking schedules, and invoices live in one
                            isolated shard
                          </span>
                        </span>
                        <span className="font-mono text-[10px] font-bold">0 Tab Switches</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Quick Feature Pills */}
            <div className="border-border/60 mt-6 flex flex-wrap items-center gap-2 border-t pt-4 text-xs font-semibold">
              <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1">
                <Check className="h-3.5 w-3.5" /> Zero lost client context
              </span>
              <span className="bg-surface text-foreground/85 border-border/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <Check className="text-primary h-3.5 w-3.5" /> Immediate staff onboarding
              </span>
              <span className="bg-surface text-foreground/85 border-border/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <Check className="text-primary h-3.5 w-3.5" /> Single unified audit log
              </span>
            </div>
          </SpatialGlassCard>

          {/* ======================================================================= */}
          {/* CARD 2: SYNCHRONIZED TEAM CAPACITY (5 COLS) */}
          {/* ======================================================================= */}
          <SpatialGlassCard className="lg:col-span-5" glowColor="rgba(16, 185, 129, 0.25)">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 text-emerald-600 shadow-xs ring-1 ring-emerald-500/20">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-600"
                    >
                      Capacity Balance
                    </Badge>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Burnout Prevention
                    </p>
                  </div>
                </div>

                {/* Tactile Capacity Optimizer Switcher */}
                <div className="border-border/70 bg-background/90 flex items-center rounded-full border p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setCapacityMode("unprotected")}
                    className="relative rounded-full px-2.5 py-1 text-xs font-bold transition-colors"
                  >
                    {capacityMode === "unprotected" && (
                      <motion.span
                        layoutId="active-capacity-mode-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-rose-500 shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 text-[11px] transition-colors ${
                        capacityMode === "unprotected"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Unprotected
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCapacityMode("optimal")}
                    className="relative rounded-full px-2.5 py-1 text-xs font-bold transition-colors"
                  >
                    {capacityMode === "optimal" && (
                      <motion.span
                        layoutId="active-capacity-mode-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-emerald-600 shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 text-[11px] transition-colors ${
                        capacityMode === "optimal"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      FlowPilot Guard
                    </span>
                  </button>
                </div>
              </div>

              <h3 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Synchronized Team Capacity
              </h3>

              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Clear visibility into team availability and appointment durations prevents
                accidental double-booking. Built-in buffer intervals protect team recovery time and
                ensure high-quality client deliverables without burnout.
              </p>

              {/* 3D Visual Weekly Schedule Matrix & Buffer Shield */}
              <div className="border-border/80 bg-background/95 relative mt-6 overflow-hidden rounded-2xl border p-4.5 shadow-sm">
                <div
                  className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent"
                  aria-hidden="true"
                />
                {/* Consultant Selector */}
                <div className="flex items-center justify-between border-b pb-2.5 text-xs">
                  <span className="text-foreground font-bold">Consultant Workload:</span>
                  <div className="flex items-center gap-1.5">
                    {(["sarah", "marcus", "elena"] as const).map((member) => (
                      <button
                        key={member}
                        type="button"
                        onClick={() => setSelectedStaff(member)}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold capitalize transition-colors ${
                          selectedStaff === member
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {member}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5-Day Visual Schedule Strip */}
                <div className="mt-3 grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold">
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, idx) => (
                    <div
                      key={day}
                      className={`rounded-lg border p-1.5 ${
                        idx === 2 || idx === 3
                          ? capacityMode === "optimal"
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-rose-500/40 bg-rose-500/10 text-rose-600"
                          : "border-border/70 bg-surface text-foreground"
                      }`}
                    >
                      <span className="block">{day}</span>
                      <span className="font-mono text-[9px] opacity-80">
                        {capacityMode === "optimal" ? "3 calls" : "6 calls!"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Live Capacity Gauge */}
                <div className="mt-3.5 space-y-2 border-t pt-2.5 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-foreground font-semibold">
                      {selectedStaff === "sarah"
                        ? "Sarah Chen (Principal)"
                        : selectedStaff === "marcus"
                          ? "Marcus Vance (Architect)"
                          : "Elena Rostova (Senior Consultant)"}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        capacityMode === "optimal" ? "text-emerald-600" : "text-rose-500"
                      }`}
                    >
                      {capacityMode === "optimal"
                        ? selectedStaff === "sarah"
                          ? "78% [Optimal]"
                          : selectedStaff === "marcus"
                            ? "65% [Available]"
                            : "72% [Balanced]"
                        : "96% [Critical Overload]"}
                    </span>
                  </div>

                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <motion.div
                      className={`h-full rounded-full ${
                        capacityMode === "optimal" ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                      animate={{
                        width:
                          capacityMode === "optimal"
                            ? selectedStaff === "sarah"
                              ? "78%"
                              : selectedStaff === "marcus"
                                ? "65%"
                                : "72%"
                            : "96%",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="border-border/50 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2 text-[10px]">
                  <span>
                    {capacityMode === "optimal"
                      ? "✓ +15m Auto-Buffers Guarding Calendar"
                      : "⚠️ 0m rest gaps between back-to-back calls"}
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {capacityMode === "optimal" ? "0 Overlaps" : "High Friction"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Feature Pills */}
            <div className="border-border/60 mt-6 flex flex-wrap items-center gap-2 border-t pt-4 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-600">
                <Check className="h-3.5 w-3.5" /> Protected staff buffer intervals
              </span>
              <span className="bg-surface text-foreground/85 border-border/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> 94% On-time delivery rate
              </span>
            </div>
          </SpatialGlassCard>

          {/* ======================================================================= */}
          {/* CARD 3: ACCELERATED CASH FLOW CYCLE (5 COLS - INVERTED CADENCE) */}
          {/* ======================================================================= */}
          <SpatialGlassCard className="lg:col-span-5" glowColor="rgba(6, 182, 212, 0.25)">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-cyan-500/5 text-cyan-600 shadow-xs ring-1 ring-cyan-500/20">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="border-cyan-500/30 bg-cyan-500/10 text-xs font-semibold text-cyan-600"
                    >
                      Prompt Settlement
                    </Badge>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Cashflow Liquidity
                    </p>
                  </div>
                </div>

                {/* Tactile DSO Model Switcher */}
                <div className="border-border/70 bg-background/90 flex items-center rounded-full border p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setDsoModel("traditional")}
                    className="relative rounded-full px-2.5 py-1 text-xs font-bold transition-colors"
                  >
                    {dsoModel === "traditional" && (
                      <motion.span
                        layoutId="active-dso-model-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-amber-500 shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 text-[11px] transition-colors ${
                        dsoModel === "traditional"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Standard (38d)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDsoModel("flowpilot")}
                    className="relative rounded-full px-2.5 py-1 text-xs font-bold transition-colors"
                  >
                    {dsoModel === "flowpilot" && (
                      <motion.span
                        layoutId="active-dso-model-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-cyan-600 shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 text-[11px] transition-colors ${
                        dsoModel === "flowpilot"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      FlowPilot (2.4d)
                    </span>
                  </button>
                </div>
              </div>

              <h3 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Accelerated Cash Flow Cycle
              </h3>

              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                When completed appointments immediately convert into structured invoices, billing
                delays vanish. Clients receive itemized statements reflecting their actual service
                history, significantly reducing payment inquiries.
              </p>

              {/* 3D Visual DSO Liquidity Waterfall */}
              <div className="border-border/80 bg-background/95 relative mt-6 overflow-hidden rounded-2xl border p-4.5 shadow-sm">
                <div
                  className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent"
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between border-b pb-2.5 text-xs font-bold">
                  <span className="text-foreground">Capital Settlement Velocity</span>
                  <span className="font-mono text-[11px] text-cyan-600">
                    {dsoModel === "flowpilot" ? "14.2x Faster Payouts" : "38 Days Delayed"}
                  </span>
                </div>

                <div className="mt-3.5 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-surface border-border/70 relative overflow-hidden rounded-xl border p-3">
                    <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
                    <span className="text-muted-foreground block text-[10px] font-medium">
                      Days to Bank
                    </span>
                    <span
                      className={`font-mono text-xl font-black ${
                        dsoModel === "flowpilot" ? "text-emerald-600" : "text-amber-500"
                      }`}
                    >
                      {dsoModel === "flowpilot" ? "2.4 Days" : "38 Days"}
                    </span>
                  </div>

                  <div className="bg-surface border-border/70 relative overflow-hidden rounded-xl border p-3">
                    <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
                    <span className="text-muted-foreground block text-[10px] font-medium">
                      Dispute Rate
                    </span>
                    <span className="text-foreground font-mono text-xl font-black">
                      {dsoModel === "flowpilot" ? "0.2%" : "8.4%"}
                    </span>
                  </div>
                </div>

                {/* Live Working Capital Floating Pill */}
                <div className="mt-3 rounded-xl bg-cyan-500/10 p-2.5 text-center text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                  <span>
                    {dsoModel === "flowpilot"
                      ? "⚡ +$14,250 Immediate Working Capital Unlocked"
                      : "⏳ $14,250 Locked in Accounts Receivable"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Feature Pills */}
            <div className="border-border/60 mt-6 flex flex-wrap items-center gap-2 border-t pt-4 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-600">
                <Check className="h-3.5 w-3.5" /> Frictionless invoice creation
              </span>
              <span className="bg-surface text-foreground/85 border-border/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <Check className="h-3.5 w-3.5 text-cyan-500" /> Direct Stripe settlement
              </span>
            </div>
          </SpatialGlassCard>

          {/* ======================================================================= */}
          {/* CARD 4: GRANULAR OPERATIONAL GOVERNANCE (HERO 7 COLS) */}
          {/* ======================================================================= */}
          <SpatialGlassCard className="lg:col-span-7" glowColor="rgba(245, 158, 11, 0.25)">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-500/5 text-amber-600 shadow-xs ring-1 ring-amber-500/20">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-xs font-semibold text-amber-600"
                    >
                      Governance
                    </Badge>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Enterprise Privacy
                    </p>
                  </div>
                </div>

                {/* Tactile Role Switcher with Spring Pill */}
                <div className="border-border/70 bg-background/90 flex items-center rounded-full border p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setGovernanceRole("staff")}
                    className="relative rounded-full px-3 py-1 text-xs font-bold transition-colors"
                  >
                    {governanceRole === "staff" && (
                      <motion.span
                        layoutId="active-gov-role-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-rose-500 shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors ${
                        governanceRole === "staff"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      View as Staff
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGovernanceRole("partner")}
                    className="relative rounded-full px-3 py-1 text-xs font-bold transition-colors"
                  >
                    {governanceRole === "partner" && (
                      <motion.span
                        layoutId="active-gov-role-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-amber-500 shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors ${
                        governanceRole === "partner"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      View as Partner
                    </span>
                  </button>
                </div>
              </div>

              <h3 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Granular Operational Governance
              </h3>

              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Maintain total confidence as your agency scales. Role-based permissions ensure staff
                members only view assigned customer appointments, while owners and finance leads
                retain exclusive control over organizational billing and rates.
              </p>

              {/* 3D Visual Profit Margin & Interactive Rate Slider Vault */}
              <div className="border-border/80 bg-background/95 relative mt-6 overflow-hidden rounded-2xl border p-4.5 shadow-sm">
                <div
                  className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent"
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 text-xs font-bold">
                  <span className="text-foreground">
                    Interactive Rate Card & Gross Margin Simulator:
                  </span>
                  <span className="font-mono text-[11px] text-amber-600">
                    {governanceRole === "partner"
                      ? "Partner Mode (Full Access)"
                      : "Staff Mode (Masked)"}
                  </span>
                </div>

                {/* Rate Card Slider (Partner Interactive) */}
                <div className="mt-3">
                  <div className="text-muted-foreground flex justify-between text-xs font-semibold">
                    <span>Adjust Billable Rate:</span>
                    <span className="text-foreground font-mono text-sm font-extrabold">
                      ${billableRate}.00 / hr
                    </span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="400"
                    step="10"
                    disabled={governanceRole === "staff"}
                    value={billableRate}
                    onChange={(e) => setBillableRate(Number(e.target.value))}
                    className="accent-primary bg-muted mt-1.5 h-2 w-full cursor-pointer rounded-lg"
                  />
                </div>

                <div className="relative mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="bg-surface border-border/70 relative overflow-hidden rounded-xl border p-3 text-center">
                    <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
                    <span className="text-muted-foreground block text-[10px] font-medium">
                      Client Billable Rate
                    </span>
                    <span className="text-foreground font-mono text-base font-extrabold">
                      ${billableRate}.00 / hr
                    </span>
                  </div>

                  <div className="bg-surface border-border/70 relative overflow-hidden rounded-xl border p-3 text-center">
                    <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
                    <span className="text-muted-foreground block text-[10px] font-medium">
                      Internal Delivery Cost
                    </span>
                    <span className="text-muted-foreground font-mono text-base font-extrabold">
                      $120.00 / hr
                    </span>
                  </div>

                  <div className="bg-surface border-border/70 relative overflow-hidden rounded-xl border p-3 text-center">
                    <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
                    <span className="text-muted-foreground block text-[10px] font-medium">
                      Gross Profit Margin
                    </span>
                    <span className="font-mono text-base font-extrabold text-emerald-600">
                      ${grossMargin}.00 ({marginPercentage}%)
                    </span>
                  </div>

                  {/* Frosted Glass Shutter Overlay for Staff View */}
                  <AnimatePresence>
                    {governanceRole === "staff" && (
                      <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(7px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="bg-background/85 absolute inset-0 flex flex-col items-center justify-center p-4 text-center font-mono text-xs font-bold text-rose-600 backdrop-blur-md"
                      >
                        <Lock className="mb-1 h-5 w-5" />
                        <span>CONFIDENTIAL: Internal Margins & Billing Math Locked</span>
                        <span className="text-muted-foreground mt-1 text-[10px] font-normal">
                          Only assigned delivery tasks are visible to staff
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-border/50 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2.5 text-[10px]">
                  <span>Monthly Projected Margin (160 hrs):</span>
                  <span className="font-mono font-bold text-emerald-600">
                    +${monthlyProfitPerSeat.toLocaleString()} / seat
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Feature Pills */}
            <div className="border-border/60 mt-6 flex flex-wrap items-center gap-3 border-t pt-4 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-amber-600">
                <Check className="h-3.5 w-3.5" /> Confidential rate structures
              </span>
              <span className="bg-surface text-foreground/85 border-border/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <Check className="h-3.5 w-3.5 text-amber-500" /> Audit-ready permission controls
              </span>
              <span className="bg-surface text-foreground/85 border-border/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <Check className="h-3.5 w-3.5 text-amber-500" /> Zero accidental rate leakage
              </span>
            </div>
          </SpatialGlassCard>
        </div>

        {/* ========================================================================= */}
        {/* GAME CHANGER: INTERACTIVE AGENCY ROI & VALUE RECOVERY CONSOLE */}
        {/* ========================================================================= */}
        <div className="border-border/80 bg-surface/90 relative mt-12 overflow-hidden rounded-3xl border p-6 shadow-2xl backdrop-blur-2xl sm:p-10">
          {/* Subtle Top Specular Light Beam */}
          <div
            className="pointer-events-none absolute inset-x-8 top-0 z-20 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/25 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-16 top-0 z-20 h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            aria-hidden="true"
          />

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            {/* Left Header & Slider */}
            <div className="max-w-xl">
              <div className="flex items-center gap-2">
                <div className="from-primary flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br to-indigo-600 text-white shadow-xs">
                  <Calculator className="h-4 w-4" />
                </div>
                <span className="text-foreground font-mono text-xs font-black tracking-wider uppercase">
                  Interactive Agency ROI Calculator
                </span>
              </div>

              <h3 className="text-foreground mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                See How Much Time & Capital FlowPilot Unlocks for You
              </h3>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm">
                Drag the slider to match your team size and see real-time reclaimed capacity.
              </p>

              {/* Slider Controller */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-foreground">Team Size:</span>
                  <span className="from-primary bg-gradient-to-r to-indigo-600 bg-clip-text font-mono text-lg font-black text-transparent">
                    {teamSize} Consultants
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="25"
                  step="1"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="accent-primary bg-muted h-2.5 w-full cursor-pointer rounded-lg"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="text-muted-foreground font-medium">Quick Presets:</span>
                  {[3, 6, 12, 20].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTeamSize(preset)}
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold transition-colors ${
                        teamSize === preset
                          ? "bg-primary text-white"
                          : "bg-surface border-border text-muted-foreground hover:text-foreground border"
                      }`}
                    >
                      {preset} seats
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Live Output Metric Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-1/2">
              <div className="border-border/80 bg-background/90 relative overflow-hidden rounded-2xl border p-4 text-center shadow-xs">
                <div
                  className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent"
                  aria-hidden="true"
                />
                <span className="text-muted-foreground block text-[11px] font-semibold">
                  Hours Saved / Mo
                </span>
                <span className="from-primary mt-1 block bg-gradient-to-r to-indigo-600 bg-clip-text font-mono text-3xl font-black text-transparent">
                  {hoursSavedMonthly} hrs
                </span>
                <span className="text-muted-foreground mt-1 block text-[10px]">
                  In scheduling & admin friction
                </span>
              </div>

              <div className="border-border/80 bg-background/90 relative overflow-hidden rounded-2xl border p-4 text-center shadow-xs">
                <div
                  className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent"
                  aria-hidden="true"
                />
                <span className="text-muted-foreground block text-[11px] font-semibold">
                  Recovered Capital
                </span>
                <span className="mt-1 block font-mono text-3xl font-black text-emerald-600">
                  ${valueRecoveredMonthly.toLocaleString()}
                </span>
                <span className="text-muted-foreground mt-1 block text-[10px]">
                  Unbilled capacity recaptured
                </span>
              </div>

              <div className="border-border/80 bg-background/90 relative overflow-hidden rounded-2xl border p-4 text-center shadow-xs">
                <div
                  className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent"
                  aria-hidden="true"
                />
                <span className="text-muted-foreground block text-[11px] font-semibold">
                  Dispute Rate
                </span>
                <span className="mt-1 block font-mono text-3xl font-black text-blue-600">
                  0% Overlaps
                </span>
                <span className="text-muted-foreground mt-1 block text-[10px]">
                  Guaranteed rest buffer protection
                </span>
              </div>
            </div>
          </div>

          {/* Transparent Operational Estimation Footnote */}
          <p className="border-border/50 text-muted-foreground/75 mt-6 border-t pt-3 text-center text-[11px]">
            * Interactive operational estimation based on ~18.5 hrs/seat of eliminated manual scheduling &amp; billing friction. Actual outcomes vary by business model and service structure.
          </p>
        </div>
      </Container>
    </section>
  );
};
