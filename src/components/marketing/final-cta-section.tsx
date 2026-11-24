"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Laptop,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Check,
  Copy,
  Database,
  Code2,
  Lock,
  Terminal,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils/cn";

export const PRESET_ORGANIZATIONS = [
  {
    label: "Meridian Agency",
    name: "Meridian Agency",
    tag: "Design & Brand",
    accent: "bg-cyan-400",
    glow: "rgba(6,182,212,0.6)",
  },
  {
    label: "Apex Studio",
    name: "Apex Studio",
    tag: "Digital Products",
    accent: "bg-indigo-400",
    glow: "rgba(99,102,241,0.6)",
  },
  {
    label: "Zenith Ops",
    name: "Zenith Ops",
    tag: "Management Consulting",
    accent: "bg-emerald-400",
    glow: "rgba(16,185,129,0.6)",
  },
  {
    label: "Vanguard Partners",
    name: "Vanguard Partners",
    tag: "Advisory Team",
    accent: "bg-purple-400",
    glow: "rgba(168,85,247,0.6)",
  },
];

/**
 * Centralized workspace slug sanitization function.
 * Converts to lowercase alphanumeric characters with a safe 32-character limit.
 * Example: 'Meridian Agency' -> 'meridianagency'
 */
export const sanitizeWorkspaceSlug = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 32);
};

export const FinalCTASection: React.FC = () => {
  const [workspaceSlug, setWorkspaceSlug] = React.useState("meridianagency");
  const [copiedDomain, setCopiedDomain] = React.useState(false);
  const [activePresetIndex, setActivePresetIndex] = React.useState<number>(0);
  const [isInputFocused, setIsInputFocused] = React.useState(false);

  const shouldReduceMotion = useReducedMotion();
  const copyTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Mouse glare tracking for 3D executive master card
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyDomain = async () => {
    const fullDomain = `https://${workspaceSlug || "yourcompany"}.flowpilot.app`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullDomain);
        setCopiedDomain(true);
      } else {
        setCopiedDomain(true);
      }
    } catch {
      setCopiedDomain(false);
      return;
    }

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => {
      setCopiedDomain(false);
    }, 2000);
  };

  const handleSelectPreset = (index: number) => {
    setActivePresetIndex(index);
    setWorkspaceSlug(sanitizeWorkspaceSlug(PRESET_ORGANIZATIONS[index].name));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeWorkspaceSlug(e.target.value);
    setWorkspaceSlug(sanitized);

    const matchedIndex = PRESET_ORGANIZATIONS.findIndex(
      (p) => sanitizeWorkspaceSlug(p.name) === sanitized
    );
    setActivePresetIndex(matchedIndex);
  };

  // Safe registration handoff URL with sanitized workspace slug
  const registrationHref = workspaceSlug
    ? `/register?workspace=${encodeURIComponent(workspaceSlug)}`
    : "/register";

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && typeof window !== "undefined") {
      window.location.href = registrationHref;
    }
  };

  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32"
    >
      {/* 1. Architectural Dot-Grid Background Canvas with Radial Mask */}
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(rgba(56,189,248,0.12)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_60%,transparent_100%)] [background-size:32px_32px] opacity-40"
        aria-hidden="true"
      />

      {/* 2. Layered Celestial Glows Behind Executive Card */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[500px] w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.18)_0%,rgba(99,102,241,0.08)_40%,transparent_70%)] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -z-10 h-72 w-72 max-w-full -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-1/2 bottom-1/4 -z-10 h-72 w-72 max-w-full translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl"
        aria-hidden="true"
      />

      {/* 3. Subtle Horizon Ambient Line */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-3/4 max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
        aria-hidden="true"
      />

      <Container>
        {/* Master Executive Card Container with Multi-Layered Glass, 3D Glare & Specular Accents */}
        <div
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/[0.09] bg-gradient-to-b from-neutral-900/85 via-neutral-950/90 to-black/92 p-4 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9),0_0_90px_rgba(37,99,235,0.15)] backdrop-blur-2xl transition-all duration-300 min-[360px]:p-5 sm:rounded-[2.5rem] sm:p-12 md:p-16"
        >
          {/* Subtle Aerospace Precision Corner Reticles (Hidden on mobile to maximize viewable canvas) */}
          <div
            className="pointer-events-none absolute top-4 left-4 hidden font-mono text-[10px] text-neutral-700/60 select-none sm:block"
            aria-hidden="true"
          >
            + FP-2026 // 08
          </div>
          <div
            className="pointer-events-none absolute top-4 right-4 hidden font-mono text-[10px] text-neutral-700/60 select-none sm:block"
            aria-hidden="true"
          >
            SYS.READY // CLUSTER.US
          </div>
          <div
            className="pointer-events-none absolute bottom-4 left-4 hidden font-mono text-[10px] text-neutral-700/60 select-none sm:block"
            aria-hidden="true"
          >
            TENANT.SCOPED
          </div>
          <div
            className="pointer-events-none absolute right-4 bottom-4 hidden font-mono text-[10px] text-neutral-700/60 select-none sm:block"
            aria-hidden="true"
          >
            ZOD.RUNTIME
          </div>

          {/* Interactive Dynamic Mouse Glare Spotlight */}
          {isHovered && !shouldReduceMotion && (
            <div
              className="pointer-events-none absolute -inset-px transition-opacity duration-300"
              style={{
                background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.12), transparent 70%)`,
              }}
              aria-hidden="true"
            />
          )}

          {/* Dual Specular Top Rim Lighting */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-12 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-[1px]"
            aria-hidden="true"
          />

          {/* Contained Deep Sapphire Ambient Flare */}
          <div
            className="pointer-events-none absolute -top-36 left-1/2 h-72 w-full max-w-2xl -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.25),transparent_70%)] blur-2xl"
            aria-hidden="true"
          />

          {/* Inner Content Composition */}
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            {/* Aerospace Hardware-Grade Eyebrow Badge */}
            <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-neutral-700/60 bg-neutral-900/90 px-3 py-1 text-[10px] font-medium text-neutral-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-md min-[360px]:text-xs sm:gap-2 sm:px-4 sm:py-1.5">
              <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] ring-2 ring-emerald-500/25" />
              </span>
              <span className="font-semibold tracking-wide text-white">
                FlowPilot Operations Stack
              </span>
              <span className="text-neutral-600">•</span>
              <span className="font-mono text-[10px] text-cyan-400 sm:text-[11px]">v2.4 LTS</span>
              <span className="hidden text-neutral-600 sm:inline">•</span>
              <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 sm:inline">
                Live Provisioner Ready
              </span>
            </div>

            {/* Master Editorial Headline with Radiant Metallic Gradient */}
            <h2
              id="cta-heading"
              className="mt-4 text-2xl leading-tight font-extrabold tracking-tight min-[360px]:text-3xl sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl"
            >
              <span className="block bg-gradient-to-b from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent drop-shadow-sm">
                Ready to Bring Operational Calm
              </span>{" "}
              <span className="mt-1 block bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                to Your Business?
              </span>
            </h2>

            {/* Subheadline with Refined Contrast and Semantic Clarity */}
            <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-neutral-300 min-[360px]:text-sm sm:mt-5 sm:text-base md:text-lg">
              Synchronize <span className="font-medium text-white">client dossiers</span>,{" "}
              <span className="font-medium text-white">scheduling</span>,{" "}
              <span className="font-medium text-white">team capacity</span>, and{" "}
              <span className="font-medium text-white">automated invoicing</span> in one calm,
              high-performance workspace.
            </p>

            {/* Masterpiece Mac-Inspired Provisioning Cockpit Box */}
            <div className="relative mx-auto mt-6 max-w-2xl overflow-hidden rounded-xl border border-neutral-700/70 bg-neutral-900/90 p-3 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl min-[360px]:p-4 sm:mt-10 sm:rounded-2xl sm:p-6.5">
              {/* Cockpit Window Title Bar */}
              <div className="flex items-center justify-between gap-2 border-b border-neutral-800/90 pb-2.5 text-xs text-neutral-400 sm:pb-3.5">
                {/* Mac Classic Traffic Dots with Realistic Gloss */}
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] sm:h-3 sm:w-3" />
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] sm:h-3 sm:w-3" />
                  <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] sm:h-3 sm:w-3" />
                  <span className="ml-1 flex items-center gap-1.5 truncate font-mono text-[10px] font-medium text-neutral-400 sm:ml-2 sm:text-[11px]">
                    <Terminal className="h-3 w-3 shrink-0 text-cyan-400" />
                    <span className="hidden min-[480px]:inline">
                      flowpilot-cluster // us-east-1 // provisioner
                    </span>
                    <span className="min-[480px]:hidden">flowpilot // us-east</span>
                  </span>
                </div>

                {/* Live Gateway Telemetry */}
                <div className="flex shrink-0 items-center gap-1.5 font-mono text-[9.5px] text-emerald-400 sm:text-[10.5px]">
                  <span className="relative flex h-2 w-2 items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/25" />
                  </span>
                  <span>Online (14ms)</span>
                </div>
              </div>

              {/* Preset Selector Chips with Physical Cockpit Toggle Styling */}
              <div
                role="group"
                aria-label="Preset workspace organizations"
                className="mt-3.5 sm:mt-4.5"
              >
                <div className="mb-2 flex items-center justify-between text-[10px] font-bold tracking-wider text-neutral-400 uppercase sm:text-[10.5px]">
                  <span>Select Preset Organization:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
                  {PRESET_ORGANIZATIONS.map((preset, idx) => {
                    const isActive = activePresetIndex === idx;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        aria-label={preset.label}
                        aria-pressed={isActive}
                        onClick={() => handleSelectPreset(idx)}
                        className={cn(
                          "focus-visible:ring-primary group/chip relative flex min-w-0 cursor-pointer items-center justify-start gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none sm:gap-2 sm:text-[11.5px]",
                          isActive
                            ? "font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                            : "border border-neutral-800/90 bg-neutral-950/70 text-neutral-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-neutral-700 hover:bg-neutral-800/80 hover:text-white"
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId={shouldReduceMotion ? undefined : "active-cta-preset"}
                            className="absolute inset-0 rounded-xl border border-neutral-500/80 bg-neutral-800/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_4px_12px_rgba(0,0,0,0.6)]"
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          />
                        )}
                        <span
                          className={cn(
                            "relative z-10 h-2 w-2 shrink-0 rounded-full",
                            preset.accent
                          )}
                          style={{ boxShadow: `0 0 8px ${preset.glow}` }}
                        />
                        <span className="relative z-10 truncate font-medium tracking-tight">
                          {preset.label}
                        </span>
                        <span className="relative z-10 hidden rounded border border-neutral-700/60 bg-neutral-900/80 px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-neutral-400 uppercase md:inline">
                          {preset.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Centerpiece: Interactive Subdomain Provisioning Bar */}
              <div
                className={cn(
                  "relative mt-3.5 flex flex-col gap-2 overflow-hidden rounded-xl border bg-neutral-950 p-2 transition-all duration-200 sm:mt-4.5 sm:flex-row sm:items-center sm:p-2.5",
                  isInputFocused
                    ? "border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/40"
                    : "border-neutral-700/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] hover:border-neutral-600"
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden px-1.5 font-mono text-xs sm:gap-2 sm:px-2 sm:text-sm">
                  {/* SSL Security Shield */}
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)] sm:h-7 sm:w-7">
                    <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </div>
                  <span className="hidden shrink-0 font-medium text-emerald-400/90 min-[480px]:inline">
                    https://
                  </span>
                  <input
                    id="workspace-slug-input"
                    type="text"
                    value={workspaceSlug}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="yourcompany"
                    className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-white outline-none placeholder:text-neutral-600 sm:text-sm"
                    aria-label="Workspace domain slug preview"
                    maxLength={32}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <span className="shrink-0 text-xs font-semibold text-neutral-400 sm:text-sm">
                    .flowpilot.app
                  </span>
                </div>

                {/* Live Availability Badge & Tactile 1-Click Copy Button */}
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <span className="hidden items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-emerald-400 shadow-2xs md:inline-flex">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Available</span>
                  </span>

                  {/* Micro-Machined Tactile Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    aria-label={
                      copiedDomain ? "Copied domain to clipboard" : "Copy proposed workspace domain"
                    }
                    className={cn(
                      "focus-visible:ring-primary relative flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none active:scale-95 sm:w-auto sm:px-4",
                      copiedDomain
                        ? "border border-emerald-500/80 bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] ring-2 ring-emerald-400/50"
                        : "border border-neutral-700/90 bg-gradient-to-b from-neutral-800 to-neutral-900 text-neutral-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_6px_rgba(0,0,0,0.4)] hover:border-neutral-500 hover:from-neutral-700 hover:to-neutral-800 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    )}
                  >
                    {copiedDomain ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-neutral-400 transition-colors group-hover:text-white" />
                        <span>Copy Domain</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Accessible Live Announcement for Screen Readers */}
              <div aria-live="polite" className="sr-only">
                {copiedDomain ? "Proposed workspace domain copied to clipboard" : ""}
              </div>

              {/* Visual Provisioning Pipeline Stepper */}
              <div className="mt-3.5 rounded-xl border border-neutral-800/70 bg-neutral-950/60 p-2 sm:mt-4 sm:p-2.5">
                <div className="grid grid-cols-3 gap-1 text-center sm:gap-2">
                  <div className="flex items-center justify-center gap-1 font-mono text-[9px] text-neutral-400 min-[360px]:text-[10px]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                    <span className="truncate">
                      <span className="hidden min-[380px]:inline">1. Scoped DB</span>
                      <span className="min-[380px]:hidden">1. Scoped</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1 font-mono text-[9px] text-neutral-400 min-[360px]:text-[10px]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                    <span className="truncate">
                      <span className="hidden min-[380px]:inline">2. Zod Verified</span>
                      <span className="min-[380px]:hidden">2. Verified</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1 font-mono text-[9px] text-neutral-400 min-[360px]:text-[10px]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                    <span className="truncate">
                      <span className="hidden min-[380px]:inline">3. Sandbox</span>
                      <span className="min-[380px]:hidden">3. Sandbox</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 3D Glassmorphic Telemetry Pods (Evidence-Backed Architectural Facts) */}
              <div className="mt-3.5 grid grid-cols-1 gap-2 border-t border-neutral-800/80 pt-3 text-left sm:mt-4 sm:grid-cols-3 sm:gap-2.5 sm:pt-3.5">
                <div className="group/pod relative overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-950/80 p-2.5 transition-all duration-200 hover:border-cyan-500/40 hover:bg-neutral-900/60 sm:p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                      <Database className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                      <span className="truncate">Organization Boundary</span>
                    </div>
                    <span className="shrink-0 rounded-full bg-cyan-500/15 px-2 py-0.5 font-mono text-[9px] font-bold text-cyan-400">
                      Scoped
                    </span>
                  </div>
                  <p className="mt-1 text-[10.5px] leading-snug text-neutral-400 sm:text-[11px]">
                    Server-side tenant context &amp; membership checks
                  </p>
                </div>

                <div className="group/pod relative overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-950/80 p-2.5 transition-all duration-200 hover:border-indigo-500/40 hover:bg-neutral-900/60 sm:p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                      <Code2 className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                      <span className="truncate">Typed Runtime</span>
                    </div>
                    <span className="shrink-0 rounded-full bg-indigo-500/15 px-2 py-0.5 font-mono text-[9px] font-bold text-indigo-400">
                      Zod Safe
                    </span>
                  </div>
                  <p className="mt-1 text-[10.5px] leading-snug text-neutral-400 sm:text-[11px]">
                    Strict runtime contract schema validation
                  </p>
                </div>

                <div className="group/pod relative overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-950/80 p-2.5 transition-all duration-200 hover:border-amber-500/40 hover:bg-neutral-900/60 sm:p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                      <Zap className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span className="truncate">Operational Calm</span>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[9px] font-bold text-amber-400">
                      Zero Desync
                    </span>
                  </div>
                  <p className="mt-1 text-[10.5px] leading-snug text-neutral-400 sm:text-[11px]">
                    Unified client CRM, scheduling &amp; invoicing
                  </p>
                </div>
              </div>
            </div>

            {/* High-Impact Master Dual Conversion Actions (Responsive & Proportionate) */}
            <div className="mt-6 flex w-full flex-col items-center justify-center gap-2.5 sm:mt-10 sm:flex-row sm:gap-4">
              {/* Primary Action: High-Luminance White Obsidian Button with Specular Glow & Jewel Arrow Pod */}
              <Link
                href={registrationHref}
                className="group focus-visible:ring-primary relative inline-flex w-full max-w-sm cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 p-[1.5px] shadow-[0_0_25px_rgba(59,130,246,0.35),0_8px_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(59,130,246,0.6),0_12px_28px_rgba(0,0,0,0.5)] focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98] sm:w-auto sm:max-w-none sm:rounded-2xl"
              >
                <div className="relative flex h-full min-h-[46px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-[10.5px] bg-white px-4 py-2.5 text-neutral-950 shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.12)] transition-colors duration-200 group-hover:bg-neutral-50 sm:min-h-[54px] sm:w-auto sm:gap-3.5 sm:rounded-[14.5px] sm:px-7 sm:py-3.5">
                  {/* Subtle Light Sweep Shimmer Effect */}
                  <div
                    className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:animate-[shimmer_2s_infinite] group-hover:opacity-100"
                    aria-hidden="true"
                  />

                  {/* Primary Headline Label */}
                  <span className="text-xs font-extrabold tracking-tight whitespace-nowrap text-neutral-950 min-[360px]:text-sm sm:text-base">
                    Claim Your Workspace
                  </span>

                  {/* Signature Obsidian Arrow Capsule Pod */}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-white shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:scale-105 group-hover:border-blue-500 group-hover:bg-blue-600 sm:h-8 sm:w-8 sm:rounded-xl">
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 sm:h-4 sm:w-4" />
                  </span>
                </div>
              </Link>

              {/* Secondary Action: VisionOS Frosted Crystal Glass Button */}
              <Link
                href="/dashboard"
                className="group focus-visible:ring-primary relative inline-flex w-full max-w-sm cursor-pointer items-center justify-center rounded-xl bg-gradient-to-b from-white/25 via-neutral-700/60 to-neutral-800/40 p-[1px] shadow-[0_8px_20px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.25),0_12px_28px_rgba(0,0,0,0.6)] focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98] sm:w-auto sm:max-w-none sm:rounded-2xl"
              >
                <div className="relative flex h-full min-h-[46px] w-full items-center justify-center gap-2 rounded-[11px] bg-gradient-to-b from-neutral-900/95 via-neutral-950/98 to-black px-3.5 py-2.5 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_-1px_1px_rgba(0,0,0,0.5)] transition-colors duration-200 group-hover:bg-neutral-900/90 sm:min-h-[54px] sm:w-auto sm:gap-3 sm:rounded-[15px] sm:px-6 sm:py-3.5">
                  {/* Cyan Gem Icon Pod */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-400/35 bg-cyan-500/15 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-400/60 group-hover:bg-cyan-500/25 sm:h-8 sm:w-8 sm:rounded-xl">
                    <Laptop className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>

                  {/* Secondary Label */}
                  <span className="truncate text-xs font-semibold text-neutral-100 transition-colors group-hover:text-white min-[360px]:text-sm sm:text-base">
                    Explore Live Workspace Demo
                  </span>

                  {/* Micro Instant Sandbox Badge */}
                  <span className="hidden items-center gap-1.5 rounded-lg border border-neutral-700/90 bg-neutral-800/90 px-2 py-0.5 font-mono text-[10px] font-semibold text-neutral-300 shadow-2xs transition-colors group-hover:border-cyan-500/50 group-hover:text-cyan-300 md:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
                    <span>Sandbox</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Evidence-Backed Architectural Trust Strip */}
            <div className="mt-8 grid grid-cols-1 gap-2 border-t border-neutral-800/90 pt-6 text-xs min-[380px]:grid-cols-2 sm:mt-12 sm:gap-3 sm:pt-8 lg:grid-cols-4">
              <div className="flex items-center gap-2 rounded-xl border border-neutral-800/60 bg-neutral-900/40 p-2 text-neutral-300 shadow-2xs sm:p-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400 sm:h-4 sm:w-4" />
                <span className="text-left text-[10.5px] leading-tight font-medium sm:text-[11px]">
                  Server-side tenant isolation
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-neutral-800/60 bg-neutral-900/40 p-2 text-neutral-300 shadow-2xs sm:p-2.5">
                <Zap className="h-3.5 w-3.5 shrink-0 text-amber-400 sm:h-4 sm:w-4" />
                <span className="text-left text-[10.5px] leading-tight font-medium sm:text-[11px]">
                  Zero credit card required
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-neutral-800/60 bg-neutral-900/40 p-2 text-neutral-300 shadow-2xs sm:p-2.5">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-cyan-400 sm:h-4 sm:w-4" />
                <span className="text-left text-[10.5px] leading-tight font-medium sm:text-[11px]">
                  Interactive dashboard sandbox
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-neutral-800/60 bg-neutral-900/40 p-2 text-neutral-300 shadow-2xs sm:p-2.5">
                <Lock className="h-3.5 w-3.5 shrink-0 text-indigo-400 sm:h-4 sm:w-4" />
                <span className="text-left text-[10.5px] leading-tight font-medium sm:text-[11px]">
                  Role-based team access control
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
