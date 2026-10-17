"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Laptop,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
  Check,
  Copy,
  Database,
  Code2,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const PRESET_ORGANIZATIONS = [
  { label: "Meridian Agency", slug: "meridian-agency", tag: "Design & Brand" },
  { label: "Apex Studio", slug: "apex-studio", tag: "Digital Products" },
  { label: "Zenith Ops", slug: "zenith-ops", tag: "Management Consulting" },
  { label: "Vanguard Partners", slug: "vanguard-partners", tag: "Advisory Team" },
];

export const FinalCTASection: React.FC = () => {
  const [workspaceSlug, setWorkspaceSlug] = React.useState("meridian-agency");
  const [copiedDomain, setCopiedDomain] = React.useState(false);
  const [activePresetIndex, setActivePresetIndex] = React.useState(0);
  const shouldReduceMotion = useReducedMotion();

  const handleCopyDomain = () => {
    const fullDomain = `https://${workspaceSlug || "your-team"}.flowpilot.app`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(fullDomain).then(() => {
        setCopiedDomain(true);
        setTimeout(() => setCopiedDomain(false), 2000);
      });
    } else {
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  const handleSelectPreset = (index: number) => {
    setActivePresetIndex(index);
    setWorkspaceSlug(PRESET_ORGANIZATIONS[index].slug);
  };

  return (
    <section id="cta" className="relative scroll-mt-20 overflow-hidden py-24 md:py-36">
      {/* 1. Atmospheric Celestial Backdrop & Orbital Light Rings */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        {/* Radiant Center Core Glow */}
        <div className="absolute h-[550px] w-[900px] rounded-full bg-gradient-to-r from-primary/20 via-cyan-500/15 to-indigo-500/20 blur-[140px]" />

        {/* Concentric Orbital Rings */}
        <div className="border-primary/10 absolute h-[720px] w-[720px] rounded-full border border-dashed md:h-[900px] md:w-[900px]" />
        <div className="border-cyan-500/10 absolute h-[500px] w-[500px] rounded-full border md:h-[650px] md:w-[650px]" />
        <div className="border-indigo-500/15 absolute h-[320px] w-[320px] rounded-full border border-dashed md:h-[420px] md:w-[420px]" />

        {/* Subtle Ambient Grid Horizon */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:opacity-40 opacity-20" />
      </div>

      <Container>
        {/* 2. Executive 3D Glass Master Card Container */}
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-[#030712] p-6 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.6),0_0_50px_rgba(49,95,232,0.15)] backdrop-blur-2xl sm:p-12 md:p-16 dark:border-white/10">
          {/* Dual Specular Top Rim Accent Line */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/40 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent"
            aria-hidden="true"
          />

          {/* Radial Top Glow Spotlight */}
          <div
            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl"
            aria-hidden="true"
          />

          {/* Inner Content Grid */}
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            {/* Jewel Top Badge */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 shadow-sm backdrop-blur-md"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
                <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                <span className="tracking-wide uppercase text-[11px] font-bold">
                  Unified Operations Engine
                </span>
                <span className="h-1 w-1 rounded-full bg-cyan-400" />
                <span className="font-mono text-[10px] text-cyan-200/90">v2.4 LTS</span>
              </Badge>
            </motion.div>

            {/* Headline with Metallic Silver-to-Cyan Gradient */}
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Ready to Bring Operational
              </span>{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Calm to Your Business?
              </span>
            </h2>

            {/* Subheadline */}
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
              Synchronize client relationships, appointment scheduling, team capacity, and invoice
              settlement in one calm, high-performance workspace.
            </p>

            {/* 3. Interactive Executive Workspace Provisioning Terminal */}
            <div className="relative mx-auto mt-10 max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-xl sm:p-5 dark:border-white/10 dark:bg-slate-950/80">
              {/* Terminal Top Specular Rim */}
              <div
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent"
                aria-hidden="true"
              />

              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs text-slate-400">
                {/* macOS Frosted Traffic Dots */}
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80 shadow-xs" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80 shadow-xs" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 shadow-xs" />
                  <span className="ml-2 font-mono text-[11px] font-medium text-slate-400">
                    provisioner.internal
                  </span>
                </div>

                {/* Edge Node Status */}
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">
                    Edge CDN: 14ms TTFB
                  </span>
                </div>
              </div>

              {/* Preset Selector Chips */}
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mr-1">
                  Preset:
                </span>
                {PRESET_ORGANIZATIONS.map((preset, idx) => {
                  const isActive = activePresetIndex === idx;
                  return (
                    <button
                      key={preset.slug}
                      type="button"
                      onClick={() => handleSelectPreset(idx)}
                      className={cn(
                        "relative overflow-hidden rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all",
                        isActive
                          ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-xs"
                          : "bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:border-slate-600 hover:text-slate-200"
                      )}
                    >
                      {isActive && (
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
                      )}
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Live URL Input Bar */}
              <div className="relative mt-3.5 flex flex-col gap-2 overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-950/90 p-2 sm:flex-row sm:items-center">
                {/* Input Bar Top Specular Highlight */}
                <div
                  className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  aria-hidden="true"
                />

                <div className="flex flex-1 items-center gap-1.5 px-2 font-mono text-xs overflow-hidden">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/15 text-cyan-300">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <span className="shrink-0 text-slate-500 hidden xs:inline">https://</span>
                  <input
                    type="text"
                    value={workspaceSlug}
                    onChange={(e) => {
                      setWorkspaceSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "")
                          .slice(0, 24)
                      );
                      setActivePresetIndex(-1);
                    }}
                    placeholder="your-company"
                    className="min-w-0 flex-1 w-24 sm:w-36 bg-transparent font-semibold text-cyan-300 outline-none placeholder:text-slate-600"
                    aria-label="Workspace domain slug preview"
                  />
                  <span className="shrink-0 text-slate-500">.flowpilot.app</span>
                </div>

                {/* Tactile Copy URL Button */}
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className={cn(
                    "relative flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 overflow-hidden",
                    copiedDomain
                      ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      : "border border-slate-700 bg-slate-800 text-slate-200 hover:border-cyan-400 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
                  {copiedDomain ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-white animate-scale-in" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3 Live Architecture Telemetry Pods */}
              <div className="mt-3.5 grid grid-cols-1 gap-2 pt-1 text-left sm:grid-cols-3">
                {/* Pod 1 */}
                <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
                    <Database className="h-3 w-3 text-emerald-400" />
                    <span>RLS Isolation</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Tenant-isolated PostgreSQL row security
                  </p>
                </div>

                {/* Pod 2 */}
                <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
                    <Code2 className="h-3 w-3 text-cyan-400" />
                    <span>Typed Runtime</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Zod schemas for 100% contract safety
                  </p>
                </div>

                {/* Pod 3 */}
                <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
                    <Zap className="h-3 w-3 text-indigo-400" />
                    <span>Instant Cold Start</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Under 850ms to first live booking
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Dual Conversion Actions */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto">
              {/* Primary Glowing Action Button */}
              <Button
                size="lg"
                className="group relative h-13 w-full sm:w-auto overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-blue-600 to-indigo-600 px-8 text-base font-semibold text-white shadow-[0_0_30px_rgba(49,95,232,0.45)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_45px_rgba(49,95,232,0.65)] active:scale-[0.98]"
                asChild
              >
                <Link href="/login" className="flex items-center justify-center gap-2 relative z-10 w-full sm:w-auto">
                  {/* Top Specular Rim */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
                    aria-hidden="true"
                  />
                  {/* Sweeping Shimmer Beam */}
                  <span
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"
                    aria-hidden="true"
                  />
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>

              {/* Secondary Frosted Glass Button */}
              <Button
                size="lg"
                variant="outline"
                className="group relative h-13 w-full sm:w-auto overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/90 px-7 text-base font-medium text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/80 hover:bg-slate-800 active:scale-[0.98]"
                asChild
              >
                <Link href="/dashboard" className="flex items-center justify-center gap-2.5 relative z-10 w-full sm:w-auto">
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 transition-transform group-hover:scale-110">
                    <Laptop className="h-3.5 w-3.5" />
                  </div>
                  <span>Explore Live Workspace Demo</span>
                </Link>
              </Button>
            </div>

            {/* 5. Classic Enterprise Guarantee & Architectural Trust Strip */}
            <div className="mt-10 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-8 text-xs sm:grid-cols-4">
              {/* Trust Badge 1 */}
              <div className="flex items-center gap-2 text-slate-300">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span className="text-left font-medium text-[11px] leading-tight">
                  Multi-tenant PostgreSQL RLS
                </span>
              </div>

              {/* Trust Badge 2 */}
              <div className="flex items-center gap-2 text-slate-300">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/15 text-amber-400 shadow-2xs">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <span className="text-left font-medium text-[11px] leading-tight">
                  Zero credit card required
                </span>
              </div>

              {/* Trust Badge 3 */}
              <div className="flex items-center gap-2 text-slate-300">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary shadow-2xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <span className="text-left font-medium text-[11px] leading-tight">
                  Instant live interactive demo
                </span>
              </div>

              {/* Trust Badge 4 */}
              <div className="flex items-center gap-2 text-slate-300">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/15 text-cyan-400 shadow-2xs">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <span className="text-left font-medium text-[11px] leading-tight">
                  Full JSON & CSV data export
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
