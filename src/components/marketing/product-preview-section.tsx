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
  Activity,
  Video,
  Zap,
  Lock,
  CreditCard,
  Building2,
  Play,
  Pause,
  Sun,
  Moon,
  AlertTriangle,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PreviewTab = "scheduling" | "crm" | "invoicing" | "security";
type StudioTheme = "light" | "cyber";

const AnimatedAmount: React.FC<{
  amountUsd: number;
  currency: "USD" | "EUR" | "GBP";
  decimals?: number;
}> = ({ amountUsd, currency, decimals = 0 }) => {
  const multipliers = { USD: 1, EUR: 0.92, GBP: 0.79 };
  const symbols = { USD: "$", EUR: "€", GBP: "£" };
  const target = amountUsd * multipliers[currency];
  const [val, setVal] = React.useState(target);
  const valRef = React.useRef(target);

  React.useEffect(() => {
    const current = valRef.current;
    const diff = target - current;
    if (Math.abs(diff) < 0.01) return;

    const start = performance.now();
    const duration = 500;

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
      {symbols[currency]}
      {val.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
};

export const ProductPreviewSection: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<PreviewTab>("scheduling");
  const [bufferMinutes, setBufferMinutes] = React.useState<0 | 15 | 30>(15);
  const [selectedClient, setSelectedClient] = React.useState<"apex" | "meridian" | "kinetic">(
    "apex"
  );
  const [invoiceSettled, setInvoiceSettled] = React.useState(false);
  const [breachTested, setBreachTested] = React.useState(false);
  const [currency, setCurrency] = React.useState<"USD" | "EUR" | "GBP">("USD");
  const [studioTheme, setStudioTheme] = React.useState<StudioTheme>("light");
  const [isAutoTourRunning, setIsAutoTourRunning] = React.useState(false);

  const stageRef = React.useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  // Mouse Parallax Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Auto-Tour Sequence Simulator
  React.useEffect(() => {
    if (!isAutoTourRunning) return;

    const tourSteps: PreviewTab[] = ["scheduling", "crm", "invoicing", "security"];
    let stepIndex = 0;

    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % tourSteps.length;
      const nextTab = tourSteps[stepIndex];
      if (nextTab) {
        setActiveTab(nextTab);
      }

      if (stepIndex === 0) {
        setBufferMinutes((prev) => (prev === 15 ? 30 : 15));
      } else if (stepIndex === 1) {
        setSelectedClient((prev) => (prev === "apex" ? "meridian" : "apex"));
      } else if (stepIndex === 2) {
        setInvoiceSettled(true);
      } else if (stepIndex === 3) {
        setBreachTested(true);
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [isAutoTourRunning]);

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  const currencyMultipliers = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
  };

  const formatCurrency = (usdVal: number) => {
    const converted = usdVal * currencyMultipliers[currency];
    return `${currencySymbols[currency]}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const isCyber = studioTheme === "cyber";

  return (
    <section
      id="preview"
      className="border-border/70 bg-muted/20 relative scroll-mt-20 overflow-hidden border-t py-16 md:py-24"
    >
      {/* Secondary anchor for features navigation */}
      <span id="features" className="absolute -top-24" aria-hidden="true" />

      {/* Holographic Ambient Mesh Glow behind section */}
      <div
        className="from-primary/15 pointer-events-none absolute inset-x-0 top-1/4 -z-10 mx-auto h-[550px] w-full max-w-6xl animate-pulse rounded-full bg-gradient-to-tr via-cyan-400/15 to-indigo-600/15 opacity-70 blur-3xl"
        aria-hidden="true"
      />

      <Container>
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary px-3.5 py-1 text-xs font-semibold backdrop-blur-xl"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              <span>Product Experience Preview</span>
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
          >
            The Calm Operations Engine in Living 3D
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg"
          >
            Experience FlowPilot&apos;s real operational flow—intelligent buffer timelines, client
            intelligence dossiers, instant Stripe settlement terminals, and multi-tenant
            cryptographic security.
          </motion.p>
        </div>

        {/* Dynamic Island Capsule Switcher & Studio Tools Bar */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          {/* 4 Mode Tabs */}
          <div
            className="border-border/80 bg-surface/90 relative inline-flex flex-wrap items-center justify-center gap-1 overflow-hidden rounded-2xl border p-1.5 shadow-md backdrop-blur-2xl sm:rounded-full"
            role="tablist"
            aria-label="Interactive Studio Modes"
          >
            {/* Top Specular Rim Light */}
            <div
              className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
              aria-hidden="true"
            />
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "scheduling"}
              onClick={() => {
                setActiveTab("scheduling");
                setIsAutoTourRunning(false);
              }}
              className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                activeTab === "scheduling"
                  ? "text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeTab === "scheduling" && (
                <motion.div
                  layoutId="studio-island-pill"
                  className="border-primary/30 bg-primary/15 absolute inset-0 rounded-full border"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Calendar className="relative z-10 h-4 w-4" />
              <span className="relative z-10">Smart Scheduling</span>
              <span className="relative z-10 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                0 Collisions
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "crm"}
              onClick={() => {
                setActiveTab("crm");
                setIsAutoTourRunning(false);
              }}
              className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                activeTab === "crm"
                  ? "text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeTab === "crm" && (
                <motion.div
                  layoutId="studio-island-pill"
                  className="border-primary/30 bg-primary/15 absolute inset-0 rounded-full border"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Users className="relative z-10 h-4 w-4" />
              <span className="relative z-10">Client CRM 360°</span>
              <span className="relative z-10 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                98% Health
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "invoicing"}
              onClick={() => {
                setActiveTab("invoicing");
                setIsAutoTourRunning(false);
              }}
              className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                activeTab === "invoicing"
                  ? "text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeTab === "invoicing" && (
                <motion.div
                  layoutId="studio-island-pill"
                  className="border-primary/30 bg-primary/15 absolute inset-0 rounded-full border"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <CreditCard className="relative z-10 h-4 w-4" />
              <span className="relative z-10">Invoice Terminal</span>
              <span className="relative z-10 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                Stripe Live
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "security"}
              onClick={() => {
                setActiveTab("security");
                setIsAutoTourRunning(false);
              }}
              className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                activeTab === "security"
                  ? "text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeTab === "security" && (
                <motion.div
                  layoutId="studio-island-pill"
                  className="border-primary/30 bg-primary/15 absolute inset-0 rounded-full border"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <ShieldCheck className="relative z-10 h-4 w-4" />
              <span className="relative z-10">Security Topology</span>
              <span className="relative z-10 rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-600">
                AES-256
              </span>
            </button>
          </div>

          {/* Quick Studio Deck Controls: Auto-Tour & Dark Lens Switcher */}
          <div className="flex items-center gap-2">
            {/* Auto-Tour Toggle */}
            <button
              type="button"
              onClick={() => setIsAutoTourRunning((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold shadow-xs transition-all ${
                isAutoTourRunning
                  ? "animate-pulse border-emerald-500 bg-emerald-500/15 text-emerald-600"
                  : "border-border/80 bg-surface/90 text-foreground hover:border-primary/40 hover:bg-muted/80"
              }`}
              title="Play automated guided walk-through of the operational suite"
            >
              {isAutoTourRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>Pause Tour</span>
                </>
              ) : (
                <>
                  <Play className="text-primary h-3.5 w-3.5 fill-current" />
                  <span>Play Auto-Tour</span>
                </>
              )}
            </button>

            {/* Studio Theme Switcher (Executive Light vs Cyber Deck) */}
            <button
              type="button"
              onClick={() => setStudioTheme((prev) => (prev === "light" ? "cyber" : "light"))}
              className="border-border/80 bg-surface/90 text-foreground hover:border-primary/40 hover:bg-muted/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold shadow-xs transition-all"
              title="Toggle Executive Light vs Cyber Dark Deck"
            >
              {isCyber ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Executive Glass</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="hidden sm:inline">Cyber Ops Deck</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3D Spatial Glass Studio Canvas Container */}
        <div
          className="relative mx-auto mt-10 w-full max-w-5xl [perspective:1200px]"
          ref={stageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Ambient Rim Glow */}
          <div
            className={`pointer-events-none absolute -inset-6 -z-10 rounded-[32px] blur-3xl transition-all duration-700 ${
              isCyber
                ? "bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-indigo-700/20 opacity-50"
                : "from-primary/15 bg-gradient-to-tr via-blue-500/15 to-cyan-400/15 opacity-35"
            }`}
            aria-hidden="true"
          />

          {/* Floating 3D Spatial Glass Badge 1 (Top-Left: Z-55px) */}
          <motion.div
            style={{
              transform: shouldReduceMotion
                ? "none"
                : `translateZ(55px) translateX(${mousePos.x * 14}px) translateY(${mousePos.y * 14}px)`,
              transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className={`pointer-events-none absolute -top-5 -left-4 z-30 hidden items-center gap-2.5 overflow-hidden rounded-2xl border px-4 py-2 text-xs font-semibold shadow-[0_16px_36px_-6px_rgba(0,0,0,0.14)] backdrop-blur-2xl sm:flex ${
              isCyber
                ? "border-cyan-500/40 bg-[#0b1329]/95 text-cyan-300"
                : "bg-surface/95 text-foreground border-border/80 dark:border-white/15"
            }`}
          >
            {/* Specular Rim */}
            <div
              className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
              aria-hidden="true"
            />
            <div className="from-primary/15 to-primary/5 text-primary border-primary/20 flex h-6.5 w-6.5 items-center justify-center rounded-lg border bg-gradient-to-br shadow-2xs">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider uppercase opacity-75">
                Engine Status
              </p>
              <p className="text-xs font-extrabold">
                {activeTab === "scheduling" && `Buffer Protection: Active (+${bufferMinutes}m)`}
                {activeTab === "crm" && "LTV Intelligence: 100% Synced"}
                {activeTab === "invoicing" && "Direct Payout: Stripe Connected"}
                {activeTab === "security" && "Tenant Shards: Cryptographically Isolated"}
              </p>
            </div>
          </motion.div>

          {/* Floating 3D Spatial Glass Badge 2 (Bottom-Right: Z-65px) */}
          <motion.div
            style={{
              transform: shouldReduceMotion
                ? "none"
                : `translateZ(65px) translateX(${-mousePos.x * 16}px) translateY(${-mousePos.y * 16}px)`,
              transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className={`pointer-events-none absolute -right-4 -bottom-5 z-30 hidden items-center gap-2.5 overflow-hidden rounded-2xl border px-4 py-2 text-xs font-semibold shadow-[0_16px_36px_-6px_rgba(0,0,0,0.14)] backdrop-blur-2xl sm:flex ${
              isCyber
                ? "border-cyan-500/40 bg-[#0b1329]/95 text-cyan-300"
                : "bg-surface/95 text-foreground border-border/80 dark:border-white/15"
            }`}
          >
            {/* Specular Rim */}
            <div
              className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
              aria-hidden="true"
            />
            <span className="flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <div>
              <p className="text-[10px] font-bold tracking-wider uppercase opacity-75">
                Operational Guarantee
              </p>
              <p className="text-xs font-extrabold text-emerald-500">
                Zero Meeting Collisions &bull; Buffer Guard Active
              </p>
            </div>
          </motion.div>

          {/* Main 3D Tilting Glass Hardware Studio Window */}
          <div
            style={{
              transform: shouldReduceMotion
                ? "none"
                : `rotateY(${mousePos.x * 5}deg) rotateX(${-mousePos.y * 5}deg)`,
              transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
              transformStyle: "preserve-3d",
            }}
            className={`group relative overflow-hidden rounded-3xl border backdrop-blur-2xl transition-all duration-300 ${
              isCyber
                ? "border-cyan-500/40 bg-[#0a0f1d]/95 text-slate-100 shadow-[0_30px_70px_-15px_rgba(6,182,212,0.30)]"
                : "border-border/80 bg-surface/95 text-foreground hover:border-primary/50 shadow-[0_30px_70px_-15px_rgba(49,95,232,0.18),0_12px_28px_-6px_rgba(0,0,0,0.06)] hover:shadow-[0_35px_85px_-12px_rgba(49,95,232,0.25)]"
            }`}
          >
            {/* Top Specular Rim Reflection Beam */}
            <div
              className={`pointer-events-none absolute inset-x-12 top-0 z-20 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent ${
                isCyber ? "via-cyan-400/80" : "via-white/80"
              }`}
              aria-hidden="true"
            />

            {/* macOS Frosted Glass Browser Bar */}
            <div
              className={`flex items-center justify-between border-b px-4 py-3 backdrop-blur-xl ${
                isCyber ? "border-cyan-500/25 bg-[#080d19]/80" : "border-border/80 bg-muted/65"
              }`}
            >
              {/* Traffic Light Glass Dots */}
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-rose-600/30 bg-rose-500/80 shadow-xs" />
                <span className="h-3 w-3 rounded-full border border-amber-500/30 bg-amber-400/80 shadow-xs" />
                <span className="h-3 w-3 rounded-full border border-emerald-600/30 bg-emerald-500/80 shadow-xs" />
              </div>

              {/* Secure URL Bar */}
              <div
                className={`flex items-center gap-2 rounded-full border px-4 py-1 font-mono text-xs shadow-2xs ${
                  isCyber
                    ? "border-cyan-500/30 bg-[#0c1427] text-cyan-200"
                    : "border-border/70 bg-background/95 text-muted-foreground"
                }`}
              >
                <Lock className="text-primary h-3 w-3 shrink-0" />
                <span className="xs:max-w-[220px] max-w-[140px] truncate font-medium sm:max-w-none">
                  app.flowpilot.io/workspace/acme-agency/{activeTab}
                </span>
              </div>

              {/* Global Latency Indicator */}
              <div className="flex items-center gap-1.5 text-xs opacity-80">
                <Activity className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
                <span className="hidden font-medium sm:inline">24ms Latency</span>
              </div>
            </div>

            {/* INTERACTIVE CANVASES */}
            <div className="min-h-[520px] p-4 sm:p-8">
              <AnimatePresence mode="wait">
                {/* 1. VISUAL SMART SCHEDULING CANVAS WITH REAL BUFFER SLIDER */}
                {activeTab === "scheduling" && (
                  <motion.div
                    key="visual-scheduling"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Top Canvas Bar & Interactive Buffer Slider */}
                    <div
                      className={`flex flex-col gap-3 border-b pb-3.5 sm:flex-row sm:items-center sm:justify-between ${
                        isCyber ? "border-cyan-500/25" : "border-border/50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold sm:text-lg">
                            Visual Daily Calendar & Dynamic Buffer Engine
                          </h3>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                            3 Sessions Booked
                          </span>
                        </div>
                        <p className="text-xs opacity-75">
                          Drag slider below to see how FlowPilot auto-adjusts padding between
                          meetings in real time.
                        </p>
                      </div>

                      {/* The Interactive Dynamic Buffer Slider */}
                      <div className="bg-muted/60 border-border/70 flex items-center gap-2 rounded-xl border p-1.5">
                        <span className="pl-1 text-[11px] font-bold opacity-80">
                          Buffer Interval:
                        </span>
                        <div className="bg-background inline-flex rounded-lg p-0.5 shadow-2xs">
                          {([0, 15, 30] as const).map((mins) => (
                            <button
                              key={mins}
                              type="button"
                              onClick={() => setBufferMinutes(mins)}
                              className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                                bufferMinutes === mins
                                  ? mins === 0
                                    ? "bg-rose-500 text-white shadow-xs"
                                    : mins === 15
                                      ? "bg-emerald-600 text-white shadow-xs"
                                      : "bg-cyan-600 text-white shadow-xs"
                                  : "opacity-70 hover:opacity-100"
                              }`}
                            >
                              {mins}m
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Meeting Card 1 */}
                    <div
                      className={`rounded-2xl border p-4 transition-all duration-300 ${
                        isCyber
                          ? "border-cyan-500/30 bg-[#0f172a]/80 shadow-md"
                          : "border-border/80 bg-background/90 shadow-xs"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/15 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-extrabold shadow-xs">
                            09:00
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold">Enterprise Strategic Briefing</h4>
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                                Confirmed
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs opacity-75">
                              Client: <strong>Apex Solutions Inc.</strong> &bull; Lead: Sarah Chen
                              &bull; Duration: 60 min
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start font-mono text-xs font-medium opacity-80 sm:self-center">
                          <Video className="text-primary h-4 w-4" />
                          <span>09:00 AM – 10:00 AM</span>
                        </div>
                      </div>
                    </div>

                    {/* THE REAL DYNAMIC BUFFER BRIDGE (SHIFTS PHYSICAL HEIGHT & PADDING ACCORDING TO SLIDER) */}
                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className={`relative flex items-center justify-between rounded-xl border border-dashed px-5 transition-all duration-300 ${
                        bufferMinutes === 0
                          ? "border-rose-500/60 bg-rose-500/10 py-2 text-rose-600 shadow-rose-500/10 dark:text-rose-400"
                          : bufferMinutes === 15
                            ? "border-emerald-500/60 bg-emerald-500/15 py-3.5 text-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.20)] dark:text-emerald-300"
                            : "border-cyan-500/60 bg-cyan-500/15 py-5 text-cyan-700 shadow-[0_0_24px_rgba(6,182,212,0.25)] dark:text-cyan-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-xs font-bold">
                        {bufferMinutes === 0 ? (
                          <AlertTriangle className="h-4 w-4 animate-bounce text-rose-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-emerald-500" />
                        )}
                        <span>
                          {bufferMinutes === 0 &&
                            "⚠️ 0m BUFFER DANGER: Back-to-back overlap! High fatigue risk, zero time to summarize notes or prepare."}
                          {bufferMinutes === 15 &&
                            "✓ FLOWPILOT CALM BUFFER (+15m): Clean transition window. Zero collisions across 6 consultants!"}
                          {bufferMinutes === 30 &&
                            "✨ EXTENDED RECHARGE (+30m): Deep work window for client deliverable reviews and travel."}
                        </span>
                      </div>
                      <span className="bg-background rounded-full px-3 py-1 font-mono text-[11px] font-extrabold shadow-xs">
                        {bufferMinutes === 0
                          ? "0m Gap (High Risk)"
                          : bufferMinutes === 15
                            ? "10:00 – 10:15 AM (+15m)"
                            : "10:00 – 10:30 AM (+30m)"}
                      </span>
                    </motion.div>

                    {/* Meeting Card 2 (Dynamically moves start time based on slider!) */}
                    <div
                      className={`rounded-2xl border p-4 transition-all duration-300 ${
                        isCyber
                          ? "border-cyan-500/30 bg-[#0f172a]/80 shadow-md"
                          : "border-border/80 bg-background/90 shadow-xs"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 font-mono text-xs font-extrabold text-blue-500 shadow-xs">
                            {bufferMinutes === 0
                              ? "10:00"
                              : bufferMinutes === 15
                                ? "10:15"
                                : "10:30"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold">
                                Operations Milestone Architecture Review
                              </h4>
                              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-500">
                                In Progress
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs opacity-75">
                              Client: <strong>Meridian Health Group</strong> &bull; Lead: Marcus
                              Vance &bull; Duration: 45 min
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start font-mono text-xs font-medium opacity-80 sm:self-center">
                          <Clock className="text-primary h-4 w-4" />
                          <span>
                            {bufferMinutes === 0 && "10:00 AM – 10:45 AM"}
                            {bufferMinutes === 15 && "10:15 AM – 11:00 AM"}
                            {bufferMinutes === 30 && "10:30 AM – 11:15 AM"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. CLIENT CRM 360° CANVAS WITH SPARKLINE & CIRCULAR GAUGE */}
                {activeTab === "crm" && (
                  <motion.div
                    key="visual-crm"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div
                      className={`flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between ${
                        isCyber ? "border-cyan-500/25" : "border-border/50"
                      }`}
                    >
                      <div>
                        <h3 className="text-base font-extrabold sm:text-lg">
                          Client Relationship Dossier & Health Intelligence
                        </h3>
                        <p className="text-xs opacity-75">
                          Comprehensive customer context: LTV metrics, automated health scoring, and
                          contracts.
                        </p>
                      </div>

                      {/* Interactive Client Selector Pills */}
                      <div className="border-border/70 bg-muted/50 inline-flex rounded-full border p-1 shadow-2xs">
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
                              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                                isSel
                                  ? "bg-primary text-white shadow-xs"
                                  : "opacity-70 hover:opacity-100"
                              }`}
                            >
                              {labels[key]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Client Dossier Hero Grid */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {/* Health Score Circular Gauge Card */}
                      <div
                        className={`flex flex-col items-center rounded-2xl border p-5 text-center shadow-xs ${
                          isCyber
                            ? "border-cyan-500/30 bg-[#0f172a]/80"
                            : "border-border/80 bg-background/90"
                        }`}
                      >
                        <p className="text-xs font-bold tracking-wider uppercase opacity-75">
                          Relationship Health
                        </p>

                        {/* Circular SVG Ring */}
                        <div className="relative mt-3 flex items-center justify-center">
                          <svg className="h-28 w-28 -rotate-90 transform" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              className={isCyber ? "stroke-slate-800" : "stroke-muted"}
                              strokeWidth="10"
                              fill="transparent"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              className="stroke-emerald-500"
                              strokeWidth="10"
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
                            <span className="text-2xl font-black">
                              {selectedClient === "apex"
                                ? "98%"
                                : selectedClient === "meridian"
                                  ? "94%"
                                  : "99%"}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-500">
                              Exceptional
                            </span>
                          </div>
                        </div>

                        <p className="mt-2 text-xs opacity-75">
                          Avg Response: <strong>12 min</strong> &bull; Zero escalations
                        </p>
                      </div>

                      {/* 6-Month Revenue Sparkline Card */}
                      <div
                        className={`flex flex-col justify-between rounded-2xl border p-5 shadow-xs ${
                          isCyber
                            ? "border-cyan-500/30 bg-[#0f172a]/80"
                            : "border-border/80 bg-background/90"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold tracking-wider uppercase opacity-75">
                            6-Month Retainer Growth
                          </p>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="font-mono text-2xl font-black">
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
                            <span className="text-xs font-bold text-emerald-500">+22.4%</span>
                          </div>
                        </div>

                        {/* Visual SVG Sparkline Chart */}
                        <div className="mt-3 h-20 w-full">
                          <svg
                            className="h-full w-full overflow-visible"
                            viewBox="0 0 200 60"
                            preserveAspectRatio="none"
                          >
                            <defs>
                              <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#315fe8" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#315fe8" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M0,50 Q40,40 70,32 T140,20 T200,8 L200,60 L0,60 Z"
                              fill="url(#sparklineGrad)"
                            />
                            <path
                              d="M0,50 Q40,40 70,32 T140,20 T200,8"
                              fill="none"
                              stroke="#315fe8"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                            <circle cx="200" cy="8" r="4" fill="#315fe8" />
                          </svg>
                        </div>

                        <div className="border-border/60 flex justify-between border-t pt-2 text-[11px] opacity-75">
                          <span>Apr: {formatCurrency(18200)}</span>
                          <span>Sep: {formatCurrency(34850)}</span>
                        </div>
                      </div>

                      {/* Account Lead & Contract Card */}
                      <div
                        className={`flex flex-col justify-between rounded-2xl border p-5 shadow-xs ${
                          isCyber
                            ? "border-cyan-500/30 bg-[#0f172a]/80"
                            : "border-border/80 bg-background/90"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold tracking-wider uppercase opacity-75">
                              VIP Contract Tier
                            </p>
                            <span className="bg-primary/15 text-primary rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                              Enterprise Retainer
                            </span>
                          </div>

                          <div className="mt-3 space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="opacity-75">Primary Contact:</span>
                              <span className="font-semibold">Alex Vance (COO)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="opacity-75">Account Lead:</span>
                              <span className="text-primary font-semibold">
                                {selectedClient === "apex"
                                  ? "Sarah Chen"
                                  : selectedClient === "meridian"
                                    ? "Marcus Vance"
                                    : "Elena Rostova"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="opacity-75">Renewal Date:</span>
                              <span className="font-semibold text-emerald-500">Auto-renews Q4</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-border/60 mt-4 flex gap-2 border-t pt-3">
                          <button
                            type="button"
                            className="bg-primary/10 text-primary hover:bg-primary/20 w-full rounded-lg py-1.5 text-xs font-bold transition-colors"
                          >
                            Book Session
                          </button>
                          <button
                            type="button"
                            className="bg-muted hover:bg-muted/80 w-full rounded-lg py-1.5 text-xs font-bold transition-colors"
                          >
                            View Invoices
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. INVOICE TERMINAL CANVAS WITH STRIPE STAMP & CURRENCY SWITCHER */}
                {activeTab === "invoicing" && (
                  <motion.div
                    key="visual-invoicing"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Top Controls Bar */}
                    <div
                      className={`flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between ${
                        isCyber ? "border-cyan-500/25" : "border-border/50"
                      }`}
                    >
                      <div>
                        <h3 className="text-base font-extrabold sm:text-lg">
                          Digital Virtual Invoice Terminal & Stripe Settlement
                        </h3>
                        <p className="text-xs opacity-75">
                          Direct 1-click conversion from completed hours into itemized settlement.
                        </p>
                      </div>

                      {/* Currency Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold opacity-80">Currency:</span>
                        <div className="border-border/70 bg-muted/60 inline-flex rounded-lg border p-0.5">
                          {(["USD", "EUR", "GBP"] as const).map((curr) => (
                            <button
                              key={curr}
                              type="button"
                              onClick={() => setCurrency(curr)}
                              className={`rounded px-2.5 py-1 text-xs font-bold transition-all ${
                                currency === curr
                                  ? "bg-primary text-white shadow-2xs"
                                  : "opacity-70 hover:opacity-100"
                              }`}
                            >
                              {curr}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Holographic Virtual Invoice Card */}
                    <div
                      className={`relative overflow-hidden rounded-2xl border p-6 shadow-md backdrop-blur-2xl ${
                        isCyber
                          ? "border-cyan-500/30 bg-[#0c1427]/95"
                          : "bg-background/95 border-white/80"
                      }`}
                    >
                      {/* Top Specular Rim */}
                      <div
                        className="via-primary/50 pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent"
                        aria-hidden="true"
                      />

                      <div className="border-border/60 flex items-start justify-between border-b pb-4">
                        <div className="flex items-center gap-3">
                          <div className="from-primary flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br to-indigo-600 font-bold text-white shadow-xs">
                            FP
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold">FlowPilot Invoice #FP-10892</h4>
                            <p className="text-xs opacity-75">
                              Billed to: <strong>Apex Solutions Inc.</strong> &bull; Due Upon
                              Receipt
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] font-bold tracking-wider uppercase opacity-75">
                            Settlement Currency
                          </p>
                          <p className="font-mono text-sm font-bold">{currency} Direct</p>
                        </div>
                      </div>

                      {/* Itemized Table */}
                      <div className="mt-4 space-y-2 text-xs">
                        <div className="border-border/40 flex justify-between border-b py-1 font-semibold opacity-75">
                          <span>Description</span>
                          <span>Hours & Rate</span>
                          <span>Total</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="font-medium">Monthly Strategic Advisory Retainer</span>
                          <span className="font-mono opacity-75">
                            20 hrs @ {formatCurrency(175)}/hr
                          </span>
                          <span className="font-mono font-bold">{formatCurrency(3500)}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="font-medium">
                            Intelligent Buffer Engine Protocol Module
                          </span>
                          <span className="font-mono opacity-75">1 Workspace License</span>
                          <span className="font-mono font-bold">{formatCurrency(280)}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="font-medium">
                            Enterprise Cryptographic Tenant Sharding
                          </span>
                          <span className="font-mono text-emerald-500">Zero Cost (Included)</span>
                          <span className="font-mono font-bold">{formatCurrency(0)}</span>
                        </div>
                      </div>

                      {/* Total & Action Bar */}
                      <div className="border-border/70 mt-5 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-medium opacity-75">Grand Total Due</p>
                          <p className="font-mono text-2xl font-black">
                            <AnimatedAmount amountUsd={3780} currency={currency} decimals={2} />{" "}
                            {currency}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setInvoiceSettled((prev) => !prev)}
                          className={`relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-xs font-extrabold shadow-lg transition-all duration-300 ${
                            invoiceSettled
                              ? "bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-700"
                              : "from-primary shadow-primary/40 bg-gradient-to-r via-blue-600 to-indigo-600 text-white hover:scale-105"
                          }`}
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>
                            {invoiceSettled
                              ? "✓ Settle Complete (Stripe)"
                              : "Simulate 1-Click Settlement"}
                          </span>
                        </button>
                      </div>

                      {/* HOLOGRAPHIC PAID STAMP OVERLAY */}
                      {invoiceSettled && (
                        <motion.div
                          initial={{ scale: 2, opacity: 0, rotate: -25 }}
                          animate={{ scale: 1, opacity: 1, rotate: -12 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          className="pointer-events-none absolute top-1/3 right-16 rounded-2xl border-4 border-emerald-500 bg-emerald-500/10 px-6 py-2.5 shadow-2xl backdrop-blur-md"
                        >
                          <div className="flex items-center gap-2">
                            <Check className="h-6 w-6 stroke-[3] text-emerald-500" />
                            <div>
                              <p className="text-base font-black tracking-widest text-emerald-500 uppercase">
                                PAID & RECONCILED
                              </p>
                              <p className="font-mono text-[10px] font-bold text-emerald-600">
                                STRIPE CONNECT #TX-892401
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 4. MULTI-TENANT SECURITY & TOPOLOGY CANVAS WITH ANIMATED SVG PACKETS */}
                {activeTab === "security" && (
                  <motion.div
                    key="visual-security"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div
                      className={`flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between ${
                        isCyber ? "border-cyan-500/25" : "border-border/50"
                      }`}
                    >
                      <div>
                        <h3 className="text-base font-extrabold sm:text-lg">
                          Cryptographic Multi-Tenant Database Topology
                        </h3>
                        <p className="text-xs opacity-75">
                          Row-level security (RLS) and isolated data shards ensuring complete tenant
                          privacy.
                        </p>
                      </div>

                      {/* Breach Simulation Trigger */}
                      <button
                        type="button"
                        onClick={() => setBreachTested((prev) => !prev)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                          breachTested
                            ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-500 shadow-xs"
                            : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                        }`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>
                          {breachTested ? "✓ Breach Blocked (403)" : "Simulate Cross-Tenant Access"}
                        </span>
                      </button>
                    </div>

                    {/* Visual Security Architecture Diagram */}
                    <div
                      className={`rounded-2xl border p-5 shadow-xs ${
                        isCyber
                          ? "border-cyan-500/30 bg-[#0f172a]/80"
                          : "border-border/80 bg-background/90"
                      }`}
                    >
                      {/* Central Shard Vault Node */}
                      <div className="flex flex-col items-center text-center">
                        <div className="from-primary relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br to-indigo-600 text-white shadow-[0_0_24px_rgba(49,95,232,0.4)]">
                          <Lock className="h-7 w-7" />
                          <span className="ring-background absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-emerald-400 ring-2" />
                        </div>
                        <h4 className="mt-2 text-sm font-bold">
                          FlowPilot Secure Cryptographic Core
                        </h4>
                        <p className="font-mono text-[11px] opacity-75">
                          Algorithm: AES-256-GCM &bull; Key Derivation: Argon2id
                        </p>
                      </div>

                      {/* Animated Cryptographic Fiber Optic Laser Beams */}
                      <div className="relative my-1 hidden h-10 w-full sm:block" aria-hidden="true">
                        <svg
                          className="h-full w-full overflow-visible"
                          preserveAspectRatio="none"
                          viewBox="0 0 600 40"
                        >
                          <defs>
                            <linearGradient id="beamNormal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#315fe8" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
                            </linearGradient>
                            <linearGradient id="beamBreach" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.9" />
                            </linearGradient>
                          </defs>

                          {/* Branch Left: to Acme Agency */}
                          <path
                            d="M300,0 C300,20 100,20 100,40"
                            fill="none"
                            stroke="url(#beamNormal)"
                            strokeWidth="2"
                            strokeDasharray="6 4"
                            className="animate-[pulse_1.5s_ease-in-out_infinite]"
                          />

                          {/* Branch Center: to Horizon Media (Target of simulated breach test) */}
                          <path
                            d="M300,0 C300,20 300,20 300,40"
                            fill="none"
                            stroke={breachTested ? "url(#beamBreach)" : "url(#beamNormal)"}
                            strokeWidth={breachTested ? "3" : "2"}
                            strokeDasharray={breachTested ? "none" : "6 4"}
                            className={
                              breachTested
                                ? "animate-pulse"
                                : "animate-[pulse_1.5s_ease-in-out_infinite]"
                            }
                          />

                          {/* Branch Right: to Meridian Health */}
                          <path
                            d="M300,0 C300,20 500,20 500,40"
                            fill="none"
                            stroke="url(#beamNormal)"
                            strokeWidth="2"
                            strokeDasharray="6 4"
                            className="animate-[pulse_1.5s_ease-in-out_infinite]"
                          />
                        </svg>
                      </div>

                      {/* Radiating Isolated Tenant Nodes */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="border-primary/30 bg-primary/5 rounded-xl border p-3 text-center">
                          <div className="text-primary mb-1 flex justify-center">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <p className="text-xs font-bold">Acme Agency Shard</p>
                          <p className="mt-0.5 font-mono text-[10px] opacity-75">
                            tenant_id: acme_01
                          </p>
                          <span className="mt-2 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                            RLS Isolated
                          </span>
                        </div>

                        <div className="border-border/70 bg-muted/40 rounded-xl border p-3 text-center">
                          <div className="mb-1 flex justify-center opacity-70">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <p className="text-xs font-bold">Horizon Media Shard</p>
                          <p className="mt-0.5 font-mono text-[10px] opacity-75">
                            tenant_id: horizon_02
                          </p>
                          <span className="mt-2 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                            RLS Isolated
                          </span>
                        </div>

                        <div className="border-border/70 bg-muted/40 rounded-xl border p-3 text-center">
                          <div className="mb-1 flex justify-center opacity-70">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <p className="text-xs font-bold">Meridian Health Shard</p>
                          <p className="mt-0.5 font-mono text-[10px] opacity-75">
                            tenant_id: meridian_03
                          </p>
                          <span className="mt-2 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                            RLS Isolated
                          </span>
                        </div>
                      </div>

                      {/* Breach Simulation Banner */}
                      {breachTested && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/50 bg-emerald-500/15 p-3 text-xs text-emerald-700 dark:text-emerald-300"
                        >
                          <div className="flex items-center gap-2 font-bold">
                            <Check className="h-4 w-4 text-emerald-500" />
                            <span>
                              BREACH SIMULATION INTERCEPTED: Unauthorized cross-tenant query
                              rejected with HTTP 403 Forbidden.
                            </span>
                          </div>
                          <span className="bg-background rounded px-2 py-0.5 font-mono text-[10px] font-bold shadow-2xs">
                            Zero Leakage
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Live Workspace Callout Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border-border/80 bg-surface/90 mx-auto mt-12 flex max-w-5xl flex-col items-center justify-between gap-4 rounded-2xl border p-5 shadow-xs backdrop-blur-xl sm:flex-row sm:px-6"
        >
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Laptop className="h-5 w-5" />
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">
                Want to test the full operational workspace live?
              </p>
              <p className="text-muted-foreground text-xs">
                Experience real-time booking, client records, and itemized billing inside our
                interactive demo.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            className="group shrink-0 rounded-full px-5 text-xs font-semibold shadow-xs"
            asChild
          >
            <Link href="/dashboard" className="gap-1.5">
              <span>Open Live Demo Shell</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </Container>
    </section>
  );
};
