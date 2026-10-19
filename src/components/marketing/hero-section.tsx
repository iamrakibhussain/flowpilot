"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Laptop,
  Calendar,
  DollarSign,
  Users,
  Lock,
  Clock,
  Activity,
  Check,
  LayoutDashboard,
  Zap,
  TrendingUp,
  Video,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CockpitLens = "overview" | "workflow" | "financials";

/**
 * High-performance fluid counting animation helper for hero metrics
 */
const AnimatedCounter: React.FC<{
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}> = ({ target, prefix = "", suffix = "", decimals = 0, duration = 650 }) => {
  const shouldReduceMotion = useReducedMotion();
  const [val, setVal] = React.useState(shouldReduceMotion ? target : 0);

  React.useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const start = performance.now();
    let frameId: number;

    const update = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth ease-out expo curve for organic easing
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const next = target * ease;
      setVal(next);

      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      } else {
        setVal(target);
      }
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration, shouldReduceMotion]);

  return (
    <span>
      {prefix}
      {val.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

export const HeroSection: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [spotlightPos, setSpotlightPos] = React.useState({ x: 300, y: 200 });
  const [cockpitView, setCockpitView] = React.useState<CockpitLens>("overview");
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const pxX = e.clientX - rect.left;
    const pxY = e.clientY - rect.top;
    setMousePos({ x, y });
    setSpotlightPos({ x: pxX, y: pxY });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-12 md:pt-10 md:pb-20">
      {/* Subtle Blueprint Dot Grid Matrix Overlay */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(rgba(49,95,232,0.12)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_70%,transparent_100%)] [background-size:24px_24px] opacity-70 dark:[background-image:radial-gradient(rgba(112,148,250,0.14)_1px,transparent_1px)]"
        aria-hidden="true"
      />

      <Container className="flex flex-col items-center text-center">
        {/* 1. Intelligent Announcement Pill (Frosted Glass & Ambient Glow) */}
        <motion.div
          initial={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="group border-primary/25 bg-surface/85 hover:border-primary/45 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-xs backdrop-blur-xl transition-all hover:scale-[1.02]"
        >
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/10 text-primary h-5.5 gap-1.5 px-2.5 text-[11px] font-semibold"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-primary relative inline-flex h-1.5 w-1.5 rounded-full" />
            </span>
            <span>FlowPilot 2.0</span>
          </Badge>
          <span className="text-muted-foreground hidden sm:inline">&bull;</span>
          <span className="text-foreground/90 hidden sm:inline">
            The Calm Operations Platform for Agencies & Consultancies
          </span>
          <ArrowRight className="text-primary h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </motion.div>

        {/* 2. Primary Headline with Cinematic Blur-In Reveal */}
        <motion.h1
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-foreground mt-5 max-w-4xl text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl md:leading-[1.12]"
        >
          Run Your Client Operations, Scheduling, and Billing from One{" "}
          <span className="from-primary bg-gradient-to-r via-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Calm Command Center
          </span>
        </motion.h1>

        {/* 3. Supporting Value Proposition Copy */}
        <motion.p
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl"
        >
          FlowPilot unifies client relationships, booking schedules, team capacity, and automated
          invoicing into one structured platform—eliminating tool sprawl and administrative chaos.
        </motion.p>

        {/* 4. Dual Call to Action Buttons with Sweeping Shimmer Beam */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="mt-6 flex flex-col items-center justify-center gap-3.5 sm:flex-row md:mt-7"
        >
          {/* Primary CTA with Sweeping Shimmer Beam */}
          <Button
            size="lg"
            className="group bg-primary hover:bg-primary-hover relative h-12 overflow-hidden rounded-full px-7 text-base font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
            asChild
          >
            <Link href="/register" className="flex items-center gap-2">
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"
                aria-hidden="true"
              />
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>

          {/* Secondary CTA Button with Live Demo Ping */}
          <Button
            size="lg"
            variant="outline"
            className="border-border/80 bg-surface/90 hover:border-primary/40 hover:bg-muted/80 h-12 rounded-full px-6 text-base font-medium shadow-xs transition-all active:scale-[0.98]"
            asChild
          >
            <Link href="/dashboard" className="gap-2">
              <Laptop className="text-primary h-4 w-4" />
              <span>Explore Live Workspace</span>
              <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Demo
              </span>
            </Link>
          </Button>
        </motion.div>

        {/* 5. Audience Alignment & Verified Operational Personas */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row sm:gap-3"
        >
          {/* Overlapping Glass Avatars */}
          <div className="flex -space-x-2 overflow-hidden py-0.5">
            <div className="border-background relative h-7 w-7 overflow-hidden rounded-full border-2 shadow-xs transition-transform hover:z-10 hover:scale-110">
              <Image
                src="/images/homepage/founder-sarah.jpg"
                alt="Sarah Jenkins, Creative Agency Founder"
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="border-background relative h-7 w-7 overflow-hidden rounded-full border-2 shadow-xs transition-transform hover:z-10 hover:scale-110">
              <Image
                src="/images/homepage/founder-marcus.jpg"
                alt="Marcus Vance, Operations Director"
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="border-background relative h-7 w-7 overflow-hidden rounded-full border-2 shadow-xs transition-transform hover:z-10 hover:scale-110">
              <Image
                src="/images/homepage/founder-elena.jpg"
                alt="Elena Chen, Principal Consultancy Partner"
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Truthful Product Audience Alignment */}
          <span className="text-muted-foreground text-xs">
            Built for <strong className="text-foreground font-semibold">Agency Founders</strong>,{" "}
            <strong className="text-foreground font-semibold">Operations Directors</strong> &amp;{" "}
            <strong className="text-foreground font-semibold">Service Teams</strong>
          </span>
        </motion.div>

        {/* Micro-Proof Subtext */}
        <p className="text-muted-foreground/80 mt-1 text-xs">
          Zero credit card required &bull; Instant interactive sandbox &bull; Multi-tenant isolated
        </p>

        {/* 6. Enterprise Architectural Trust Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-border/70 bg-surface/75 relative mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 overflow-hidden rounded-2xl border px-6 py-2.5 text-xs shadow-xs backdrop-blur-xl md:mt-5"
        >
          {/* Top Specular Rim Light */}
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
            aria-hidden="true"
          />
          <div className="text-foreground/85 flex items-center gap-1.5">
            <Lock className="text-primary h-3.5 w-3.5" />
            <span className="font-medium">Tenant-Isolated Data Stores</span>
          </div>
          <div className="text-border hidden sm:inline">&bull;</div>
          <div className="text-foreground/85 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-medium">Automated Buffer Logic</span>
          </div>
          <div className="text-border hidden sm:inline">&bull;</div>
          <div className="text-foreground/85 flex items-center gap-1.5">
            <CheckCircle2 className="text-primary h-3.5 w-3.5" />
            <span className="font-medium">One-Click Invoicing</span>
          </div>
          <div className="text-border hidden sm:inline">&bull;</div>
          <div className="text-foreground/85 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-medium">Role-Based Access (RBAC)</span>
          </div>
        </motion.div>

        {/* 7. Interactive Cockpit Mode Lens Selector with Sliding Spring Pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="border-border/80 bg-surface/90 relative mt-6 mb-2 inline-flex items-center gap-1 overflow-hidden rounded-full border p-1.5 shadow-xs backdrop-blur-xl md:mt-7"
          role="tablist"
          aria-label="Cockpit perspective mode"
        >
          {/* Subtle Lens Ambient Top Line */}
          <div
            className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20"
            aria-hidden="true"
          />
          <button
            type="button"
            role="tab"
            aria-selected={cockpitView === "overview"}
            onClick={() => setCockpitView("overview")}
            className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
              cockpitView === "overview"
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cockpitView === "overview" && (
              <motion.div
                layoutId="hero-cockpit-lens-pill"
                className="bg-primary absolute inset-0 rounded-full shadow-xs"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <LayoutDashboard className="relative z-10 h-3.5 w-3.5" />
            <span className="relative z-10">Command Center</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={cockpitView === "workflow"}
            onClick={() => setCockpitView("workflow")}
            className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
              cockpitView === "workflow"
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cockpitView === "workflow" && (
              <motion.div
                layoutId="hero-cockpit-lens-pill"
                className="bg-primary absolute inset-0 rounded-full shadow-xs"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Activity className="relative z-10 h-3.5 w-3.5" />
            <span className="relative z-10">Workflow Engine</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={cockpitView === "financials"}
            onClick={() => setCockpitView("financials")}
            className={`relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
              cockpitView === "financials"
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cockpitView === "financials" && (
              <motion.div
                layoutId="hero-cockpit-lens-pill"
                className="bg-primary absolute inset-0 rounded-full shadow-xs"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <DollarSign className="relative z-10 h-3.5 w-3.5" />
            <span className="relative z-10">Financial Velocity</span>
          </button>
        </motion.div>

        {/* 8. The 3D Spatial Glass Cockpit Window with Multi-Layer Parallax Widgets */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-3 w-full max-w-5xl [perspective:1200px] md:mt-4"
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Subtle Ambient Halo Glow behind Cockpit */}
          <div
            className="from-primary/15 pointer-events-none absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-tr via-cyan-400/10 to-indigo-600/15 opacity-40 blur-3xl transition-opacity duration-700"
            aria-hidden="true"
          />

          {/* Floating 3D Glass Widget 1 (Top-Left: Adaptive Lens Metric) */}
          <motion.div
            initial={{ opacity: 0, x: -24, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.65, delay: 0.65 }}
            style={{
              transform: shouldReduceMotion
                ? "none"
                : `translateZ(55px) translateX(${mousePos.x * 14}px) translateY(${mousePos.y * 14}px)`,
              transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className="border-border/80 bg-surface/95 text-foreground pointer-events-none absolute -top-6 -left-4 z-30 hidden w-70 overflow-hidden rounded-2xl border p-3.5 text-left shadow-[0_16px_36px_-6px_rgba(49,95,232,0.14),0_6px_16px_-2px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:block dark:border-white/15"
          >
            {/* Specular Top Rim Highlight */}
            <div
              className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/30"
              aria-hidden="true"
            />
            <AnimatePresence mode="wait">
              {cockpitView === "overview" && (
                <motion.div
                  key="widget-calendar"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="from-primary/15 to-primary/5 text-primary border-primary/20 flex h-7.5 w-7.5 items-center justify-center rounded-xl border bg-gradient-to-br shadow-2xs">
                        <Calendar className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-foreground text-xs font-bold">8 Scheduled Today</span>
                    </div>
                    <span className="flex h-2 w-2">
                      <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  </div>

                  <div className="border-border/50 mt-2.5 space-y-1.5 border-t pt-2 text-[11px]">
                    <div className="bg-muted/60 flex items-center justify-between rounded-md px-2 py-1">
                      <div className="flex items-center gap-1.5">
                        <Video className="text-primary h-3 w-3" />
                        <span className="text-foreground font-medium">Acme Strategy Call</span>
                      </div>
                      <span className="text-primary font-mono font-semibold">10:30 AM</span>
                    </div>
                    <div className="text-muted-foreground flex items-center justify-between text-[10px]">
                      <span>Buffer Logic</span>
                      <span className="font-medium text-emerald-600">+15m Protected</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {cockpitView === "workflow" && (
                <motion.div
                  key="widget-buffer"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600">
                        <Zap className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-foreground text-xs font-bold">Buffer Engine</span>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      Active
                    </span>
                  </div>

                  <div className="border-border/50 mt-2.5 border-t pt-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Auto-buffer</span>
                      <span className="text-foreground font-semibold">+15m between sessions</span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-[10px]">
                      Zero calendar collisions across 6 consultants
                    </p>
                  </div>
                </motion.div>
              )}

              {cockpitView === "financials" && (
                <motion.div
                  key="widget-mrr"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                        <TrendingUp className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                          Monthly Retainers
                        </p>
                        <p className="text-foreground text-sm font-extrabold">
                          <AnimatedCounter target={48250} prefix="$" decimals={2} />
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      +24%
                    </span>
                  </div>

                  <div className="border-border/50 text-muted-foreground mt-2.5 flex items-center justify-between border-t pt-2 text-[10px]">
                    <span>18 Active Retainers</span>
                    <span className="font-medium text-emerald-600">0 Overdue</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Floating 3D Glass Widget 2 (Bottom-Right: Automated Settlement) */}
          <motion.div
            initial={{ opacity: 0, x: 24, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.65, delay: 0.75 }}
            style={{
              transform: shouldReduceMotion
                ? "none"
                : `translateZ(65px) translateX(${-mousePos.x * 16}px) translateY(${-mousePos.y * 16}px)`,
              transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className="border-border/80 bg-surface/95 text-foreground pointer-events-none absolute -right-4 -bottom-6 z-30 hidden w-72 overflow-hidden rounded-2xl border p-3.5 text-left shadow-[0_16px_36px_-6px_rgba(16,185,129,0.14),0_6px_16px_-2px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:block dark:border-white/15"
          >
            {/* Specular Top Rim Highlight */}
            <div
              className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent dark:via-white/30"
              aria-hidden="true"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7.5 w-7.5 items-center justify-center rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 text-emerald-600 shadow-2xs">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                    Invoice Settled
                  </p>
                  <p className="text-foreground text-sm font-extrabold">$3,780.00 USD</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-600 uppercase">
                Paid
              </span>
            </div>

            <div className="border-border/50 text-muted-foreground mt-2.5 flex items-center justify-between border-t pt-2 text-[10px]">
              <span>Horizon Media &bull; Retainer Q4</span>
              <span className="flex items-center gap-1 font-medium text-emerald-600">
                <Check className="h-3 w-3" /> Auto-reconciled
              </span>
            </div>
          </motion.div>

          {/* Floating 3D Glass Widget 3 (Bottom-Left: Team Utilization Meter) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.85 }}
            style={{
              transform: shouldReduceMotion
                ? "none"
                : `translateZ(45px) translateX(${mousePos.x * 10}px) translateY(${mousePos.y * 10}px)`,
              transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className="border-border/80 bg-surface/95 text-foreground pointer-events-none absolute -bottom-5 left-10 z-20 hidden w-60 overflow-hidden rounded-2xl border p-3.5 text-left shadow-[0_14px_30px_-6px_rgba(49,95,232,0.12),0_4px_14px_-2px_rgba(0,0,0,0.06)] backdrop-blur-2xl lg:block dark:border-white/15"
          >
            {/* Specular Top Rim Highlight */}
            <div
              className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/30"
              aria-hidden="true"
            />
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <div className="from-primary/15 to-primary/5 text-primary border-primary/20 flex h-6 w-6 items-center justify-center rounded-lg border bg-gradient-to-br shadow-2xs">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <span>Team Utilization</span>
              </div>
              <span className="text-primary font-bold">84%</span>
            </div>
            {/* Dynamic Dual-Tone Progress Meter */}
            <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
              <div className="from-primary h-full w-[84%] rounded-full bg-gradient-to-r via-blue-500 to-emerald-500" />
            </div>
            <div className="text-muted-foreground mt-1.5 flex items-center justify-between text-[10px]">
              <span>5 of 6 booked</span>
              <span className="font-medium text-emerald-600">1 Lead Ready</span>
            </div>
          </motion.div>

          {/* Main 3D Tilting Glass Cockpit Window */}
          <div
            style={{
              transform: shouldReduceMotion
                ? "none"
                : `rotateY(${mousePos.x * 5}deg) rotateX(${-mousePos.y * 5}deg)`,
              transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
              transformStyle: "preserve-3d",
            }}
            className="group border-border/80 bg-surface/95 hover:border-primary/45 relative overflow-hidden rounded-3xl border shadow-[0_25px_60px_-15px_rgba(49,95,232,0.18),0_12px_28px_-6px_rgba(0,0,0,0.06)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_32px_75px_-12px_rgba(49,95,232,0.25)]"
          >
            {/* Specular Rim Reflection Beam */}
            <div
              className="pointer-events-none absolute inset-x-12 top-0 z-20 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
              aria-hidden="true"
            />

            {/* Dynamic Cursor Spotlight Glare */}
            <div
              className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `radial-gradient(600px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(49, 95, 232, 0.12), transparent 50%)`,
              }}
              aria-hidden="true"
            />

            {/* macOS Frosted Glass Window Header Bar */}
            <div className="border-border/80 bg-muted/65 flex items-center justify-between border-b px-4 py-3 backdrop-blur-xl">
              {/* Traffic Light Glass Dots */}
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-rose-600/30 bg-rose-500/80 shadow-xs" />
                <span className="h-3 w-3 rounded-full border border-amber-500/30 bg-amber-400/80 shadow-xs" />
                <span className="h-3 w-3 rounded-full border border-emerald-600/30 bg-emerald-500/80 shadow-xs" />
              </div>

              {/* Secure Workspace Domain Pill */}
              <div className="border-border/70 bg-background/95 text-muted-foreground flex items-center gap-2 rounded-full border px-4 py-1 font-mono text-xs shadow-xs">
                <Lock className="text-primary h-3 w-3" />
                <span className="text-foreground/80 truncate font-medium">
                  app.flowpilot.io/workspace/acme-agency
                </span>
              </div>

              {/* Live Workspace Status */}
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Activity className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
                <span className="text-foreground/80 hidden font-medium sm:inline">
                  Workspace Active
                </span>
              </div>
            </div>

            {/* Application Dashboard Visual Preview (Dynamic Lens Switching) */}
            <div className="bg-muted/20 relative aspect-[16/9] w-full">
              <AnimatePresence mode="wait">
                {cockpitView === "workflow" ? (
                  <motion.div
                    key="view-workflow"
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-full w-full"
                  >
                    <Image
                      src="/images/homepage/flowpilot-operations-workflow.jpg"
                      alt="FlowPilot operations workflow showing client onboarding, buffer management, and automatic invoice reconciliation"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1120px"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="view-dashboard"
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-full w-full"
                  >
                    <Image
                      src="/images/homepage/flowpilot-hero-dashboard.jpg"
                      alt="FlowPilot unified business operations dashboard showing appointment scheduling calendar, client CRM cards, team capacity meters, and invoice summary"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1120px"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Financial Velocity Glass Overlay HUD when financials lens is selected */}
              {cockpitView === "financials" && (
                <motion.div
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
                  exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  transition={{ duration: 0.3 }}
                  className="from-background/90 via-background/40 absolute inset-0 flex flex-col justify-end bg-gradient-to-t to-transparent p-3 text-left sm:p-6"
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="border-border/80 bg-surface/95 relative overflow-hidden rounded-2xl border p-3.5 shadow-lg backdrop-blur-xl dark:border-white/15">
                      <div
                        className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/30"
                        aria-hidden="true"
                      />
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                        MTD Billing
                      </p>
                      <p className="text-foreground text-lg font-bold sm:text-xl">
                        <AnimatedCounter target={48250} prefix="$" decimals={2} />
                      </p>
                      <span className="text-[10px] font-medium text-emerald-600">
                        +24% vs Prev Mo
                      </span>
                    </div>
                    <div className="border-border/80 bg-surface/95 relative overflow-hidden rounded-2xl border p-3.5 shadow-lg backdrop-blur-xl dark:border-white/15">
                      <div
                        className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/30"
                        aria-hidden="true"
                      />
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                        Billable Ratio
                      </p>
                      <p className="text-foreground text-lg font-bold sm:text-xl">
                        <AnimatedCounter target={92.4} suffix="%" decimals={1} />
                      </p>
                      <span className="text-primary text-[10px] font-medium">Target: 85%</span>
                    </div>
                    <div className="border-border/80 bg-surface/95 relative overflow-hidden rounded-2xl border p-3.5 shadow-lg backdrop-blur-xl dark:border-white/15">
                      <div
                        className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/30"
                        aria-hidden="true"
                      />
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                        Avg Booking Lead
                      </p>
                      <p className="text-foreground text-lg font-bold sm:text-xl">1.8 Days</p>
                      <span className="text-[10px] font-medium text-emerald-600">
                        Zero Idle Time
                      </span>
                    </div>
                    <div className="border-border/80 bg-surface/95 relative overflow-hidden rounded-2xl border p-3.5 shadow-lg backdrop-blur-xl dark:border-white/15">
                      <div
                        className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/30"
                        aria-hidden="true"
                      />
                      <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                        Payout Velocity
                      </p>
                      <p className="text-foreground text-lg font-bold sm:text-xl">Instant</p>
                      <span className="text-[10px] font-medium text-emerald-600">
                        Stripe Connected
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Soft Surface Light Glare Sheen on Hover */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden="true"
              />
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
